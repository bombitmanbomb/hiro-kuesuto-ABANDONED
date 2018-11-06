/*
  Game Bot thing by bomb_and_kou#0669 and PlayStateWolf#3118
*/
// init project
var config = {
	"prefix": ">",
	"entry": "507401000903114763",
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
var webstorage = low(new FileSync("./.data/webTEMP.json"));
webstorage.defaults({
	'users': []
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
/*

process.on('uncaughtException', function(err) {
   crash(err, true)
   console.log('Caught exception: ' + err);
 });
*/
//A Crash has Occured. Upload the Main Log
function crash(err, unhandled) {
	console.log("Caught Exception: " + err)
	fs.appendFileSync('./err/crashlog.txt', err.toString() + "\n");
	if (unhandled) {
		client.channels.get("508579364212834321").send("<@&507408030342578176>```FATAL ERROR```", {
			files: [{
				attachment: './err/crashlog.txt',
				name: 'crashlog.txt'
			}]
		})
	} else {
		client.channels.get("508579364212834321").send("<@&507408030342578176>", {
			files: [{
				attachment: './err/crashlog.txt',
				name: 'crashlog.txt'
			}]
		})
	}
}
/*log to console
@param {*} logToConsole true display on console and write to file, false write to file and do not display in console, undefined write to console but do not write to file. 
@param {String} text Text to display
@param {*} data Any data to be appended
Logs info. Use instead of console.log
*/
function log(logToConsole, text, data) {
	if (logToConsole) {
		console.log(text);
	}
	text = '[' + new Date() + '] ' + "[SERVER] " + text
	if (data) {
		text += "=> " + JSON.stringify(data)
	}
	if (logToConsole === undefined) {
		return
	}
	fs.appendFileSync('./err/crashlog.txt', text + "\n");
}
//Respond to Pings
const express = require('express');
const app = express();
const path = require("path")
app.set('trust proxy', true)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.get("/ping", (request, response) => {
	response.sendStatus(200);
});
app.get("/animate.css", (request, response) => {
	response.sendFile(path.join(__dirname + '/_css/animate.css'));
});
app.get("/crt.css", (request, response) => {
	response.sendFile(path.join(__dirname + '/_css/crt.css'));
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
app.get("/play", (request, response) => {
	response.sendFile(path.join(__dirname + '/IO/terminal.html'));
});
app.get("/IO/terminal.js", (request, response) => {
	response.sendFile(path.join(__dirname + '/IO/terminal.js'));
});

app.post('/pipe', function (req, res) {
	var id = req.ip
	let dat = req.body
	dat.identifier = intToRGB(hashCode(id))
	log(true, "[WEB] [" + dat.identifier + "] " + dat.message)
	//parse and handle
	dat.isWEB = true
	let response = handleWEB(dat, id)
	log(true, "[WEB] [" + dat.identifier + "] " + response.reply)
	res.send(JSON.stringify({
		identifier: "SERVER",
		message: response.reply,
		dat: {
      inventory: response.inventory,
			options: response.options,
			stats: ["v0.1.8"]
		}
	}));
});
app.get('/pipe', function (req, res) {
	var id = req.ip
	let dat = req.body

	log(true, "[WEB] [P_CON] [" + intToRGB(hashCode(id)) + "] $connect")
	log(true, "[WEB] [P_CON] [" + intToRGB(hashCode(id)) + "] User Connection Established")
	res.send(JSON.stringify({
		identifier: "SERVER",
		message: "Connection to Server Established. " + makeButton("play", true),
		dat: {
			options: [makeButton("play", true)],
      inventory:[],
			stats: ["v0.1.8"]
		}
	}));
});

//Site Leaderboard
app.get("/leaderboard", (request, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('<html lang="en" class="animated fadeIn crt" oncontextmenu="return false;">');
	res.write('<head><title>Leaderboard</title><link rel="stylesheet" href="animate.css"><link rel="stylesheet" href="crt.css"></head>');
	res.write('<body text="#33FF33" bgcolor="#101010"><section><code>');
	res.write('<a href="/">[Back]</a><br>')
	res.write("<h1>Leaderboards</h1>");
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
	res.end('</code></section><style>a:link, a:visited {    color: #33FF33;  text-decoration: none;}  a:hover,a:hover:visited {    background-color: #33ff33;    color: #101010;    padding: 0px 0px;    text-align: center;    text-decoration: none;    display: inline-block;} section {        background: #101010;        color: #33FF33;        border-radius: 1em;        padding: 1em;        position: absolute;        top: 50%;        left: 50%;        margin-right: -50%;        transform: translate(-50%, -50%) }html{cursor:context-menu;  -webkit-touch-callout: none; /* iOS Safari */    -webkit-user-select: none; /* Safari */     -khtml-user-select: none; /* Konqueror HTML */       -moz-user-select: none; /* Firefox */        -ms-user-select: none; /* Internet Explorer/Edge */            user-select: none;}</style></body><script>document.body.style.zoom="150%"</script></html>');
});


app.get("/log", (request, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('<html lang="en" class="animated fadeIn crt" oncontextmenu="return false;">');
	res.write('<head><title>Running Log</title><link rel="stylesheet" href="animate.css"><link rel="stylesheet" href="crt.css"></head>');
	res.write('<body text="#33FF33" bgcolor="#101010"><code>');
	res.write('<a href="/">[Back]</a>&nbsp;<a href="/log">[Refresh]</a><br>')
	let dat = "Offline"
	fs.readFile('./err/crashlog.txt', 'utf8', function (err, data) {
		data = data.replace(/(?:\r\n|\r|\n)/g, '<br>');
		if (err) {
			res.end("</body>");
			return console.log(err);
		}
		res.write(data);
		res.end('</code><style>a:link, a:visited {    color: #33FF33;  text-decoration: none;}  a:hover,a:hover:visited {    background-color: #33ff33;    color: #101010;    padding: 0px 0px;    text-align: center;    text-decoration: none;    display: inline-block;} section {        background: #101010;        color: #33FF33;        border-radius: 1em;        padding: 1em;        position: absolute;        top: 50%;        left: 50%;        margin-right: -50%;        transform: translate(-50%, -50%) }button, button:focus{ padding: 0px 0px;        border:  0px solid white;    color: #33FF33;  text-decoration: none;        background-color:#101010;    outline-width: 0;}  button:hover{    outline-width: 0;    background-color: #33ff33;    color: #101010;    padding: 0px 0px;    text-align: center;    text-decoration: none;    display: inline-block;}html{cursor:context-menu;  -webkit-touch-callout: none; /* iOS Safari */    -webkit-user-select: none; /* Safari */     -khtml-user-select: none; /* Konqueror HTML */       -moz-user-select: none; /* Firefox */        -ms-user-select: none; /* Internet Explorer/Edge */            user-select: none;}</style></body><script>document.body.style.zoom="150%"</script></html>');
	});
});
app.get('*', function (req, res) {
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


function makeButton(text, autoSEND, message) {
	var classDat = ""
	if (!message) {
		message = {};
		message.isWEB = true
	}
	if (!autoSEND) {
		autoSEND = false
	} else {
		classDat = "class='autoSend' "
	}
	if (!message.isWEB) {
		return text
	}
	return "<button " + classDat + "onclick='IC(this," + autoSEND + ");'>" + text + "</button>"
}


var WEB = {}

function handleWEB(msg, ipstring) {
	var id = "WEB-" + intToRGB(hashCode(ipstring))
	if (!WEB[id]) {
		WEB[id] = {
			stage: 0
		}
	}
  var rep = {}
	rep.reply = 'The server could not handle your request at this time. <button class="help" onclick="goToLog()">0xF980</button>'
  rep.options = []
  rep.inventory = []
	if (!msg.identifier) {
		log(true, "Error Occured. No Identifier.")
		return "An Unhandled Error has Occured (No_IP)"
	}
	rep.reply = "I Dont Understand."
	switch (WEB[id].stage) {

		case 0:
			if (msg.message !== "play") {
        rep.options.push(makeButton("Play",true))
				break;
			}
			rep.reply = "What is your name?"
			WEB[id].stage++
				break;
		case 1:
			rep.reply = "You're name is " + msg.message + ". Confirm? (" + makeButton("Yes", true) + "/" + makeButton("No", true) + ")"
			rep.options.push(makeButton("Yes", true))
      rep.options.push(makeButton("No", true))
      WEB[id].stage++
				WEB[id].temp = {
					name: msg.message
				}
			break;
		case 2:
			if (msg.message.toLowerCase() === "yes") {
				WEB[id].stage++;
				rep.reply = "Welcome to TTA " + WEB[id].temp.name + ". This is not done yet and is just to test chat mechanics. You can now " + makeButton("Enter the Dungeon", true);
        rep.options.push(makeButton("Enter the Dungeon",true))
				WEB[id].name = WEB[id].temp.name;
				delete WEB[id].temp;
			} else {
				WEB[id].stage = 1;
				rep.reply = "What is your name?";
			}
			break;
		case 3:
			if (msg.message.toLowerCase() === "enter the dungeon") {
				WEB[id].stage++
			}
			rep.reply = "You enter the Dungeon.<br/>You are standing in a Well Lit room. There is a " + makeButton("Chest") + " here.<br/>There are doors on the " + makeButton("North") + " and " + makeButton("West") + " sides of the room."
      rep.options.push(makeButton("Open"))
      rep.options.push(makeButton("Go"))
      rep.options.push(makeButton("Chest"))
      rep.options.push(makeButton("North"))
      rep.options.push(makeButton("West"))
		case 4:

			break
		default:
			rep.reply = "Command Invalid."
			break
	}


	//log(true,"")
	return rep
}

function handleMessage(msg) {
	try {
		var message = msg;
		if (message.isWEB) {
			return
		}
		message.isDM = (message.channel.type === "dm")
		if (message.author.bot) {
			return
		}
		message.isDM = (message.channel.type === "dm")
		if (message.content.startsWith(config.prefix)) {
			runCommand(message);
			return;
		} //RUN COMMAND AND STOP PROGRAM
		if (message.isDM) {
			message.sessionID = "private-" + message.author.id
		} else {
			message.sessionID = message.channel.id + "-" + message.author.id
		}
		let myGame = game.getSession(message.sessionID)
		if (!myGame) {
			message.validSession = false
		} else {
			message.validSession = true
		}
		if (!message.isDM) {
			if (message.channel.id !== config.entry && message.validSession !== true) {
				return
			}
		}
		if (!message.validSession) {
			return
		}
		//if (message.author.bot){return log(true, "[INFO] " + message.author.username + "> " + message.content);}
		game.interperator(client, message)
	} catch (err) {
		crash(err)
	};
}

/* Main Hander
  when a message is sent.
*/
client.on("message", (msg) => {
	handleMessage(msg)
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
		log(true, "[COMMAND] " + message.author.username + "> " + message.content);
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

function hashCode(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}
//turn Integer to RGB Hex string
function intToRGB(i) {
	var c = (i & 0x00FFFFFF).toString(16).toUpperCase();
	return "00000".substring(0, 6 - c.length) + c;
}