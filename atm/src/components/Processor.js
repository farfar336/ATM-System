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
        this.wrongPin = false;
        this.amountChecked = false;
        this.maxAmount = false;
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
        console.log(this.currentEvent)
        if (this.ejected) {
            this.ejected = false;
            this.currentEvent = "WELCOME";
        } else if (this.disbursing) {
            if (this.cashDisburser.disbursed) {
                this.currentEvent = "DISBURSED"
            }
        } else if (this.pinChecked) {
            if (!this.maxAmount) {
                this.monitor.message = "Enter withdraw amount which must be a multiple of $20";
            }
            const data = this.keypad.data;
            const cancel = this.keypad.cancel;
            const enter = this.keypad.enter;
            this.keypad.data = 10;
            this.keypad.cancel = false;
            this.keypad.enter = false;
            if (cancel) {
                this.monitor.message = "Transcation cancelled";
                this.pinChecked = false;
                this.currentEvent = "CANCEL_TRANSCATION"
            } else if (enter) {
                this.currentEvent = "CHECK_AMOUNT";
            } else if (data < 10){
                this.requestedAmount = this.requestedAmount * 10 + data;
                this.keypad.keyPressed = null;
            }
        } else if (this.welcomed) {
            if (this.cardScanner.status) {
                if (!this.wrongPin) {
                    this.monitor.message = "Enter PIN"
                    this.account = this.cardScanner.accountNumber;
                }
                const data = this.keypad.data;
                const cancel = this.keypad.cancel;
                const enter = this.keypad.enter;
                console.log(this.keypad);
                this.keypad.data = 10;
                this.keypad.cancel = false;
                this.keypad.enter = false;
                console.log(this.keypad);
                if (cancel) {
                    this.monitor.message = "Transcation cancelled";
                    this.welcomed = false;
                    this.currentEvent = "CANCEL_TRANSCATION"
                } else if (enter) {
                    this.currentEvent = "CHECK_PIN";
                } else if (this.PIN.length < 4 && data < 10) {
                    this.PIN = this.PIN += data;
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
        const account = this.database.accounts[this.account]
        if (account.PIN === this.PIN) {
            this.pinChecked = true;
            this.welcomed = false;
            this.wrongPin = false;
        } else {
            this.monitor.message = "Wrong PIN, try again";
            this.PIN = "";
            this.wrongPin = true;
        }
    }    

    checkAmount() { 
        this.monitor.message = "Enter withdraw amount which must be a multiple of $20";
        const account = this.database.accounts[this.account];
        const remainMaxAccount = account.maxAllowableWithdraw - account.currentWithdraw;
        if (remainMaxAccount >= this.requestedAmount) {
            this.pinChecked = false;
            this.amountChecked = true;
            this.maxAmount = false;
            this.verifyAccountBalance();
        } else {
            this.monitor.message = "Max withdraw amount reached, try again";
            this.maxAmount = true
            this.requestedAmount = 0;
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
        this.monitor.timestamp = this.clock.time;
    }

    systemFailure() {
        this.monitor.message = this.errorMessage;
        this.errorMessage = "";
        this.ejectCard();
    }
}

export default Processor;