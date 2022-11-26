const Discord = require('discord.js');
const { ethers, Contract } = require('ethers');
require("dotenv").config()
const provider = new ethers.providers.JsonRpcProvider(
    process.env.ARBITRUM_ENDPOINT
  );

const clearingHouseAddr = '0x6fc05b7dfe545cd488e9d47d56cfaca88f69a2e1';
const clearingHouseAbi = require('./abi/nftperpClearingHouseAbi.json');
const clearingHouse = new Contract(clearingHouseAddr, clearingHouseAbi, provider);
const {amms} = require("./constant");
const {client} = require("./bot")

const explorer = "https://arbiscan.io/tx/"

const eventQueue = [];

const thresh = 0.09;

const checkEvents = async () => {

  

    let positionChangeFilter = clearingHouse.filters.PositionChanged();


    provider.on(positionChangeFilter, async (log)=> {
       
        let events = await clearingHouse.queryFilter(
          positionChangeFilter,
            log.blockNumber,
            log.blockNumber
          );

        await processPositionChangeEvents(events);
    })


   // setInterval(test, 60000)

   setInterval(processQueue, 5000);
   
}



const processPositionChangeEvents = async (events) => {

    for (let e of events) {
            console.log(e)
            let transactionHash = e.transactionHash;
            let trader = e.args.trader;
            let amm = e.args.amm;
            let nft = amms.find(a => a.address.toLowerCase() == amm.toLowerCase());
            let positionNotional = parseFloat(ethers.utils.formatEther(e.args.exchangedPositionNotional));
            let positionSize = parseFloat(ethers.utils.formatEther(e.args.exchangedPositionSize)); 
            let isLong = positionSize >= 0? true:false

            let event = {
                trader,
                name:nft.name,
                image:nft.image,
                size:positionNotional,
                isLong,
                transactionHash,
                url:nft.url
            }
            console.log(event);

            if (Math.abs(positionNotional) > thresh){
              eventQueue.push(event);
            }
         
  }
}


function processQueue() {
    console.log(`processing queue...`)
    if (!eventQueue.length) return;
    let event = eventQueue.shift();
    console.log(`find event`)
   
    let {trader, name, size, isLong, transactionHash, image, url} = event
    let txURL = `${explorer}${transactionHash}`;

    const embedMsg = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setURL(url)
    .setDescription(`${size.toFixed(3)}\u039E **${isLong?"Long":"Short"}**`)
    .setImage(image)
    .addField("trader",`${trader.slice(0,8)}`, true)
    .addField("size",`${size.toFixed(3)}\u039E`, true)
    .addField("tx",`[link](${txURL})`, true)
    .setFooter(`by 0xFendiman#3523`)
              

    
    client.channels.fetch(process.env.DISCORD_CHANNEL)
    .then(channel => {
      channel.send(embedMsg);
    })
    .catch(console.error);


    return;
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


checkEvents();