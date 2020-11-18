class Processor {
    constructor(database, cardScanner, keypad, cashBank, cashDisburser, monitor, clock, render) {
        this.database = database;
        this.cardScanner = cardScanner;
        this.keypad = keypad;
        this.cashBank = cashBank;
        this.cashDisburser = cashDisburser;
        this.monitor = monitor;
        this.clock = clock;
        this.PIN = "";
        this.amount = 0;
        this.maxAmount = 400;
        this.currentEvent = "WELCOME";
        this.welcomed = false;
        this.cardScaned = false;
        this.pinChecked = false;
        this.amountChecked = false;
        this.balanceVerified = false;
        this.cashAvailiabilityVerified = false;
        this.disbursed = false;
        this.cardEjected = false;
        this.errorMessage = null;
        this.welcomeMessage = "Welcome, please insert your card";
        this.enterPINMessage = "Please enter your PIN";
        this.enterWithdrawMessage = "Please enter withdraw amount which is a multiple of $20";
        this.wrongPinErrorMessage = "Wrong PIN"
        this.amountExceedErrorMessage = "Amount exceed our one time withdraw amount of $400";
        this.remainderErrorMessage = "Amount has to be a multiple of $20";
        this.notEnoughBalanceErrorMessage = "Balance is not enough to complete withdraw";
        this.notEnoughBillErrorMessage = "Not enough bill in this ATM";
        this.disbuerseMessage = "Disbursing...";
        this.ejectMessage = "Please take your money and card";
        this.render = render;

        setInterval(() => {
            this.eventCapture();
            console.log(this.currentEvent)
            this.eventDispatch();
            this.render();
        }, 100)
    }

    eventCapture() {
        console.log(this.currentEvent)
        if (this.cardEjected) {
            if (this.cardScanner.status === 0) {
                this.amount = 0;
                this.PIN = "";
                this.welcomed = false;
                this.cardScaned = false;
                this.pinChecked = false;
                this.amountChecked = false;
                this.balanceVerified = false;
                this.cashAvailiabilityVerified = false;
                this.cardEjected = false;
                this.currentEvent = "WELCOME"
            }
        } else if (this.amountChecked || this.balanceVerified || this.cashAvailiabilityVerified) { 
        } else if (this.pinChecked) {
            const keyPressed = this.keypad.keyPressed;
            this.keypad.keyPressed = null;
            console.log(keyPressed)
            console.log(this.amount)
            if (keyPressed === null) {
                return;
            } else if (keyPressed === 11) {
                this.currentEvent = "EJECT_CARD";
            } else if (keyPressed === 10) {
                this.currentEvent = "CHECK_AMOUNT";
            } else {
                this.amount = this.amount * 10 + keyPressed;
                this.keypad.keyPressed = null;
            }
        } else if (this.cardScaned) {
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
            console.log(keyPressed);
            console.log(this.PIN);
        } else if (this.welcomed) {
            if (this.cardScanner.status === 1) {
                console.log(this.cardScanner)
                this.account = this.cardScanner.accountNumber;
                this.cardScaned = true;    
                
                this.monitor.message = this.enterPINMessage;
                
            }
        }
    }

    eventDispatch() {
        switch (this.currentEvent) {
            case "WELCOME":
                this.currentEvent = null
                this.welcome();
                break;
            case "CHECK_PIN":
                this.currentEvent = null
                this.checkPin();    
                break;
            case "CHECK_AMOUNT":
                this.currentEvent = null
                this.verifyAmount();
                break;
            case "VERIFY_BALANCE":
                this.currentEvent = null
                this.verifyAccountBalance();
                break;
            case "VERIFY_CASH_AVAILABILITY":
                this.currentEvent = null;
                this.verifyBillAvailiability();
                break;
            case "DISBURSE":
                this.currentEvent = null
                this.disburse();
                break;
            case "EJECT_CARD":
                this.currentEvent = null
                this.ejectCard();
                break;
            default:
        }
    }

    welcome() {
        this.monitor.message = this.welcomeMessage;
        
        this.welcomed = true;
    }

    verifyAmount() {
        if (this.amount === 0 || this.amount > this.maxAmount) {
            this.errorMessage = this.amountExceedErrorMessage;
            this.systemError();
            return
        } else if (this.amount % 20 !== 0) {
            this.errorMessage = this.remainderErrorMessage;
            this.systemError();
        }
        this.currentEvent = "VERIFY_BALANCE"
        this.amountChecked = true;
    }

    checkPin() {
        const accountNumber = this.cardScanner.accountNumber;
        const account = this.database.accounts[accountNumber]
        console.log((account.PIN))
        console.log(this.PIN)
        if (account.PIN !== this.PIN) {
            this.errorMessage = this.wrongPinErrorMessage;
            this.systemError();
            return; 
        }
        this.keypad.keyPressed = "";
        this.pinChecked = true;
        this.monitor.message = this.enterWithdrawMessage;
        
    }


    verifyAccountBalance() {
        const accountNumber = this.cardScanner.accountNumber;
        const account = this.database.accounts[accountNumber]
        console.log(this.amount)
        console.log(account.balance)
        if (account.balance < this.amount) {
            this.errorMessage = this.notEnoughBalanceErrorMessage
            this.systemError();
            return; 
        } 
        this.currentEvent = "VERIFY_CASH_AVAILABILITY"
        this.balanceVerified = true; 
    }

    verifyBillAvailiability() {
        const bills = this.amount / 20;
        if (bills > this.cashBank.twentyDollarBills ) {
            this.errorMessage = this.notEnoughBalanceErrorMessage;
            this.systemError();
        }
        this.currentEvent = "DISBURSE";
        this.cashAvailiabilityVerified = true;
    }

    disburse() {
        const bills = this.amount / 20;
        this.cashBank.twentyDollarBills -= bills;
        this.cashDisburser.twentyDollarBillsToDisburse = this.bills;
        const accountNumber = this.cardScanner.accountNumber;
        const account = this.database.accounts[accountNumber]
        account.balance -= this.amount;
        console.log(this.database);
        this.monitor.message = this.disbuerseMessage;
        setTimeout(() => {
            this.currentEvent = "EJECT_CARD";
            this.monitor.message = this.ejectMessage;
            
            this.disbursed = true;
        }, 3000)
        
    }

    ejectCard() {
        this.cardScanner.status = 2;
        this.cardEjected = true;
    } 

    clock() {
        this.monitor.timestamp = this.clock.timestamp;
    }

    systemError() {
        this.currentEvent = "EJECT_CARD";
        this.monitor.message = this.errorMessage;
    }
}

export default Processor;