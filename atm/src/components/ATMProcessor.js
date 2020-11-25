class ATMProcessor {
    constructor(accountDatabase, cardScanner, keypad, cashBank, cashDisburser, monitor, systemClock, render) {
        // Architecture
        this.accountDatabase = accountDatabase;
        this.cardScanner = cardScanner;
        this.keypad = keypad;
        this.cashBank = cashBank;
        this.cashDisburser = cashDisburser;
        this.monitor = monitor;
        this.systemClock = systemClock;
        
        // React specific stuff
        this.render = render;
        this.systemDeployment();
    }

    systemDeployment() {
        this.systemInitialization()
        setInterval(() => {
            if(!this.systemShutdown) {
                this.eventCapture()
                this.eventDispatch()
                this.sysClock()
            }
            this.render()
        })
    }

    systemInitialization() {
        this.PIN = "";
        this.accountNumber = "";
        this.requestedAmount = 0;
        this.maxAllowableWithdraw = 400;
        this.currentEvent = "WELCOME";


        this.welcomed = false;
        this.cardInserted = false;
        this.pinChecked = false;
        this.pinMessageDisplayed = false;
        this.amountMessageDisplayed = false;
        this.amountChecked = false;
        this.balanceVerified = false;
        this.cashAvailiabilityVerified = false;
        this.disbursing = false;
        this.ejecting = false;
        this.cancelled = false;
        this.systemShutdown = false;
        this.cardEjected = false;
        this.systemFailure = false;
    }

    eventCapture() {
        if (this.ejecting) {
            if(!this.cardScanner.ejectCard) {
                this.ejecting = false;
                this.currentEvent = "WELCOME"
            }
        } else if (this.disbursing) {
            if(!this.cashDisburser.disburse) {
                this.disbursing = false;
                this.currentEvent = "EJECT_CARD"
            }
        } else if (this.amountChecked) {
            if(!this.disburser.disburse) {
                this.disbursed = true;
            }
        } else if (this.pinChecked) {
            this.currentEvent = "CHECK_AMOUNT"
        } else if (this.inserted) {
            this.currentEvent = "CHECK_PIN"
        } else if (this.welcomed) {
            if (this.cardScanner.cardInserted) {
                this.inserted = true;
            }
        } 
    }

    eventDispatch() {
        console.log(this.currentEvent)
        switch (this.currentEvent) {
            case "WELCOME":
                this.welcome();
                break;
            case "CHECK_PIN":
                this.checkPIN();
                break;
            case "CHECK_AMOUNT":
                this.checkAmount();
                break;
            case "EJECT_CARD":
                this.ejectCard();
                break;
            default:
        }
        this.currentEvent = null;
    }

    welcome() {
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }
        let message = "Welcome\n";
        message += "Please insert card";
        this.monitor.message = message;
        this.welcomed = true;
    }
    
    checkPIN() {
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }
        if (this.cardScanner.deviceError) {
            this.monitor.message = "Card scanner error";
            this.systemFailure();
        }
        
        this.accountNumber = this.cardScanner.accountNumber
        let message = "Enter PIN:\n"

        if (!this.pinMessageDisplayed) {
            this.keypad.data = 10;
            this.keypad.enter = false;
            this.keypad.cancel = false;
            this.monitor.message = message
            this.pinMessageDisplayed = true;
        }
        

        if(this.keypad.cancel) {
            this.monitor.message = "Transcation cancelled";
            this.cancelled = true;
            this.ejectCard()
            this.keypad.cancel = false;
            return
        }

        if(this.keypad.enter) {
            const account = this.accountDatabase.accounts[this.accountNumber]
            if (account.PIN === this.PIN) {
                this.pinChecked = true;
            } else {
                this.PIN = "";
                this.monitor.message = "Wrong PIN, try again";
            }
            this.keypad.enter = false;
            return
        }

        if(this.keypad.data <= 9) {
            this.PIN += this.keypad.data
            this.keypad.data = 10;
            for(let i = 0; i < this.PIN.length; i++) {
                message += "*";
            }
            this.monitor.message = message;
            return
        }
    }    

    checkAmount() { 
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }

        const account = this.accountDatabase.accounts[this.accountNumber];
        
        let message = "Your balance is $" + account.balance.toFixed(2) + "\n";
        message += "Availiable cash in this ATM is $" + this.cashBank.cash + "\n"
        message += "Max allowable withdraw amount is $" + this.maxAllowableWithdraw + "\n"
        message += "Enter amount to withdraw:\n";
       
        if (!this.amountMessageDisplayed) {
            this.monitor.message = message + "$" + this.requestedAmount;
            this.amountMessageDisplayed = true;
        }

        if(this.keypad.cancel) {
            this.monitor.message = "Transcation cancelled";
            this.cancelled = true;
            this.ejectCard()
            this.keypad.cancel = false;
            return
        }

        if(this.keypad.enter) {
            if (this.requestedAmount <= this.maxAllowableWithdraw) {
                this.amountChecked = true;
                this.verifyAccountBalance();
            } else {
                this.requestedAmount = 0;
                this.monitor.message = "Max allowable withdraw amount reached, try again";
            }
            this.keypad.enter = false
            return
        }

        if (this.keypad.data <= 9) {
            this.requestedAmount = this.requestedAmount * 10 + this.keypad.data;
            this.keypad.data = 10;
            this.monitor.message = message + "$" + this.requestedAmount;
        }

    }

    verifyAccountBalance() {
        console.log(this.requestedAmount) 
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }
        
        const account = this.accountDatabase.accounts[this.accountNumber];
        if (account.balance >= this.requestedAmount) {
            this.balanceVerified = true;
            this.verifyBillAvailiability()
        } else {
            this.monitor.message = "Not enough account balance";
            this.ejectCard()
        }
    }

    verifyBillAvailiability() {
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }
        
        if (this.cashBank.cash >= this.requestedAmount) {
            this.cashAvailiabilityVerified = true;
            this.disburseBill(); 
        } else {
            this.monitor.message = "Not enough cash in this ATM";
            this.ejectCard()
        }
    }

    disburseBill() {
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }

        this.cashDisburser.cash = this.requestedAmount;
        this.cashBank.cash -= this.requestedAmount;
        this.cashDisburser.disburse = true;
        
        const account = this.accountDatabase.accounts[this.accountNumber];
        account.balance -= this.requestedAmount;
        this.monitor.message = "Disbursing";
        this.disbursing = true;
        
        if (this.cashDisburser.deviceError) {
            this.monitor.message = "Disburser error";
            this.systemFailure();
        }

        // This is for mimicing the process of cash disbursing
        setTimeout(() => {
            this.cashDisburser.disburse = false;
            this.cashDisburser.cash = 0;
        }, 500)
    }

    ejectCard() {
        if (this.monitor.deviceError) {
            this.monitor.message = "Monitor error";
            this.systemFailure();
        }
        
        if (this.cardScanner.deviceError) {
            this.monitor.message = "Card scanner error";
            this.systemFailure();
        }
        this.cardScanner.ejectCard = true
        this.ejecting = true

        this.welcomed = false;
        this.inserted = false;
        this.pinChecked = false;
        this.amountChecked = false;
        this.disbursed = false;
        this.pinMessageDisplayed = false;
        this.amountMessageDisplayed = false;
        this.PIN = "";
        this.requestedAmount = 0;
        this.accountNumber = 0;

        setTimeout(() => {
            this.cardScanner.ejectCard = false
            this.cardScanner.cardInserted = false
        }, 1500)
    } 

    sysClock() {
        this.monitor.timestamp = this.systemClock.time;
    }

    systemFailure() {
        this.systemFailure = true;
        this.cardScanner.ejectCard = true;
        this.cardEjected = true;
        this.systemShutdown = true;
    }
}

export default ATMProcessor;