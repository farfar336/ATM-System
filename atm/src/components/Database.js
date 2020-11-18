import Account from "../dao/Account"

class Database {
    constructor() {
        const account = new Account("0123-4567-8987-6543", true, 200.23, "0000", "AAA", 1000, 800)
        this.accounts = { [account.accountNum]: account};
    }
}

export default Database; 