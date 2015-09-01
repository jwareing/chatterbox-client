$(document).ready(function() {
  // Submit message on button click
  $('.button').on('click',function(){
    if (app.currentRoom === "NEW ROOM"){
      app.currentRoom = prompt("What is the name of your new room?");
    }

    var myMessage = $('#message').val();
    var message = {
      username: userName,
      text: myMessage,
      roomname: app.currentRoom
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

  $(document).on('click','.username', function() {
    app.friends.push($(this).text());
    app.friends = _.uniq(app.friends);
    console.log(app.friends);
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
  currentRoom: 'All',
  friends: []
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
      context.displayMostRecent(app.currentRoom);
    },
    error: function(data){
      console.error('Could not get messages.')
    }
  });

};

app.roomListUpdate = function(){
  $('select > option').remove();
  this.allRooms = _.uniq(_.pluck(this.allMessages, 'roomname'));
  $('select').append('<option value="All" id="All">All</option>');
  $('select').append('<option value="NEW ROOM" id="NEW ROOM">NEW ROOM</option>')
  for (var i = 0; i < this.allRooms.length; i++) {
    if (this.allRooms[i] !== undefined && this.allRooms[i] !== '') {
      $('select').append('<option value=' + escapeHtml(this.allRooms[i]) 
        + ' id=' + escapeHtml(this.allRooms[i]) + '>' 
        + escapeHtml(this.allRooms[i]) + '</option>');
    }
  }
  $('#' + app.currentRoom).attr('selected',true);

};

app.displayMostRecent = function(room){
  $('#chats > div').remove();
  if (room === 'All'){
    for (var i = 0; i < this.allMessages.length; i++) {
      app.append(this.allMessages[i]);
    }
  }
  else {
    for (var i = 0; i < this.allMessages.length; i++) {
      if(this.allMessages[i].roomname === room){
        app.append(this.allMessages[i]);
      }
    }
  }

  $('.username').each(function(el) {
    //debugger;
    if (app.friends.indexOf($(this).text()) !== -1){
      $(this).parent().toggleClass('friend');
    }
  });
};

app.append = function(message) {
  $('#chats').append('<div class="chat"><span  class="username">'
      + escapeHtml(message.username) + '</span>: <span class="text">' 
      + escapeHtml(message.text) + '</span></div>');

  // var el = '<div class="chat"><span  class="username">'
  //     + escapeHtml(message.username) + '</span>: <span class="text';

  // if (app.friends.indexOf(message.username) !== -1) {
  //   el += ' friend';
  // }

  // el += '">' + escapeHtml(message.text) + '</span></div>';
}

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

setTimeout(app.roomListUpdate.bind(app), 3000);
