const levelTiles = [  "&nbsp;",  "╹",
  "╸",
  "╝",
  "╺",
  "╚",
  "═",
  "╩",
  "╻",
  "║",
  "╗",
  "╣",
  "╔",
  "╠",
  "╦",
  "╬"
]
var instancedb;
var entitydb;
var itemdb;
var crypto;
var instance = {};
var client
var fs = require('fs');
var leaderboard
var leaderboardDB
//var grammar 
const LevelGridKeys = require('roguelike/level/gridKeys'); //https://github.com/tlhunter/node-roguelike#level-gridKeys





//SERVER log class





class Log {
  write(logToConsole, text, data) {
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
}
var log = new Log() // init global logging
const eventListener = async (client, event, guild = null, message = null, extra = null) => {}
/*GAME CODE*/
//INITILIZATION
const init = async (Client) => {
  client = Client;
  var config = {
    version: "0.0.1"
  }
  crypto = require("crypto");
  log.write(true, "Engine Loaded.");
  const low = require("lowdb");
  const FileSync = require('lowdb/adapters/FileSync')
  itemdb = low(new FileSync("./datasets/items.json"));
  entitydb = low(new FileSync("./datasets/entities.json"));
  instancedb = low(new FileSync("./datasets/instance.json"));
  leaderboardDB = low(new FileSync("./datasets/leaderboards.json"));
  //grammar = low(new FileSync("./datasets/grammar.json"));
  instancedb.defaults({
    'sessions': []
  }).write();
  itemdb.defaults({
    'items': []
  }).write();
  entitydb.defaults({
    'entities': []
  }).write();
  leaderboardDB.defaults({
    'leaderboard': []
  }).write();
  /*
  grammar.defaults({
    'grammer': {}
  }).write();
  */
  mapAllSavedInstances()
  leaderboard = new Leaderboard(client)
  updateLeaderboard()
  log.write(true, "Instances Loaded.")
}
class Leaderboard {
  constructor(c) {
    this.client = c
    this.channelID = "507409813945188372"
    this.messageID = "508091427402809384"
  }
  //Leaderboard display on leaderboard channel. Displays top 10
  update() {
    this.client.channels.get(this.channelID).fetchMessage(this.messageID).then(message => {
      let embed = "========================\n"
      let leaderboard = leaderboardDB.get('leaderboard').sortBy('Player.score').take(10).value();
      if (leaderboard) {
        leaderboard.reverse()
      }
      let response = ""
      if (leaderboard.length === 0) {
        response = "No Highscores";
      }
      for (let i = 0; i < leaderboard.length; i++) {
        response += "__#" + (i + 1) + "__ | **" + leaderboard[i].Player.name + "** | " + leaderboard[i].Player.score + "\n";
      }
      if (response === "") {
        embed += "No Highscores"
      } else {
        embed += response
      }
      message.edit("", makeEmbed("Leaderboards", embed,{timestamp:new Date(),footer:{text:"Last Updated"}}))
    }).catch(console.error);
  }
}

function updateLeaderboard() {
  leaderboard.update()
}
//Subclass Logging. logs to File for end of session
class logData {
  constructor(parent, sessionID) {
    this.module = parent;
    this.session = sessionID;
  }
  write(logToConsole, msg, data) {
    this.writeLine(this.session, this.module, msg, data, logToConsole);
  }
  init() {
    fs.appendFile('./logs/log' + this.session + '.txt', '[Game Log]\n', function(err) {})
  }
  writeLine(file, module, message, data, logToConsole) {
    let fileinfo = '';
    fileinfo += '[' + new Date() + '] ';
    fileinfo += '[' + intToRGB(hashCode(file)) + '] ';
    fileinfo += '[' + module + '] ';
    fileinfo += message;
    if (data) {
      fileinfo += "=> " + JSON.stringify(data)
    }
    if (logToConsole === undefined) {
      return console.log(fileinfo)
    }
    fs.appendFileSync('./err/crashlog.txt', fileinfo + "\n");
    fs.appendFile('./logs/log' + file + '.txt', fileinfo + "\n", function(err) {
      if (err) throw err;
      if (logToConsole) {
        console.log(fileinfo);
      }
    });
  }
}
//update # of users playing
function updateStatus() {
  client.user.setPresence({
    game: {
      name: ": " + Object.keys(instance).length+ " | >help"
    },
    status: 'active'
  })
}
//class Game. Main Class.
class Game {
  constructor(message, data, sessionID) {
    if (!data) {
      //all initial generation
    
      this.state = "setup"
      this.ended = false
      this.sessionID = "";
      this.userID = message.author.id;
      this.replyChannel = message.misc.reply
      this.sessionID = sessionID
      this.log = new logData("Game", this.sessionID);
      this.log.init()
      this.int = {}
      this.int.last = {reply:"",options:[],inventory:[],stats:[],vars:null,ignore:false}
      this.int.newGame=true
      this.log.write(true, "Generating Instance...", {
        'ID': this.sessionID
      })
      this.World = new World(undefined, this.sessionID);
      this.Player = new Player(this.World.seedData(), message, undefined, this.sessionID);
    } else {
      //session exists and data was passed
      //set variables
      for (var property in data) {
        this[property] = data[property];
      }
      //overwrite with functions
      this.log = new logData("Game", this.sessionID);
      this.log.write(true, "Loading Instance...");
      this.World = new World(data.World, this.sessionID);
      this.Player = new Player(this.World.seedData(), message, data.Player, this.sessionID);
    }
    this.log.write(true, "Generation Complete.");
  }
  save(dat,last) {
    this.log.write(true, "Saving Instance.")
    instancedb.read();
    //console.log(this)
    if (last){this.int.last = last}
    this.int.last.vars = null
    instancedb.get("sessions").remove({"sessionID":this.sessionID}).write()
    instancedb.get("sessions").push(this).write();
    log.write(true, "Saved Session=>" + this.sessionID);
    updateStatus()
    if (last){this.int.last = last}
  }
  end() {
    instancedb.read()
    instancedb.get("sessions").remove('sessionID', this.sessionID).write()
    this.log.write(true, "Deleting Instance.");
    this.ended = true
    return this.Player
  }
  start() {
  console.log("Game Starting")
  }
  parseIncoming(message) {
    if (!message.content) {
    this.log.write(true, "[Interpreter] " + message.message)
    } else {
     this.log.write(true, "[Interpreter] " + message.content) 
    }
    let repDat = GlobalInterpreter(message,this)
    for (var property in repDat.vars) {
        this[property] = repDat.vars[property];
    }
    this.int.last = repDat.reply
    if (repDat.action=="SAVE"){this.save(undefined,this.int.last)}
    return repDat.reply
  }
}
function GIrep(reply,THIS,ACTION) {
  if (!ACTION){ ACTION = false;}
 return {"reply":reply,"vars":THIS,action:ACTION}
}


function GlobalInterpreter(message,THIS){
  if (!message.content){message.content = message.message}
  let reply = {
    reply:"",
    options:[],
    stats:[]
  }
  let temp = {}
  message.lowercase = String(message.content).toLowerCase()//lowerCase
  if (message.lowercase==="play"||message.lowercase=="repeat"){
    if (!THIS.int.newGame){
      return GIrep(THIS.int.last,THIS) //repeat last message
    } else { 
    THIS.int.newGame = false
    THIS.state = "playerCreation"
      //NEW GAME START
    }
   }
  if (THIS.int.newGame){ // play has never been run
    reply.reply = "No Running Game. Use "+makeButton("play", true, message)
    reply.options = [makeButton("play", true, message)]
  return GIrep(reply,THIS)
  }
  //begin game
  //Player Creation
    if (THIS.state.startsWith("playerCreat")){
      temp.state = THIS.state
      reply.stats = ["Player Creation"]
    if (temp.state.length>15){temp.state = temp.state.slice(15);} else {
    //STEP 1
      reply.options = ["User input"]
      reply.reply = "What is your name?"
      THIS.state = "playerCreation-1"
      return GIrep(reply,THIS)
    }
      temp.state = Number(temp.state)
    switch (Number(temp.state)) {
      case 1:                  
        THIS.int.tempName = message.content
        reply.reply = "Is the name "+makeButton(message.content,false,message)+" correct? ("+makeButton("Yes",true,message)+"/"+makeButton("No",true,message)+")"
        reply.options.push(makeButton("Yes",true,message))
        reply.options.push(makeButton("No",true,message))
        THIS.state = "playerCreation-2"
        return GIrep(reply,THIS)
        break
      case 2:
        if (!yesno(message.lowercase)){
        reply.options = ["User input"]
        reply.reply = "What is your name?"
        THIS.state = "playerCreation-1"
        return GIrep(reply,THIS)
        } else {
          THIS.Player.name = THIS.int.tempName
          THIS.int.tempName = null
          reply.reply = "You will now be known as "+makeButton(THIS.Player.name,false,message)+"."+lineBreak(message)+"Select your Class:"+lineBreak(message)+"TODO"    
          THIS.state = "playerCreation-3"
          return GIrep(reply,THIS)
        }
      break
      case 3:
        
      break
      case 4:
        
      break
      case 5:
        
      break
      default:
        
      break
    }
}  
      
      
      
      
  

  if (message.lowercase==="save"){
    reply = {}
    reply = THIS.int.last
    //console.log(reply.reply)
    reply.reply = "Session Saved."+lineBreak(message)+reply.reply
    reply.options = THIS.int.last.options
    reply.inventory = THIS.int.last.inventory
    reply.stats = THIS.int.last.stats
    return GIrep(reply,THIS,"SAVE");
  }
  //parse commands from lowercase
  var commands = cmdParser(message.lowercase)
  //Game
  
  
  
  
  
  
  
  
  reply = {reply:"Interpreter Offline for Maintinance.",options:["OFFLINE"],inventory:["OFFLINE"],"stats":["OFFLINE"]}
  temp = undefined //remove temp vars
  return GIrep(reply,THIS)
}

function yesno(msg){
msg = msg.toLowerCase()
  switch(msg){
    case "y":
     return true
    case "yes":
      return true
    case "no":
      return false
    case "n":
      return false
    default:
      return false
    }
}



const grammar = {}
function cmdParser(message) {
  //grammer.read()
  let cmdlist = []
  let cmdstrings = []
  //let g = grammar.get("grammer").value()
  
  
  
  

return {}
}
function lineBreak(message){
if (!message) {
		message = {};
		message.isWEB = true
	}
  if (!message.isWEB) {
		return "\n"
	}
  return "<br>"
}

/*
Incoming: 
  String text: Button Text 
  Boolean autoSEND: Will clicking send only the text in. if not add to input.
  message: Full Message Object
Outgoing:
  String response
*/
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
		return "`"+text+"`"
	}
	return "<button " + classDat + "onclick='IC(this," + autoSEND + ");'>" + text + "</button>" //IC() is in terminal.js
}
/* class World
  //constructor()
    {obj} data #pass stored instance data to create an instance w/ old data. else generate new World 
*/
class World {
  constructor(data, sessionID) {
    this.log = new logData("WorldHandler", sessionID)
    if (!data) { //Gen
      this.log.write(true, "Initilizing World...")
      this.gen = new WorldGen(randomValueHex(128), undefined, sessionID);
      this.time = 0.0;
      this.map = this.gen.init();
      this.Room = new Room(this.map);
    } else {
      this.log.write(true, "Loading World...")
      for (var property in data) {
        this[property] = data[property];
      }
      this.log = new logData("WorldHandler", sessionID)
      this.gen = new WorldGen(undefined, data.gen, sessionID); //set gen data
    }
    this.log.write(true, "World Loaded.");
  }
  //fetch seedData from gen
  seedData() {
    return this.gen.seedData();
  }
  init() {
    this.map = this.gen.init()
  }
  addEnemy() {}
  addLoot() {}
  addShop() {}
  createRoomDescription(roomData) {}
} //EOF class World
class WorldGen {
  constructor(seed, data, sessionID) {
    this.temp = {}
    this.log = new logData("WorldGen", sessionID)
    if (!data) {
      this.log.write(true, "Initilizing WorldGen...")
      this.log.write(true, "Generating with Seed", seed)
      this.seed = seed;
      this.floor = 0
    } else {
      this.log.write(true, "Loading WorldGen...")
      for (var property in data) {
        this[property] = data[property];
      }
      this.log = new logData("WorldGen", sessionID)
      this.log.write(true, "Loaded Seed", seed)
    }
    this.log.write(true, "WorldgGen Loaded.")
  }
  //seedData() returns the hexString seed into an array with length of seed.length/2. all numbers will Always be between 0 and 255
  seedData() {
    var tDat = [];
    //max 52 vars or 9007199254740990
    for (let i = 0; i < this.seed.length; i += 2) {
      tDat.push(parseInt(this.seed.substring(i, i + 2), 16));
    }
    return tDat;
  }
  init() { //New Game Starting Room Gen
    this.log.write(true, "Creating Level Instance.")
    var startingRoom = [0, 0, 393216, [3, 4, 2, 0, 1, 1, 1, 2, 1, 3, 1]];
    this.mapData = [startingRoom];
    this.log.write(true, "Starting Room Generated", this.mapData);
    return this.mapData;
  }
  //Generate level with properties based on seed
  createLevel() {
    this.temp.levelDat = {}
    this.temp.levelDat.tDat = this.seedData()
    this.temp.levelDat.roomCount = Math.max(3, (this.floor + (Math.max(this.floor, Math.min(this.temp.levelDat.tDat[4], this.temp.levelDat.tDat[6])) % Math.min(this.floor, Math.max(this.temp.levelDat.tDat[4], this.temp.levelDat.tDat[6])))));
    this.temp.levelDat.roomCount += Math.max(1, (Math.floor((this.temp.levelDat.roomCount * 0.18) + (this.temp.levelDat.tDat[Math.floor(this.temp.levelDat.tDat[Math.floor(this.temp.levelDat.tDat[0] / 255 * 51)] / 255 * 51)] / 255))));
    this.temp.levelDat.keyCount = Math.max(1, (Math.floor(this.temp.levelDat.roomCount * 0.13)));
    //thats a lot
  }
  generateFloor(roomCount, keyCount) {
    this.log.write(true, "Creating Floor", this.floor);
    this.temp.levelObj = new LevelGridKeys({
      rooms: roomCount,
      keys: keyCount
    });
    this.levelData = this.temp.levelObj.generate();
    delete this.temp.levelObj
  }
  //EOF WORLD GEN
}
class Player {
  //seedData is a 32 length array of pseudorandom numbers unique to this session
  constructor(seedData, message, data, sessionID) {
    this.log = new logData("PlayerHandler", sessionID)
    if (!data) {
      this.log.write(true, "Generating Player Character...");
      this.name = message.author.tag
      this.score = 0;
      this.posX = 0;
      this.posY = 0;
      this.stats = {}
      this.floor = 0;
      this.stats.level = 1;
      this.stats.exp = 0;
      this.bag = [];
      this.equipped = -1;
      //Stats
      this.stats.HPMax = 100;
      this.stats.HP = 100;
      this.stats.Str = 150;
      this.stats.Con = 130;
      this.stats.Def = 110;
      this.stats.Atk = 130;
      this.stats.Int = 70;
      this.stats.Spd = 100;
      //modify stats
      this.log.write(true, "Character Stats", this.stats);
    } else {
      this.log.write(true, "Loading Player...")
      for (var property in data) {
        this[property] = data[property];
      }
      this.log = new logData("PlayerHandler", sessionID)
    }
    this.log.write(true, "Player Loaded.", data)
  }
  //Movement
  moveNorth() {}
  moveSouth() {}
  moveEast() {}
  moveWest() {}
  pickupItem() {}
  //EOF player
}
//room class
class Room {
  constructor(roomData) {
    this.posX = roomData[0];
    this.posY = roomData[1];
    this.flags = decodeFlag(roomData[2]);
    this.args = roomData[3];
  }
}
  
