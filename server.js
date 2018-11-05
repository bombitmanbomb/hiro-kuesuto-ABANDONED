 /*
  Game Bot thing by bomb_and_kou#0669 and PlayStateWolf#3118
*/
 // init project
 var config = {
   "prefix": ">",
   "channels": [],
   "roles": []
 }
 const debug = true //DEBUG
 var bodyParser = require('body-parser');
 ///console.log(process.env.PORT)
 // start of data config
 var fs = require('fs');
 var dbFile = './.data/sqlite.db';
 var exists = fs.existsSync(dbFile);
 var sqlite3 = require('sqlite3').verbose();
 var db = new sqlite3.Database(dbFile, (err) => {
   if (err) {
     console.error(err.message)
   };
   log(true, 'Connected to Dataset.');
 });
 const low = require("lowdb");
 const FileSync = require('lowdb/adapters/FileSync')
 var configFile = low(new FileSync("./.data/config.json"));
 configFile.defaults({
   'config': config
 }).write();
 var leaderboardDB = low(new FileSync("./datasets/leaderboards.json"));
 leaderboardDB.defaults({
   'leaderboard': []
 }).write();
 //end of data config
 fs.writeFileSync('./err/crashlog.txt', "[MASTER LOG]\n");
 const {
   Client
 } = require("discord.js");
 const client = new Client({
   disableEveryone: true
 });
 client.login(process.env.SECRET);
 const game = require("./game.js"); //Game Module
 //Crash Handling
 process.on('uncaughtException', function(err) {
   crash(err, true)
   console.log('Caught exception: ' + err);
 });
 //crash uploading
 function crash(err, unhandled) {
   console.log("Caught Exception: " + err)
   fs.appendFileSync('./err/crashlog.txt', err.toString() + "\n");
   if (unhandled) {
     client.channels.get("508579364212834321").send("UNHANDLED CRASH", {
       files: [{
         attachment: './err/crashlog.txt',
         name: 'crashlog.txt'
       }]
     })
   } else {
     client.channels.get("508579364212834321").send({
       files: [{
         attachment: './err/crashlog.txt',
         name: 'crashlog.txt'
       }]
     })
   }
 }
 //log
 function log(logToConsole, text, data) {
   if (logToConsole) {
     console.log(text);
   }
   text = '[' + new Date() + '] ' + "[SERVER] " + text
   if (data) {
     text += "=> " + JSON.stringify(data)
   }
   if (logToConsole===undefined){return}
   fs.appendFileSync('./err/crashlog.txt', text + "\n");
 }
 //Respond to Pings
 const express = require('express');
 const app = express();
 const path = require("path")
 app.get("/ping", (request, response) => {
   response.sendStatus(200);
 });
 app.get("/", (request, response) => {
   response.sendFile(path.join(__dirname + '/IO/index.html'));
 });
 app.get("/uptime", (request, response) => {
   response.sendFile(path.join(__dirname + '/IO/uptime.html'));
 });
 app.get("/help", (request, response) => {
   response.sendFile(path.join(__dirname + '/IO/help.html'));
 });
 //Site Leaderboard
 app.get("/leaderboard", (request, res) => {
   res.writeHead(200, {
     'Content-Type': 'text/html'
   });
   res.write("<head><title>Leaderboard</title></head>");
   res.write('<body>');
   res.write("<h1>Leaderboards/h1>");
   res.write("=====================");
   leaderboardDB.read();
   let leaderboard = leaderboardDB.get('leaderboard').sortBy('Player.score').value();
   leaderboard.reverse();
   if (leaderboard.length === 0) {
     res.write("<p>No Scores Saved.</p>");
   }
   for (let i = 0; i < leaderboard.length; i++) {
     res.write("<p>#" + (i + 1) + " " + leaderboard[i].Player.name + " | " + leaderboard[i].Player.score + "</p>");
   }
   res.write("<!--Sorry Everything is done server side :)-->");
   res.end("</body>");
 });
 app.get("/log", (request, res) => {
   res.writeHead(200, {
     'Content-Type': 'text/html'
   });
   res.write("<head><title>Running Log</title></head>");
   res.write('<body text="#33FF33" bgcolor="#101010"><code>');
   let dat = "Offline"
   fs.readFile('./err/crashlog.txt', 'utf8', function(err, data) {
     data = data.replace(/(?:\r\n|\r|\n)/g, '<br>');
     if (err) {
       res.end("</body>");
       return console.log(err);
     }
     res.write(data);
     res.end("</code></body>");
   });
 });
 app.get('*', function(req, res) {
   res.sendFile(path.join(__dirname + '/IO/error.html'));
 });
 app.listen(process.env.PORT);
 client.on("error", (err) => {
   console.log(err)
 }); //Error Handling
 //initilization
 client.on("ready", () => {
   log(true, "Bot Loaded.");
   loadBotSettings();
   game.init(client); //Initialize Game Engine
 });
 /* Main Hander
   when a message is sent.
 */
 client.on("message", (msg) => {
   try {
     var message = msg;
     message.isDM = (message.channel.type === "dm")
     log(true, "[CHAT] " + message.author.username + "> " + message.content);
     if (message.content.startsWith(config.prefix)) {
       runCommand(message);
       return;
     } //RUN COMMAND AND STOP PROGRAM
     let games = game.getRunningGames();
     //is the user in a channel with a running game and is the user part of the game
     //Hmm
   } catch (err) {
     crash(err)
   };
 });
 /* loadBotSettings
   update global var config with data in config.json
 */
 function loadBotSettings() {
   configFile.read()
   config = configFile.get("config").value()
 }
 /* sendHelp
   send help info to message.author. returns undefined
   @param {Object} message #client.on message object
 */
 function sendHelp(message) {
   let helpMessage = "";
   helpMessage += "Work in Progress. Info Available on https://sky-tower.glitch.me/\n";
   helpMessage += "Please report All Bugs at https://github.com/bombitmanbomb/hiro-kuesuto/issues\n"
   client.users.get(message.author.id).send(makeEmbed("Help Info", helpMessage));
 }
 /* runCommand 
   run a bot command. autodelete message if text channel. returns undefined.
   @param {Object} message #client.on message object
   --internal--
   @param {Object} args #message split at spaces excluding id [0]
   @param {String} command #first word of message
 */
 function runCommand(message) {
   try {
     //command list
     let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
     let command = args.shift().toLowerCase();
     switch (command) {
       case "help":
         sendHelp(message);
         break;
       case "eval":
         if (debug && isDev(message)) {
           eval(message.content.slice(5))
         } //DEBUG LINE
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
       case "site":
         //send site info
         break;
       case "leaderboard":
         //display leaderboard
         let response = ""
         leaderboardDB.read();
         let leaderboard = leaderboardDB.get('leaderboard').sortBy('Player.score').take(10).value();
         leaderboard.reverse();
         if (leaderboard.length === 0) {
           response = "No Scores Saved.";
         }
         for (let i = 0; i < leaderboard.length; i++) {
           response += "__#" + (i + 1) + "__ | **" + leaderboard[i].Player.name + "** | " + leaderboard[i].Player.score + "\n";
         }
         message.channel.send(makeEmbed("Leaderboard", response))
         break;
       default:
         message.reply("Invalid Command: " + command).then((m) => {
           if (!message.isDM) {
             m.delete(6000)
           }
         });
     }
     if (!message.isDM) {
       message.delete()
     }
   } catch (err) {
     crash(err)
   }
 }
 /* isDev -HardCoded
   is message.author a developer. returns a boolean
   @param {Object} message
 */
 function isDev(message) {
   let devs = ["174609192340946944", "264960505465143297"];
   return (devs.indexOf(message.author.id) != -1);
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