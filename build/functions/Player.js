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

        // Initialize the queue
        this.queue = [];

        // Play the next song when the current one ends
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.playNext(); // Play the next song when idle
        });
    }
    async play(url) {
        try {
            const connection = new Connection(this, {
                name: this.name,
                apiURL: this.apiURL,
                port: this.port || null
            });
            const audioData = await this.fetchAudioData(connection.apiURL, url);
            this.audioPlayer.play(createAudioResource(audioData));
        } catch (error) {
            console.error('Error in play:', error);
        }
    }

    async playNext() {
        if (this.queue.length > 0) {
            const nextSong = this.queue.shift();
            await this.play(nextSong.url); // Use the URL to play the next song
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
        const data = await response.json();
        return data.url; // Return only the URL
    }

    async search(query) {
        try {
            const searchResults = await YouTube.searchOne(query);
            if (!searchResults) {
                throw new Error('No results found');
            }
            const video = searchResults;
            const url = video.url;
            const title = video.title;
    
            this.queue.push({ title, url });
    
            if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
                await this.play(url);
            } else {
                console.log(`Added to queue: ${title} - ${url}`);
            }
        } catch (error) {
            console.error('Error in search:', error);
        }
    }
}
module.exports = { Player };

