const { Player } = require('./Player');
const { AudioPlayerStatus } = require('@discordjs/voice');

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

    async getPlayer(voiceChannel, textChannel) {
        const key = `${voiceChannel.id}-${textChannel.id}`;
        if (!this.players.has(key)) {
            const player = new Player(voiceChannel, textChannel, this.options);
            this.players.set(key, player);
        }
        return this.players.get(key);
    }

    async search(voiceChannel, textChannel, query) {
        try {
            const player = await this.getPlayer(voiceChannel, textChannel);
            if (player.audioPlayer.state.status === AudioPlayerStatus.Idle) {
                await player.search(query); // Play immediately if idle
            } else {
                player.queue.push(`https://www.youtube.com/watch?v=${query}`); // Add to queue if currently playing
                textChannel.send(`Added to queue: ${query}`);
            }
        } catch (error) {
            console.error('Error in search:', error);
        }
    }


    async search(voiceChannel, textChannel, query) {
        try {
            const player = await this.getPlayer(voiceChannel, textChannel);
            if (player.audioPlayer.state.status === AudioPlayerStatus.Idle) {
                await player.search(query); // Play immediately if idle
            } else {
                player.queue.push(query); // Add to queue if currently playing
                textChannel.send(`Added to queue: ${query}`);
            }
        } catch (error) {
            console.error('Error in search:', error);
        }
    }

    async queue(textChannel, voiceChannel) {
        if (!voiceChannel) {
            return textChannel.send('You must be in a voice channel to view the queue.');
        }
    
        const player = await this.getPlayer(voiceChannel, textChannel);
        
        if (player && player.queue.length > 0) {
            const queueList = player.queue.map((url, index) => `${index + 1}. ${url}`).join('\n');
            textChannel.send(`Current Queue:\n${queueList}`);
        } else {
            textChannel.send('The queue is currently empty.');
        }
    }

    clearPlayer(voiceChannel, textChannel) {
        const key = `${voiceChannel.id}-${textChannel.id}`;
        this.players.delete(key);
    }
}

module.exports = { Renai };
