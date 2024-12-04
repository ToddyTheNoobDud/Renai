class Connection {
    constructor(renai, options) {
        this.name = options.name || "renai";
        this.renai = renai;
        this.apiURL = options.apiURL || "http://localhost:9000/";
        this.apiKey = options.apiKey || null;
        this.port = options.port || 9000;
        this.connected = false;
    }

    async fetchApi(endpoint, method = 'POST') {
        const response = await fetch(`${this.apiURL}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                apiKey: this.apiKey,
                port: this.port
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
    }

    async connect() {
        if (this.connected) return;

        await this.fetchApi('connect');
        this.connected = true;
    }

    async disconnect() {
        if (!this.connected) return;

        await this.fetchApi('disconnect');
        this.connected = false;
    }
}

module.exports = { Connection };