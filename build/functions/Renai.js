const { Player } = require('./Player');
const fetch = require('node-fetch');
const YouTube = require('youtube-sr').default;
class Renai {
    constructor(client, options = {}) {
        this.client = client;
        this.options = options;
        this.name = options.name || "renai";
        this.apiURL = options.apiURL || "http://localhost:9000/";
        this.port = options.port || 9000;
        this.players = new Map(); // Use a Map for faster access and lower memory usage
    }

    async getPlayer(voiceChannel, textChannel) {
        const key = `${voiceChannel.id}-${textChannel.id}`;
        if (!this.players.has(key)) {
            const player = new Player(voiceChannel, textChannel, this.options);
            this.players.set(key, player);
            return player;
        }
        return this.players.get(key);
    }

    async search(voiceChannel, textChannel, query) {
        try {
            const player = await this.getPlayer(voiceChannel, textChannel);
            const searchResults = await this.simpleSearch(query);
            if (!searchResults) {
                return textChannel.send('No results found for your query.');
            }
            const { title, url } = searchResults;
            player.queue.push({ title, url });
            textChannel.send(`Added to queue: ${title} - ${url}`);
            if (!player.isPlaying) {
                await player.play(url);
            }
        } catch (error) {
            console.error('Error in search:', error);
            textChannel.send(`An error occurred while searching: ${error.message}`);
        }
    }

    async queue(textChannel, voiceChannel) {
        if (!voiceChannel || !voiceChannel.id) {
            return textChannel.send('You must be in a voice channel to view the queue.');
        }
        const player = await this.getPlayer(voiceChannel, textChannel);
        if (player && player.queue.length > 0) {
            const queueList = player.queue.map((item, index) => `${index + 1}. ${item.title}`).join('\n');
            textChannel.send(`Current Queue:\n${queueList}`);
        } else {
            textChannel.send('The queue is currently empty.');
        }
    }

    clearPlayer(voiceChannel, textChannel) {
        const key = `${voiceChannel.id}-${textChannel.id}`;
        if (this.players.has(key)) {
            this.players.get(key).cleanup();
            this.players.delete(key);
        }
    }

    async simpleSearch(query) {
        try {
            const searchResults = await YouTube.search(query, { limit: 1 });
            return searchResults[0];
        } catch (error) {
            console.error('Error in simpleSearch:', error);
            return null;
        }
    }
}

module.exports = { Renai };
