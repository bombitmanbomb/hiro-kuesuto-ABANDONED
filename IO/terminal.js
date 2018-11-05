$(function () {
  "use strict";
  // for better performance - to avoid searching in DOM
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');
  const Http = new XMLHttpRequest();
  const url = "/pipe"
  var sessionID = false;
    
  /**
   * Send message when user presses Enter key
   */
  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      
      addMessage(">" + msg);
      $(this).val('');
      
      $.post( "/pipe", { identifier: sessionID, message: msg })
      .done(function( data ) {
        console.log(data)
        let dat = JSON.parse(data)
        addMessage(dat.message)
      });
     
      // disable the input field to make the user wait until server
      // sends back response
      //input.attr('disabled', 'disabled');
      // we know that the first message sent from a user their name
      //if (myName === false) {
       // myName = msg;
      //}
    }
  });
  /**
   * This method is optional. If the server wasn't able to
   * respond to the in 3 seconds then show some error message 
   * to notify the user that something is wrong.
   */
  
  /**
   * Add message to the chat window
   */
  Http.onreadystatechange=function(){
    console.log(this.responseText);
  
  }
  function addMessage(message) {
    
    content.append('<p><span style="color:##33FF33">'+ message + '</span></p><br>');
    var element = document.getElementById("content");
    while (element.offsetHeight < element.scrollHeight ||
      element.offsetWidth < element.scrollWidth) {
      element.removeChild(element.getElementsByTagName('p')[0]);
      element.removeChild(element.getElementsByTagName('br')[0]);
    } 
  }
});