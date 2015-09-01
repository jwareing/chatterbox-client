$(document).ready(function() {
  // Submit message on button click
  $('.button').on('click',function(){
    var myMessage = $('#message').val();
    var message = {
      username: userName,
      text: myMessage,
      roomname: '4chan'
    };
    app.send(message);
  });

  // Submit message on enter key press
  $('#message').keypress(function(e) {
    var key = e.which;
    if (key === 13) {
      $('.button').click();
      this.value = '';
      return false;
    }
  });
$('select').on( "change", function(){
  app.currentRoom = this.value;
  app.displayMostRecent(app.currentRoom);
  app.roomListUpdate();
  console.log(app.currentRoom);

});

});


// entityMap and escapeHtml deal with user input that can cause errors from XSS attacks.
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
var escapeHtml = function(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};


//Sets up app object, which contains all variables and methods for chatterbox app.
var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  allMessages: null,
  allRooms: null,
  currentRoom: null
};

var search = window.location.search;
var userName = search.substring(search.lastIndexOf('=')+1);

//Initializes app (calls fetch).
app.init = function(){
  this.fetch();
};

//Gets all data from server (first 100 messages only?) and displays 10 most recent messages.
app.fetch = function() {
  var context = this;
  // debugger;
  $.ajax({
    url: this.server,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      context.allMessages = data.results;
      //context.roomListUpdate();
      //context.displayMostRecent();
    },
    error: function(data){
      console.error('Could not get messages.')
    }
  });

};

app.roomListUpdate = function(){
  $('select > option').remove();
  this.allRooms = _.uniq(_.pluck(this.allMessages, 'roomname'));
  $('select').append('<option value="All">All</option>');
  for (var i = 0; i < this.allRooms.length; i++) {
    if (this.allRooms[i] !== undefined && this.allRooms[i] !== '') {
      $('select').append('<option value=' + escapeHtml(this.allRooms[i]) + '>' 
        + escapeHtml(this.allRooms[i]) + '</option>');
    }
  }
};

app.displayMostRecent = function(room){
  $('#chats > div').remove();
  for (var i = 0; i < this.allMessages.length; i++) {
    if(this.allMessages[i].roomname === room){
      $('#chats').append('<div class="chat"><span class="username">'
        + escapeHtml(this.allMessages[i].username) + ': </span><span class="text">' 
        + escapeHtml(this.allMessages[i].text) + '</span></div>');
    }
  }
};

// Posts new message to chatterbox
app.send = function(message){
  $.ajax({
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('Message sent, doofus.');
    },
    error: function(data){
      console.error('Could not get messages.')
    }
  });
};

app.init();
//debugger;
setInterval(app.fetch.bind(app), 10000);

setTimeout(app.roomListUpdate.bind(app), 5000);
