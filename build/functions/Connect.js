class Connection {
    constructor(renai, options) {
        this.name = options.name || "renai";
        this.renai = renai;
        this.apiURL = options.apiURL || "http://localhost:9000/";
        this.apiKey = options.apiKey || null;
        this.port = options.port || 9000;
        this.connected = false;
        this.voiceChannel = null;
        this.textChannel = null;
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
                port: this.port,
                voiceChannel: this.voiceChannel?.id,
                textChannel: this.textChannel?.id
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
    }

    async connect(voiceChannel, textChannel) {
        if (this.connected) return;

        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

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
