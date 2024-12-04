const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice'); 
const { Connection } = require('./Connect.js'); 
const YouTube = require('youtube-sr').default;

class Player { 
    constructor(channel, options) { 
        this.channel = channel; 
        this.name = options?.name; 
        this.apiURL = options?.apiURL; 
        this.port = options?.port; 
        this.connection = joinVoiceChannel({ 
            channelId: channel.id, 
            guildId: channel.guild.id, 
            adapterCreator: channel.guild.voiceAdapterCreator 
        }); 
        this.audioPlayer = createAudioPlayer(); 
        this.connection.subscribe(this.audioPlayer); 
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
            await this.play(video.url);
        } catch (error) {
            console.error('Error in search:', error);
        }
    }
}

module.exports = { Player };