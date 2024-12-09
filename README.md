# Renai
Simple discord player that works with cobalt (https://cobalt.tools/)

# I made this for fun cuz yes
+ Fast
+ Lightweight
+ Search system
+ Has memory leaks (oh my god!)
+ Own player system

# Changelog 1.0.2
+ Added queue system
+ Made the code faster
+ Added some events and handling
+ Better search system and support
+ More memory leaks i forgot to fix
# Example usage
```js
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Renai } = require('./build/index.js');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [
        Partials.Channel
    ]
});
const renai = new Renai(client, {
    name: 'renai',
    apiURL: '',
    port: 433
})

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ');
        const query = args.slice(1).join(' ');
        const voiceChannel = message.member?.voice.channel;
        const textChannel = message.channel;
        if (voiceChannel) {
                await renai.search(voiceChannel,textChannel, query);
            
        } else {
            message.channel.send('You must be in a voice channel to play music.');
        }
    }

    if (message.content.startsWith('!queue')) {
        const voiceChannel = message.member?.voice.channel; 
        await renai.queue(message.channel, voiceChannel)
    }
});
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
})

client.login(''); // Replace with your actual bot token
```
