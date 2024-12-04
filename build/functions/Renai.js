const { Player } = require('./Player');

class Renai {
    constructor(client, options) {
        this.client = client;
        this.options = options;
        this.name = options.name || "renai";
        this.apiURL = options.apiURL || "http://localhost:9000/"; 
        this.apiKey = options.apiKey || null;
        this.port = options.port || 9000; 
        this.players = new Map(); 
    }

    async getPlayer(channel) {
        if (!this.players.has(channel.id)) {
            const player = new Player(channel, this.options);
            this.players.set(channel.id, player);
        }
        return this.players.get(channel.id);
    }

    async play(channel, url) {
        try {
            const player = await this.getPlayer(channel);
            await player.play(url);
        } catch (error) {
            console.error('Error in play:', error);
        }
    }

    async search(channel, query) {
        try {
            const player = await this.getPlayer(channel);
            await player.search(query);
        } catch (error) {
            console.error('Error in search:', error);
        }
    }
    clearPlayer(channel) {
        this.players.delete(channel.id);
    }
}

module.exports = { Renai };