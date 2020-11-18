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
        this.pinChecked = false;
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
            console.log(this.currentEvent)
            this.eventDispatch();
            this.render();
        }, 100)
    }

    eventCapture() {
        console.log(this.ejected)
        if (this.ejected) {
            this.ejected = false;
            this.currentEvent = "WELCOME";
        } else if (this.disbursing) {
            if (this.cashDisburser.disbursed) {
                this.currentEvent = "DISBURSED"
            }
        } else if (this.pinChecked) {
            const keyPressed = this.keypad.keyPressed;
            this.keypad.keyPressed = null;
            console.log(keyPressed)
            console.log(this.requestedAmount)
            if (keyPressed === null) {
                return;
            } else if (keyPressed === 11) {
                this.requestedAmount = 0;
            } else if (keyPressed === 10) {
                this.currentEvent = "CHECK_AMOUNT";
            } else {
                this.requestedAmount = this.requestedAmount * 10 + keyPressed;
                this.keypad.keyPressed = null;
            }
        } else if (this.welcomed) {
            if (this.cardScanner.status) {
                this.monitor.message = "Enter PIN"
                this.account = this.cardScanner.accountNumber;
                const keyPressed = this.keypad.keyPressed;
                console.log(this.keypad);
                this.keypad.keyPressed = null;
                console.log(keyPressed);
                if (keyPressed === null) {
                    return;
                } else if (keyPressed === 11) {
                    this.PIN = "";
                } else if (keyPressed === 10) {
                    this.currentEvent = "CHECK_PIN";
                } else if (this.PIN.length < 4) {
                    this.PIN = this.PIN += keyPressed;
                }
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
            default:
        }
        this.currentEvent = null;
    }

    welcome() {
        this.monitor.message = "Welcome";
        this.welcomed = true;
    }
    
    checkPIN() {
        this.welcomed = false;
        const account = this.database.accounts[this.account]
        if (account.PIN === this.PIN) {
            this.pinChecked = true;
            this.monitor.message = "Enter withdraw amount which must be a multiple of $20";
        } else {
            this.errorMessage = "Wrong PIN"
            this.systemFailure();
        }
    }    

    checkAmount() {
        this.pinChecked = false;
        const account = this.database.accounts[this.account];
        const remainMaxAccount = account.maxAllowableWithdraw - account.currentWithdraw;
        console.log(remainMaxAccount)
        console.log(this.requestedAmount)
        if (remainMaxAccount > this.requestedAmount) {
            this.amountChecked = true;
            this.verifyAccountBalance();
        } else {
            this.errorMessage = "Max withdraw amount reached";
            this.systemFailure();
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
        this.disbursing = false;
        setTimeout(() => {
            this.cardScanner.status = false
            this.ejected = true;
        }, 500)
    } 

    systemClock() {
        this.monitor.timestamp = this.clock.timestamp;
    }

    systemFailure() {
        this.monitor.message = this.errorMessage;
        this.ejectCard();
    }
}

export default Processor;