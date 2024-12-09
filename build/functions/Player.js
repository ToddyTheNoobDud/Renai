const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const YouTube = require('youtube-sr').default;
const fetch = require('node-fetch');

class Player {
    constructor(voiceChannel, textChannel, options = {}) {
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.name = options.name || "renai";
        this.apiURL = options.apiURL || "http://localhost:9000/";
        this.port = options.port || 9000;
        this.queue = [];
        this.isPlaying = false;
        this.cleanupScheduled = false;
        this.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        this.audioPlayer = createAudioPlayer();
        this.connection.subscribe(this.audioPlayer);

        // Event listeners
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.playNext());
        this.audioPlayer.on('error', error => {
            console.error('Audio player error:', error);
            this.playNext();
        });
        this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    this.connection.reconnect(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Disconnect timeout')), 5000))
                ]);
            } catch (error) {
                console.error('Error reconnecting:', error);
                this.cleanup();
            }
        });
        this.connection.on(VoiceConnectionStatus.Destroyed, () => {
            console.log('Voice connection was destroyed, cleaning up.');
            this.cleanup();
        });
    }

    async play(url) {
        try {
            const audioData = await this.fetchAudioData(url);
            const resource = createAudioResource(audioData);
            this.audioPlayer.play(resource);
            this.isPlaying = true;
        } catch (error) {
            console.error('Error in play:', error);
            this.isPlaying = false;
        }
    }

    async playNext() {
        if (this.queue.length === 0) {
            console.log('Queue is empty, scheduling cleanup.');
            this.isPlaying = false;
            this.scheduleCleanup();
            return;
        }
        const nextSong = this.queue.shift();
        console.log(`Playing next song: ${nextSong.title} - ${nextSong.url}`);
        await this.play(nextSong.url);
    }

    async fetchAudioData(url) {
        try {
            const response = await fetch(this.apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ url, downloadMode: 'audio' })
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch audio data: ${response.statusText}`);
            }
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error fetching audio data:', error);
            throw error;
        }
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
            if (!this.isPlaying) {
                console.log(`Starting playback: ${title} - ${url}`);
                await this.play(url);
            } else {
                console.log(`Added to queue: ${title} - ${url}`);
            }
        } catch (error) {
            console.error('Error in search:', error);
        }
    }

    scheduleCleanup() {
        if (!this.cleanupScheduled) {
            this.cleanupScheduled = true;
            setTimeout(() => {
                if (!this.isPlaying && this.queue.length === 0) {
                    this.cleanup();
                }
                this.cleanupScheduled = false;
            }, 30000);
        }
    }

    cleanup() {
        console.log('Cleaning up resources...');
        this.audioPlayer.stop(true);
        this.connection.destroy();
        this.queue = [];
        this.isPlaying = false;
    }
}

module.exports = { Player };
