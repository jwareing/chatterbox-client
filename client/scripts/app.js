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
  allMessages: null
};

//Initializes app (calls fetch).
app.init = function(){
  this.fetch();
};

//Gets all data from server (first 100 messages only?) and displays 10 most recent messages.
app.fetch = function() {
  var context = this;

  $.ajax({
    url: this.server,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      context.allMessages = data.results;
      context.displayMostRecent(10);
    },
    error: function(data){
      console.error('Could not get messages.')
    }
  });
};

// Displays 10 most recent messages in archive fetched from server.
app.displayMostRecent = function(num){
  for (var i = 0; i < num; i++) {
    $('#chats').append('<div class="chat"><span class="username">'
      + escapeHtml(this.allMessages[i].username) + ': </span><span class="text">' 
      + escapeHtml(this.allMessages[i].text) + '</span></div>');
  }
};

app.init();

