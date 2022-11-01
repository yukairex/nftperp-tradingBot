require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNELID = process.env.DISCORD_CHANNEL


client.login(TOKEN);


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
   // test()
})

module.exports = {
    client,
    CHANNELID
}



const test = ()=>{
    console.log("testing...")
    const embedMsg = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle("Hello World");
    client.channels.fetch(process.env.DISCORD_CHANNEL)
    .then(channel => {
      channel.send(embedMsg);
    })
    .catch(console.error);
}