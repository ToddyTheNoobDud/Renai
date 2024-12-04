# Renai
Simple discord player that works with cobalt (https://cobalt.tools/)

# I made this for fun cuz yes
+ Fast
+ Lightweight
+ Search system
+ Has memory leaks (oh my god!)
+ Own player system


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
    port: 8888
})

client.on('messageCreate', async message => {   
    if (message.author.bot) return;
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ');
        const query = args.slice(1).join(' ');
        const channel = message.member?.voice.channel;
        if (channel) {
            if (query.includes('https://') || query.includes('http://')) {
                await renai.play(channel, query);
            } else {
                await renai.search(channel, query);
            }
        } else {
            message.channel.send('You must be in a voice channel to play music.');
        }
    }
});
client.login(''); // Replace with your actual bot token
```
