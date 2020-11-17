import Account from "../dao/Account"

class Database {
    constructor() {
        const account = new Account("0123-4567-8987-6543", 420.23, "0000")
        this.accounts = { [account.accountNum]: account};
    }
}

export default Database; 