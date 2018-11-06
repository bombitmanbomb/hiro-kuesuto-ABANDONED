
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');
  const Http = new XMLHttpRequest();
  const url = "/pipe"
  var sessionID = false;
  $(document).ready(function() {
    console.log( "ready!" );
  $.get( "/pipe", { identifier: sessionID, message: '$request_identifier'})
      .done(function( data ) {
        console.log(data)
        let dat = JSON.parse(data)
        addMessage(dat.message,true)
      }).fail(function() {
      addMessage("A Connection Error has Occured",true)
});
});
function addMessage(message,isServer) {
    if (isServer){isServer=' class="typewriter"'} else {isServer=''}
    content.append('<p'+isServer+'><span style="color:##33FF33">'+ message + '</span></p><br>');
    
    var element = document.getElementById("content");
    while (element.offsetHeight < element.scrollHeight) {
      element.removeChild(element.getElementsByTagName('p')[0]);
      element.removeChild(element.getElementsByTagName('br')[0]);
    } 
  }
function goToLog(){
window.location.href = '/log';}
function IC(elem){
  var txt = elem.textContent || elem.innerText;
  input.val(input.val() + txt+" "); 
}
$(function () {
  "use strict";
  // for better performance - to avoid searching in DOM
  
    
  
  function escapeHtml(html){
  var text = document.createTextNode(html);
  var p = document.createElement('p');
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
      msg = msg.trim()
      
      addMessage(">" + msg);
      $(this).val('');
      post(msg)
      
    }
  });
  function post(msg){
  $.post( "/pipe", { identifier: sessionID, message: msg})
      .done(function( data ) {
        console.log(data)
        let dat = JSON.parse(data)
        addMessage(dat.message,true)
      }).fail(function() {
      addMessage("A Connection Error has Occured",true)
    })
  }
  
});