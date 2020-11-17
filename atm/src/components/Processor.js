class Processor {
    constructor(database, cardScanner, keyPad, cashBank, cashDisburser, monitor, clock) {
        this.database = database;
        this.cardScanner = cardScanner;
        this.keyPad = keyPad;
        this.cashBank = cashBank;
        this.cashDisburser = cashDisburser;
        this.monitor = monitor;
        this.clock = clock;
        this.amount = 0;
        this.currentEvent = "NULL";
        this.PIN = [];

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
                this.PIN = []
            } else if (this.PIN.length < 4) {
                const digit = parseInt(keyPressed); 
                if (digit > 9) {
                    return
                }
                this.PIN.push(digit);
            }

            if (this.PIN.length === 4) {
                this.currentEvent = "CHECK_PIN"
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
                return; 
            } else if (this.PIN.length < 4) {
                const digit = parseInt(keyPressed); 
                if (digit <= 9) {
                    return
                }
                switch (digit) {
                    case 10:
                        this.amount = 20;
                        break
                    case 11:
                        this.amount = 40;
                        break
                    case 12:
                        this.amount = 80;
                        break
                    case 13:
                        this.amount = 100;
                        break
                    case 14:
                        this.amount = 200;
                        break
                    case 15:
                        this.amount = 400;
                        break
                    default:
                }
                this.currentEvent = "VERIFY_BALANCE";
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

    scanCard() {
        const readSuccess = this.cardScanner.readSuccess
        const accountNumer = this.cardScanner.accountNumber;
        console.log(accountNumer);
        if (!readSuccess) {
            this.currentEvent = "EJECT_CARD";
            return;
        } 
        if (!this.database.accounts[accountNumer]) {
            this.currentEvent = "EJECT_CARD";
            return; 
        }
        this.currentEvent = "CHECK_PIN"
    }

    ejectCard() {
        this.cardScanner.accountNumber = "";
        this.cardScanner.readSuccess = false;
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