//Decode integer flag into an array of booleans
function decodeFlag(flag) {
  let d = [flag];
  let i = 0;
  let b;
  while (flag > 0) {
    b = (Math.pow(2, i) & flag)
    d[i + 1] = (b !== 0)
    flag -= b
    i++
  }
  return d
}
/* getRunningGames
  get list of running sessions. returns Object
*/
function getRunningGames() {
  instancedb.read()
  return instancedb.get("sessions").value()
}
/* getSession
  get session info. returns array
  @param {String} sessionID
*/
function getSession(sessionID) {
  var sessions = getRunningGames()
  var session = sessions.find(function(x) {
    if (x.sessionID === sessionID) {
      return x
    };
  });
  return session
}
function createSession(message) {
  var sessions = getRunningGames()
  var session = sessions.find(function(x) {
    if (x.sessionID === message.sessionID) {
      return x
    };
  });
  if (session) {return false}
  let game = new Game(message,undefined,message.sessionID)
  game.save();
  mapAllSavedInstances();
  game.start()
}
function saveAll(){
  var sessionList = Object.keys(instance);
  for (let i = 0;i<sessionList.length;i++){
    
    instance[sessionList[i]].Game.save()
  }
}

//Load instancedb into instance by session id
function mapAllSavedInstances() {
  instancedb.read()
  var tInstances = instancedb.get("sessions").value()
  for (var i = 0; i < tInstances.length; i++) {
    instance[tInstances[i].sessionID] = {}
    instance[tInstances[i].sessionID].Game = new Game(undefined, tInstances[i])
  }
  updateStatus() // update # of sessions displayed on bot description
}
//End the Session Forcefully
function endGame(sessionID) {}
//create a random seed with length len
function randomValueHex(len) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex') // convert to hexadecimal format
    .slice(0, len) // return required number of characters
}
/* interperator
  @param {Object} client Discord Client object
  @param {Object} message Discord Message Object OR Spoofed Web Object
  runs method through game.
*/
function interperator(message) {
  return instance[message.sessionID].Game.parseIncoming(message)
}
/* makeEmbed
  @param {String} text Embed Title
  @param {String} desc Embed Description
  @param {Object} misc Embed Fields
  Returns embed object. Can be directly plugged into .send()
*/
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
//simple hash
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
module.exports.eventListener = eventListener;
module.exports.init = init;
module.exports.getRunningGames = getRunningGames;
module.exports.interperator = interperator;
module.exports.decodeFlag = decodeFlag; //testing
module.exports.Room = Room; //testing
module.exports.Player = Player // testing
module.exports.Game = Game // testing
module.exports.instance = instance // testing
module.exports.mapAllSavedInstances = mapAllSavedInstances;
module.exports.randomValueHex = randomValueHex;
module.exports.getSession = getSession;
module.exports.createSession = createSession;
module.exports.saveAll = saveAll