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
            this.monitor.message = `Welcome, please insert card\n`
            this.monitor.update(this.monitor.message);
            if (this.cardScanner.inserted) {
                console.log(this.cardScanner)
                this.currentEvent = "SCAN_CARD";
            }
        } else if (this.currentEvent === "READ_PIN") {
            this.monitor.message = `Please enter your PIN\n`
            this.monitor.update(this.monitor.message);
            
            const keyPressed = this.keyPad.keyPressed;
            this.keyPad.keyPressed = "";
            console.log(keyPressed);
            console.log(this.PIN);
            if (keyPressed === "") {
                return;
            } else if (keyPressed === "CANCEL") {
                this.PIN = ""
            } else if (keyPressed === "ENTER") {
                this.currentEvent = "CHECK_PIN"
            } else if (this.PIN.length < 4) {
                this.PIN = this.PIN += keyPressed;
            }
        } else if (this.currentEvent === "DISBURSING") {
            this.monitor.message = `Disbursing your withdraw...`
            this.monitor.update(this.monitor.message);
            if (this.cashDisburser.disbuerseFinished) {
                this.cashDisburser.disbuerseFinished = false;
                this.monitor.message = `Please take your money and card`
                this.monitor.update(this.monitor.message);
                this.currentEvent = "EJECT_CARD";
            }
        } else if (this.currentEvent === "WITHDRAW") {
            this.monitor.message = `Enter the amount you want to withdraw\n
                                    It has to be a multiple of $20\n`
            this.monitor.update(this.monitor.message);
            const keyPressed = this.keyPad.keyPressed;
            console.log(keyPressed)
            console.log(this.amount)
            if (keyPressed === "") {
                return;
            } else if (keyPressed === "CANCEL") {
                this.currentEvent = "EJECT_CARD";
            } else if (keyPressed === "ENTER") {
                this.currentEvent = "CHECK_AMOUNT";
            } else {
                const digit = parseInt(keyPressed); 
                this.amount = this.amount * 10 + digit;
                this.keyPad.keyPressed = "";
            }
        } else if (this.currentEvent === "EJECT_CARD") {
            this.cardScanner.accountNumber = "";
            this.cardScanner.read = false;
            this.cardScanner.inserted = false;
            console.log(this.cardScanner)
            if (this.cardScanner.taken) {
                this.currentEvent = "NULL";
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
            case "VERIFY_BALANCE":
                this.verifyAccountBalance();
                break;
            case "DISBURSE":
                this.disburse();
                break;
            default:
        }
    }

    verifyAmount() {
        if (this.amount === 0 || this.amount > this.maxAmount) {
            this.monitor.message = `Amount exceeds our one time withdraw limit of $400\n
                                    Ejecting card...\n`
            this.monitor.update(this.monitor.message);
            this.currentEvent = "EJECT_CARD";
            return
        } else if (this.amount % 20 !== 0) {
            this.monitor.message = `Amount has to be a multiple of $20\n
                                    Ejecting card...\n`
            this.monitor.update(this.monitor.message);
        }
        this.currentEvent = "VERIFY_BALANCE"
    }

    scanCard() {
        const read = this.cardScanner.read
        const accountNumber = this.cardScanner.accountNumber;
        console.log(this.cardScanner);
        if (!read) {
            this.currentEvent = "EJECT_CARD";
            return;
        } 
        if (!this.database.accounts[accountNumber]) {
            this.currentEvent = "EJECT_CARD";
            return; 
        }
        this.keyPad.keyPressed = "";
        this.currentEvent = "READ_PIN";
    }

    checkPin() {
        const accountNumber = this.cardScanner.accountNumber;
        const account = this.database.accounts[accountNumber]
        console.log((account.PIN))
        console.log(this.PIN)
        if (account.PIN !== this.PIN) {
            this.currentEvent = "EJECT_CARD";
            return; 
        }
        this.keyPad.keyPressed = "";
        this.currentEvent = "WITHDRAW"
    }

    verifyAccountBalance() {
        const accountNumber = this.cardScanner.accountNumber;
        const account = this.database.accounts[accountNumber]
        if (account.amount < this.amount) {
            this.monitor.message = `Not enough balance
                                    Ejecting card...`
            this.monitor.update(this.monitor.message);
            this.currentEvent = "EJECT_CARD";
            return; 
        } 
        this.currentEvent = "DISBURSE"
    }

    disburse() {
        const bills = this.amount / 20;
        console.log(bills)
        console.log(this.cashBank)
        if (bills > this.cashBank.twentyDollarBills ) {
            this.monitor.message = `Not enough cash in the ATM
                                    Ejecting card...`
            this.monitor.update(this.monitor.message);
            this.currentEvent = "EJECT_CARD";
        } else {
            this.cashBank.twentyDollarBills -= bills;
            this.cashDisburser.twentyDollarBillsToDisburse = this.bills;
            this.currentEvent = "DISBURSING";
            setTimeout(() => {
                this.cashDisburser.disbuerseFinished = true;
            }, 3000)
        }
    }
}

export default Processor;