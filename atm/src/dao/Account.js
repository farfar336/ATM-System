class Account {
    constructor(accountNum, status, balance, PIN, CardHolder, maxAllowableWithdraw, currentWithdraw) {
        this.accountNum = accountNum;
        this.status = status;
        this.balance = balance;
        this.PIN = PIN;
        this.CardHolder = CardHolder;
        this.maxAllowableWithdraw = maxAllowableWithdraw;
        this.currentWithdraw = currentWithdraw;
    }
}

export default Account