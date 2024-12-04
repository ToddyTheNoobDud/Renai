const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Connection } = require('./Connect.js');
const YouTube = require('youtube-sr').default;

class Player {
    constructor(voiceChannel, textChannel, options) {
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.name = options?.name;
        this.apiURL = options?.apiURL;
        this.port = options?.port;
        this.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        this.audioPlayer = createAudioPlayer();
        this.connection.subscribe(this.audioPlayer);
        this.queue = [];

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.playNext(); 
        });
    }

    async play(url) {
        try {
            const connection = new Connection(this, {
                name: this.name,
                apiURL: this.apiURL,
                port: this.port || null
            });
            const response = await this.fetchAudioData(connection.apiURL, url);
            this.audioPlayer.play(createAudioResource(response.url));
        } catch (error) {
            console.error('Error in play:', error);
        }
    }

    async playNext() {
        if (this.queue.length > 0) {
            const nextSong = this.queue.shift(); 
            await this.play(nextSong);
        } else {
            console.log('Queue is empty, nothing to play.');
        }
    }

    async fetchAudioData(apiURL, url) {
        const response = await fetch(`${apiURL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ url, downloadMode: 'audio' })
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch audio data: ${response.statusText}`);
        }
        return await response.json();
    }

    async search(query) {
        try {
            const searchResults = await YouTube.search(query, { limit: 1 });
            if (!searchResults.length) {
                throw new Error('No results found');
            }
            const video = searchResults[0];
            this.queue.push(video.url); 
            if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
                await this.play(video.url); 
            } else {
                console.log(`Added to queue: ${video.url}`);
            }
        } catch (error) {
            console.error('Error in search:', error);
        }
    }
}

module.exports = { Player };
