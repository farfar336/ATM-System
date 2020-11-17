class Clock {
    constructor() {
        setInterval(() => {
            this.time = new Date();
        }, 1000)
    }
}

export default Clock; 