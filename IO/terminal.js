var content = $('#content');
var input = $('#input');
var status = $('#status');
var options = $('#options');
var inventory = $('#inventory');
var stats = $('#gameStats');
const Http = new XMLHttpRequest();
const url = "/pipe"
var sessionID = false;
$(document).ready(function() {
  console.log("ready!");
  $.get("/pipe", {
    identifier: sessionID,
    message: '$request_identifier'
  }).done(function(data) {
    console.log(data)
    let dat = JSON.parse(data)
    setDisplay(dat)
  }).fail(function() {
    addMessage("A Connection Error has Occured", true)
  });
});

function addMessage(message, isServer) {
  if (isServer) {
    isServer = ' class="typewriter"'
  } else {
    isServer = ''
  }
  content.append('<p' + isServer + '><span style="color:##33FF33">' + message + '</span></p><br>');
  var element = document.getElementById("content");
  while (element.offsetHeight < element.scrollHeight) {
    element.removeChild(element.getElementsByTagName('p')[0]);
    element.removeChild(element.getElementsByTagName('br')[0]);
  }
}

function goToLog() {
  window.location.href = '/log';
}

function IC(elem, autoPost) {
  if (!autoPost) {
    autoPost = false
  }
  var txt = elem.textContent || elem.innerText;
  if (!autoPost) {
    input.val(input.val() + txt + " ");
  } else {
    sendMSG(txt)
  }
}

function sendMSG(msg) {
  msg = encodeHTML(msg)
  msg = msg.trim()
  input.val('');
  addMessage(">" + msg);
  post(msg)
}
function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
function post(msg) {
  
  $.post("/pipe", {
    identifier: sessionID,
    message: msg
  }).done(function(data) {
    console.log(data)
    let dat = JSON.parse(data)
    setDisplay(dat)
  }).fail(function() {
    addMessage("A Connection Error has Occured", true)
  })
}

function clearChildren(element) {
  var myNode = element;
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

function setDisplay(dat) {
  console.log(dat)
  options.empty()
  inventory.empty()
  stats.empty()
  addMessage(dat.message, true)
  if (!dat.dat) {
    return
  }
  if (dat.dat.options!==undefined) {
    if (dat.dat.options.length>0){
    for (let i = 0; i < dat.dat.options.length; i++) {
      options.append(dat.dat.options[i])
    } } else {options.append("User Input")}
  } else {options.append("User Input")}
  
  if (dat.dat.inventory!==undefined) {
    if (dat.dat.inventory.length>0){
    for (let i = 0; i < dat.dat.inventory.length; i++) {
      inventory.append(dat.dat.inventory[i])
    } } else {inventory.append("Inventory Empty")}
  } else {inventory.append("Inventory Empty")}
  
  if (dat.dat.stats!==undefined) {
    if (dat.dat.stats.length>0){
    for (let i = 0; i < dat.dat.stats.length; i++) {
      stats.append(dat.dat.stats[i])
    } } else {stats.append("No Info Available")}
  } else {stats.append("No Info Available")}
}
$(function() {
  "use strict";
  // for better performance - to avoid searching in DOM
  function escapeHtml(html) {
    var text = document.createTextNode(html);
    var p = document.createElement('div');
    p.appendChild(text);
    return p.innerHTML;
  }
  // Escape while typing & print result
  /**
   * Send message when user presses Enter key
   */
  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      sendMSG(msg)
    }
  });
});