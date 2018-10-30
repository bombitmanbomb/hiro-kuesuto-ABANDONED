var instancedb;
var entitydb;
var itemdb;
var crypto;
var instance = {};
var client
var fs = require('fs');
const eventListener = async (client, event, guild=null, message=null, extra=null) => {
  
}

/*GAME CODE*/
const init = async (Client) => {
  client = Client;
  var config = {version:"0.0.1"}
  crypto = require("crypto");
  console.log("Engine Loaded.");
  const low = require("lowdb");
  const FileSync = require('lowdb/adapters/FileSync')
  itemdb = low(new FileSync("./datasets/items.json"));
  entitydb = low(new FileSync("./datasets/entities.json"));
  instancedb = low(new FileSync("./datasets/instance.json"));
  instancedb.defaults({'sessions':[]}).write();
  itemdb.defaults({'items':[]}).write();
  entitydb.defaults({'entities':[]}).write();
  updateStatus()
  mapAllSavedInstances()
  console.log("Instances Loaded.")
}




class logData {
  constructor(parent,sessionID) {
    this.module = parent;
    this.session = sessionID;
  }
  
  write(msg,data){
  this.writeLine(this.session,this.module,msg,data);
  }
  init(){
  fs.appendFile('./logs/log'+this.session+'.txt','[Game Log]\n', function (err) {
  })}
  
  writeLine(file,module,message,data){
    let fileinfo = '';
    fileinfo += '['+new Date()+'] ';
    fileinfo += '['+module+'] ';
    fileinfo += message;
    if (data){fileinfo +="=> "+JSON.stringify(data)}
    fs.appendFile('./logs/log'+file+'.txt',fileinfo+"\n" , function (err) {
    if (err) throw err;
    //console.log('fileInfo');
    });
  }
}




function updateStatus(){
client.user.setPresence({ game: { name: ": "+instancedb.get("sessions").value().length+" | >help" }, status: 'active' })}

class Game {
  constructor(message,data){
    if (!data) {
      //all initial generation
      this.ended = false
      this.sessionID = "";
      this.userID = message.author.id;
      this.replyChannel = message.channel.id;
      if (!message.isDM){this.sessionID = message.guild.id} else {this.sessionID = "private"};
      if (!message.isDM){this.sessionID +="-"+message.channel.id} else {this.sessionID +="-private"};
      this.sessionID += "-"+message.author.id;
      this.log = new logData("Game",this.sessionID);
      this.log.init()
      this.log.write("Generating Instance...")
      this.World = new World(undefined,this.sessionID);
      this.Player = new Player(this.World.seedData(),message,undefined,this.sessionID);
      instancedb.read();
      instancedb.get("sessions").push(this).write();
      console.log("saved session to db");
      updateStatus()
    } else {
     //session exists and data was passed
      //set variables
      for (var property in data) {
        this[property] = data[property];
      }
      //overwrite with functions
      this.log = new logData("Game",this.sessionID);
      this.log.write("Loading Instance...");
      this.World = new World(data.World,this.sessionID);
      this.Player = new Player(this.World.seedData(),message,data.Player,this.sessionID);
    }
    this.log.write("Loading Complete.");
  }
  interperator(message) {
    
    
  }
  delete(){
    instancedb.read()
    instancedb.get("sessions").remove('sessionID',this.sessionID).write()
    this.log.write("Deleting Instance.")
  }
  
} //EOF class Game
/* class World
  //constructor()
    {obj} data #pass stored instance data to create an instance w/ old data. else generate new World
    
    
*/
class World {
  constructor(data,sessionID) {
    this.log = new logData("WorldHandler",sessionID)
    if (!data) { //Gen
      this.log.write("Initilizing World...")
      this.gen = new WorldGen(randomValueHex(128),undefined,sessionID);
      this.time = 0.0;
      this.map = this.gen.init();
      this.Room = new Room(this.map);
    } else {
      this.log.write("Loading World...")
      for (var property in data) {
        this[property] = data[property];
      }
      this.log = new logData("WorldHandler",sessionID)
      this.gen = new WorldGen(undefined,data.gen,sessionID); //set gen data
      
    }
   
    this.log.write("World Loaded.");
  }
  //fetch seedData from gen
  seedData() {
    return this.gen.seedData();
  }
  
  init() {
   this.map = this.gen.init() 
  }
  

  addEnemy() {
  
  }

  addLoot() {
  
  }

  addShop() {
  
  }


  createRoomDescription(roomData){
  
  }


}//EOF class World





class WorldGen {
  constructor(seed,data,sessionID){
        this.log = new logData("WorldGen",sessionID)
    if (!data){
      this.log.write("Initilizing WorldGen...")
      this.log.write("Generating with Seed",seed)
      this.seed = seed; 
    } else {
      this.log.write("Loading WorldGen...")
      for (var property in data) {
        this[property] = data[property];
      }
        this.log = new logData("WorldGen",sessionID)
        this.log.write("Loaded Seed",seed)
      
    }
    this.log.write("WorldgGen Loaded.")
  }
  
  //seedData() returns the hexString seed into an array with length of seed.length/2. all numbers will Always be between 0 and 255
  seedData() {
    var obj = [];
    //max 52 vars or 9007199254740990
    for (let i=0;i<this.seed.length;i+=2){
      obj.push(parseInt(this.seed.substring(i,i+2),16));
    }
    return obj;
  }
  init() { //New Game Starting Room Gen
    var startingRoom = [0,0,393216,[3,4,2,0,1,1,1,2,1,3,1]] //pos 0,0 //roomID //Chest-takeAny, 4 items, id:amount, 
    
    return [startingRoom];
  }
  generateFloor() { 
  
  }

  generateRoom() {
  
  }
  
  
//EOF WORLD GEN
}



class Player {
  //seedData is a 32 length array of pseudorandom numbers unique to this session
  constructor(seedData,message,data,sessionID) {
    this.log = new logData("PlayerHandler",sessionID)
    if (!data) {
      this.log.write("Generating Player Character...");
      this.name = message.author.tag
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
      this.log.write("Character Stats",this.stats);
    } else{
      this.log.write("Loading Player...")
     for (var property in data) {
        this[property] = data[property];
      } 
      this.log = new logData("PlayerHandler",sessionID)
      
    }
    this.log.write("Player Loaded.")
  }
  moveNorth() {
  
  }  
  moveSouth() {
  
  }

  moveEast() {
  
  }

  moveWest() {
  
  }
  
  pickupItem(){
  
  }
  
  //EOF player
}
class Room {
  constructor(roomData) {
    this.posX = roomData[0];
    this.posY = roomData[1];
    this.flags = decodeFlag(roomData[2]);
    this.args = roomData[3];
  }
}


function decodeFlag(flag) {
  let d = [flag];
  let i = 0;
  let b;
  while (flag>0) {
    b=(Math.pow(2,i) & flag)
    d[i+1] = (b!==0)
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
  var session = sessions.find(function(x){
  if (x.id===sessionID) {return x};
  });
  return session
}

//Load instancedb into instance by session id
function mapAllSavedInstances(){
  instancedb.read()
  var tInstances = instancedb.get("sessions").value()
  
  for (var i=0;i<tInstances.length;i++){
    instance[tInstances[i].sessionID] = {}
    instance[tInstances[i].sessionID].Game = new Game(undefined,tInstances[i])
  }
  
}

function endGame(sessionID){

}


function randomValueHex(len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len) // return required number of characters
}

function interperator(client,message){


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