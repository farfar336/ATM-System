class Processor {
    constructor(database, cardScanner, keypad, cashBank, cashDisburser, monitor, clock, render) {
        // System structure
        this.database = database;
        this.cardScanner = cardScanner;
        this.keypad = keypad;
        this.cashBank = cashBank;
        this.cashDisburser = cashDisburser;
        this.monitor = monitor;
        this.clock = clock;

        // Global variables
        this.PIN = "";
        this.requestedAmount = 0;
        this.accounts = 0;
        this.errorMessage = "";
        this.currentEvent = "WELCOME";

        // Status
        this.welcomed = false;
        this.inserted = false;
        this.pinChecked = false;
        this.checkingAmount = false;
        this.amountChecked = false;
        this.balanceVerified = false;
        this.cashAvailiabilityVerified = false;
        this.disbursed = false;
        this.ejected = false;
        this.errorMessage = null;
        
        // React specific stuff
        this.render = render;

        setInterval(() => {
            this.eventCapture();
            this.eventDispatch();
            this.systemClock();
            this.render();
        }, 100)
    }

    eventCapture() {
        console.log(this.pinChecked)
        if (this.ejected) {
            this.ejected = false;
            this.currentEvent = "WELCOME";
        } else if (this.disbursing) {
            if (this.cashDisburser.disbursed) {
                this.currentEvent = "DISBURSED"
            }
        } else if (this.pinChecked) {
            if (this.keypad.cancel) {
                this.pinChecked = false;
                this.keypad.cancel = false;
                this.checkingAmount = false;
                this.monitor.message = "Transcation cancelled";
                this.currentEvent = "CANCEL_TRANSCATION"
            } else {
                this.currentEvent = "CHECK_AMOUNT"
            }
        } else if (this.inserted) {
            if (this.keypad.cancel) {
                this.inserted = false;
                this.keypad.cancel = false;
                this.monitor.message = "Transcation cancelled";
                this.currentEvent = "CANCEL_TRANSCATION"
            } else if (this.keypad.data < 10) {
                this.currentEvent = "CHECK_PIN"
            }
        } else if (this.welcomed) {
            if (this.cardScanner.status) {
                this.welcomed = false;
                this.inserted = true;
                this.account = this.cardScanner.accountNumber; 
                this.keypad.enter = false;
                this.keypad.cancel = false;
                this.keypad.data = 10
                this.monitor.message = "Enter PIN:\n"
            }
        }
    }

    eventDispatch() {
        switch (this.currentEvent) {
            case "WELCOME":
                this.welcome()
                break;
            case "CHECK_PIN":
                this.checkPIN()
                break
            case "CHECK_AMOUNT":
                this.checkAmount();    
                break
            case "DISBURSED":
                this.ejectCard();    
                break
            case "CANCEL_TRANSCATION":
                this.ejectCard();
                break;
            default:
        }
        this.currentEvent = null;
    }

    welcome() {
        this.monitor.message = "Welcome";
        this.welcomed = true;
    }
    
    checkPIN() {
        if (this.PIN.length < 4) {
            this.PIN += this.keypad.data
            this.keypad.data = 10;
        }
        
        let message = "Enter PIN:\n"
        for(let i = 0; i < this.PIN.length; i++) {
            message += "*"
        }
        this.monitor.message = message;
        
        if (this.PIN.length === 4) {
            const account = this.database.accounts[this.account]
            if (account.PIN === this.PIN) {
                this.pinChecked = true;
                this.inserted = false;
            } else {
                this.PIN = "";
                this.monitor.message = "Wrong PIN, try again";
            }
        }
    }    

    checkAmount() { 
        const account = this.database.accounts[this.account];
        const remainMaxAmount = account.maxAllowableWithdraw - account.currentWithdraw;
        
        let message = "Your max withdraw amount is $" + remainMaxAmount + "\n";
        message += "Your balance is $" + account.balance.toFixed(2) + "\n";
        message += "Availiable cash in this ATM is $" + this.cashBank.twentyDollarBills * 20 + "\n"
        message += "Enter withdraw amount which must be a multiple of $20:\n";
       
        if(!this.checkingAmount) {
            this.monitor.message = message + "$" + this.requestedAmount;
            this.checkingAmount = true;
        }
        
        if (this.keypad.data < 10) {
            this.requestedAmount = this.requestedAmount * 10 + this.keypad.data;
            this.keypad.data = 10;
            this.monitor.message = message + "$" + this.requestedAmount;
        } 

        if (!this.keypad.enter) {
            return;
        } else {
            this.keypad.enter = false;
        }

        if (remainMaxAmount >= this.requestedAmount) {
            this.pinChecked = false;
            this.amountChecked = true;
            this.checkingAmount = false;
            this.verifyAccountBalance();
        } else {
            this.requestedAmount = 0;
            this.monitor.message = "Max withdraw amount reached, try again";
        }
    }

    verifyAccountBalance() {
        this.amountChecked = false;
        const account = this.database.accounts[this.account];
        if (account.balance > this.requestedAmount) {
            this.balanceVerified = true;
            this.verifyBillAvailiability()
        } else {
            this.errorMessage = "Not enough account balance";
            this.systemFailure();
        }
    }

    verifyBillAvailiability() {
        this.balanceVerified = false;
        if (this.requestedAmount % 20 !== 0) {
            this.errorMessage = "Amount entered is not in multiple of $20";
            this.systemFailure();
        } else {
            const bills = this.requestedAmount / 20;
            if (this.cashBank.twentyDollarBills > bills) {
                this.cashAvailiabilityVerified = true;
                this.disburseBill(); 
            } else {
                this.errorMessage = "Not enough cash in this ATM";
                this.systemFailure();
            }
        }
    }

    disburseBill() {
        this.cashAvailiabilityVerified = false;
        const bills = this.requestedAmount / 20;
        this.cashDisburser.twentyDollarBills = bills;
        this.cashBank.twentyDollarBills -= bills;

        const account = this.database.accounts[this.account];
        account.balance -= this.requestedAmount;
        account.currentWithdraw += this.requestedAmount;
        this.disbursing = true;
        this.monitor.message = "Disbursing";

        // This is for mimicing the process of cash disbursing
        setTimeout(() => {
            this.cashDisburser.disbursed = true;
            this.cashDisburser.twentyDollarBills = 0;
        }, 500)
    }

    ejectCard() {
        this.requestedAmount = 0;
        this.disbursing = false;
        this.PIN = "";
        this.requestedAmount = 0;
        this.account = 0;
        setTimeout(() => {
            this.cardScanner.status = false
            this.ejected = true;
        }, 1500)
    } 

    systemClock() {
        this.monitor.timestamp = this.clock.time;
    }

    systemFailure() {
        this.monitor.message = this.errorMessage;
        this.errorMessage = "";
        this.ejectCard();
    }
}

export default Processor;