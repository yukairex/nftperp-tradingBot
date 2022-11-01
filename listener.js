const Discord = require('discord.js');
const { ethers, Contract } = require('ethers');
require("dotenv").config()
const provider = new ethers.providers.JsonRpcProvider(
    process.env.ARBITRUM_ENDPOINT
  );

const clearingHouseAddr = '0x1bbd56e80284b7064b44b2f4bc494a268e614d36';
const clearingHouseAbi = require('./abi/nftperpClearingHouseAbi.json');
const clearingHouse = new Contract(clearingHouseAddr, clearingHouseAbi, provider);
const {amms} = require("./constant");
const {client} = require("./bot")

const explorer = "https://arbiscan.io/tx/"

const eventQueue = [];

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
                transactionHash
            }
            console.log(entry);
            eventQueue.push(event);
  }
}


function processQueue() {
    console.log(`processing queue...`)
    if (!eventQueue.length) return;
    let event = eventQueue.shift();
   
    let {trader, name, size, isLong, transactionHash, image} = event
    let txURL = `${explorer}${transactionHash}`;

    const embedMsg = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setURL(txURL)
    .setDescription(`${size.toFixed(4)}\u039E ${isLong?"Long":"Short"} Position has just been opened`)
    .setImage(image)
    .addField("trader",`${trader.slice(0,8)}`, true)
    .addField("size",`${size.toFixed(4)}\u039E`, true);
    client.channels.fetch(process.env.DISCORD_CHANNEL)
    .then(channel => {
      channel.send(embedMsg);
    })
    .catch(console.error);


    return;
}


checkEvents();