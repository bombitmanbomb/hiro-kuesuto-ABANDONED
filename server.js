/*
  Game Bot thing by bomb_and_kou#0669 and PlayStateWolf#3118
*/
// init project
var config = {
  "prefix":">",
  "channels":[],
  "roles":[]
  }
const debug = true //DEBUG
var bodyParser = require('body-parser');

// start of data config
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile, (err) => {if (err) {console.error(err.message)};console.log('Connected to Dataset.');});
const low = require("lowdb");
const FileSync = require('lowdb/adapters/FileSync')
var configFile = low(new FileSync("./.data/config.json"));
configFile.defaults({'config':config}).write();
//end of data config

const {Client} = require("discord.js");
const client = new Client({disableEveryone: true});
client.login(process.env.SECRET);

const game = require("./game.js"); //Game Module

client.on("error", (err)=>{console.log(err)});//Error Handling
//initilization
client.on("ready", ()=>{
  console.log("Bot Loaded.");
  loadBotSettings();
  game.init(client); //Initialize Game Engine
});
/* Main Hander
  when a message is sent.
*/
client.on("message",(msg)=>{
  try {
    var message = msg;
    message.isDM = (message.channel.type==="dm")
    console.log(message.author.username+"> "+message.content);
    if (message.content.startsWith(config.prefix)){runCommand(message);return;} //RUN COMMAND AND STOP PROGRAM
    let games = game.getRunningGames();
    //is the user in a channel with a running game and is the user part of the game
    //Hmm
    
  } catch(err){console.log(err)};
});



/* loadBotSettings
  update global var config with data in config.json
*/
function loadBotSettings(){
  configFile.read()
  config = configFile.get("config").value()
}
/* sendHelp
  send help info to message.author. returns undefined
  @param {Object} message #client.on message object
*/
function sendHelp(message){
client.users.get(message.author.id)
  .send(makeEmbed("Help Info","Name to be decided later.\nSome misc info\n__**COMMANDS**__:\nhelp\nplay"));
}
/* runCommand 
  run a bot command. autodelete message if text channel. returns undefined.
  @param {Object} message #client.on message object
  --internal--
  @param {Object} args #message split at spaces excluding id [0]
  @param {String} command #first word of message
*/
function runCommand(message){
  try {
//command list
  let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase();
  switch(command) {
    case "help":
      sendHelp(message);
      break;
    case "eval":
      if (debug&&isDev(message)) {eval(message.content.slice(5))} //DEBUG LINE
      break;
    case "play":
      //make a new instance for handling
      break;
    case "pause":
      //change state of session
      break;
    case "end":
      //kill session early - process end game
      break;
    default:
      message.reply("Invalid Command: "+command).then((m)=>{if (!message.isDM){m.delete(6000)}});
   }
    if (!message.isDM){message.delete()}
  } catch(err) {console.log(err)}
} 
/* isDev -HardCoded
  is message.author a developer. returns a boolean
  @param {Object} message
*/
function isDev(message){
let devs = ["174609192340946944","264960505465143297"];
  return (devs.indexOf(message.author.id)!=-1);
}

function makeEmbed(text, desc, misc) {
    var embed = {
        embed: {
            color: 534636,
            title: text
        }
    }
    embed.embed.description = desc
  for (let i in misc) {
  embed.embed[i] = misc[i]
  }
    return embed
}