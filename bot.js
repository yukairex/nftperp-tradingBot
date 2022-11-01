require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNELID = process.env.DISCORD_CHANNEL


client.login(TOKEN);


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

module.exports = {
    client,
    CHANNELID
}