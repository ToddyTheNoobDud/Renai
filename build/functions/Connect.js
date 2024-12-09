class Connection {
    constructor(renai, options = {}) {
        this.renai = renai;
        this.name = options.name || "renai";
        this.apiURL = options.apiURL || "http://localhost:9000/";
        this.apiKey = options.apiKey || null;
        this.port = options.port || 9000;
        this.connected = false;
        this.voiceChannelId = null;
        this.textChannelId = null;
    }

    async fetchApi(endpoint, method = 'POST') {
        try {
            const response = await fetch(`${this.apiURL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    port: this.port,
                    voiceChannel: this.voiceChannelId,
                    textChannel: this.textChannelId
                })
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get response text for better error context
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('API fetch error:', error);
            throw error; // Rethrow to handle in the calling function
        }
    }

    async connect(voiceChannel, textChannel) {
        if (this.connected) {
            console.log('Already connected.');
            return;
        }

        this.voiceChannelId = voiceChannel.id;
        this.textChannelId = textChannel.id;

        await this.fetchApi('connect');
        this.connected = true;
        console.log(`Connected to voice channel: ${voiceChannel.name} and text channel: ${textChannel.name}`);
    }

    async disconnect() {
        if (!this.connected) {
            console.log('Already disconnected.');
            return;
        }

        await this.fetchApi('disconnect');
        this.connected = false;
        this.voiceChannelId = null; 
        this.textChannelId = null; 
        console.log('Disconnected successfully.');
    }
}

module.exports = { Connection };
