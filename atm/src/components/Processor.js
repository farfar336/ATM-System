class Processor {
    constructor(database, cardScanner, keyPad, cashBank, cashDisburser, monitor, clock) {
        this.database = database;
        this.cardScanner = cardScanner;
        this.keyPad = keyPad;
        this.cashBank = cashBank;
        this.cashDisburser = cashDisburser;
        this.monitor = monitor;
        this.clock = clock;
        this.PIN = "";
        this.amount = 0;
        this.maxAmount = 400;
        this.currentEvent = "NULL";

        setInterval(() => {
            this.eventCapture();
            this.eventDispatch();
        }, 100)
    }

    eventCapture() {
        console.log(this.currentEvent)
        if (this.currentEvent === "NULL") {
            if (this.monitor.message === "") {
                this.monitor.message = `Welcome, please insert card\n`
                this.monitor.update(this.monitor.message);
            }
            if (this.cardScanner.inserted) {
                this.currentEvent = "SCAN_CARD";
            }
        } else if (this.currentEvent === "READ_PIN") {
            this.keyPressed = "";
            const keyPressed = this.keyPad.keyPressed;
            if (keyPressed === "CANCEL") {
                this.PIN = ""
            } else if (keyPressed === "ENTER") {
                this.currentEvent = "CHECK_PIN"
            } else if (this.PIN.length < 4) {
                this.PIN = this.PIN += keyPressed;
            }
        } else if (this.currentEvent === "DISBURSE") {
            if (this.cashDisburser.disbuerseFinished) {
                this.cashDisburser.disbuerseFinished = false;
                this.currentEvent = "EJECT_CARD";
            }
        } else if (this.currentEvent === "WITHDRAW") {
            this.keyPressed = "";
            const keyPressed = this.keyPad.keyPressed;
            if (keyPressed === "CANCEL") {
                this.currentEvent = "EJECT_CARD";
            } else if (keyPressed === "ENTER") {
                this.currentEvent = "CHECK_AMOUNT";
            } else {
                const digit = parseInt(keyPressed); 
                this.amount = this.amount * 10 + digit;
            }
        } 
    }

    eventDispatch() {
        switch (this.currentEvent) {
            case "SCAN_CARD":
                this.scanCard();    
                break;
            case "CHECK_PIN":
                this.checkPin();    
                break;
            case "CHECK_AMOUNT":
                this.verifyAmount();
                break;
            case "VERIFY_ACCOUNT":
                this.verifyAccountBalance();
                break;
            case "DISBURSE":
                this.disburse();
                break;
            case "EJECT_CARD":
                this.ejectCard();
                break;
            default:
        }
    }

    verifyAmount() {
        if (this.amount === 0 || this.amount > this.maxAmount) {
            this.currentEvent = "EJECT_CARD";
            return
        }
        this.currentEvent = "VERIFY_BALANCE"
    }

    scanCard() {
        const read = this.cardScanner.read
        const accountNumer = this.cardScanner.accountNumber;
        console.log(this.cardScanner);
        if (!read) {
            this.currentEvent = "EJECT_CARD";
            return;
        } 
        if (!this.database.accounts[accountNumer]) {
            this.currentEvent = "EJECT_CARD";
            return; 
        }
        this.currentEvent = "READ_PIN"
    }

    ejectCard() {
        this.cardScanner.accountNumber = "";
        this.cardScanner.read = false;
        this.cardScanner.inserted = false;
        this.currentEvent = "NULL"
    }

    checkPin() {
        const account = this.database.accounts[this.accountNumber]
        if (account.PIN !== this.PIN) {
            this.currentEvent = "EJECT_CARD";
            return; 
        }
        this.currentEvent = "WITHDRAW"
    }

    verifyAccountBalance() {
        const account = this.database.accounts[this.accountNumber]
        if (account.amount < this.amount) {
            this.currentEvent = "EJECT_CARD";
            return; 
        } 
        this.currentEvent = "DISPURSE"
    }

    disburse() {
        const bills = this.amount / 20;
        if (bills > this.cashBank.twentyDollarBills ) {
            this.currentEvent = "EJECT_CARD";
        } else {
            this.cashBank.twentyDollarBills -= bills;
            this.cashDisburser.twentyDollarBillsToDisburse = this.bills;
        }
    }
}

export default Processor;