import Account from "../dao/Account"

class Database {
    constructor() {
        const account1 = new Account("0123-4567-8987-6543", true, 100.23, "0000", "AAA", 1000, 800)
        const account2 = new Account("0123-4567-8987-6544", true, 600, "0000", "AAA", 1000, 0)
        this.accounts = { [account1.accountNum]: account1, [account2.accountNum]: account2};
    }
}

export default Database; 