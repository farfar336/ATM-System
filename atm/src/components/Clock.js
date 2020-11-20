class Clock {
    constructor() {
        setInterval(() => {
            this.time = new Date().toString();
        }, 100)
    }
}

export default Clock; 