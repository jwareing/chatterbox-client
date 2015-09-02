//GLOBAL VARS
var server = 'https://api.parse.com/1/classes/chatterbox';
var allMessages = [];
var allRooms = null;
var currentRoom = 'All';
var friends = [];

// HTML ESCAPING
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
  })
};

// MODELS
var Message = Backbone.Model.extend({
  initialize: function(messageObj){
    this.set('message', messageObj.text);
    this.set('username', messageObj.username);
    this.set('roomname', messageObj.roomname || 'All');
  }
  //message?
});

var Room = Backbone.Model.extend({
  initialize: function(messageObj) {
    this.set('name', messageObj.text);
  }
});

// MODEL COLLECTIONS
var Messages = Backbone.Collection.extend({
  initialize: function(){
    this.set('currentRoom','All');
  },
  model: Message
});

var Rooms = Backbone.Collection.extend({
  model: Room
});

// VIEWS
var MessageView = Backbone.View.extend({

  initialize: function() {

  },

  render: function() {
    var html = [
      '<div class="chat">',
        '<span class="username">',
          escapeHtml(this.model.get('username')),
        '</span>',
        ': ',
        '<span class="text">',
          escapeHtml(this.model.get('message')),
        '</span>',
      '</div>'
    ].join('');
    
    return this.$el.html(html);
  }
});

var RoomView = Backbone.View.extend({
  initialize: function(){},

  render: function(){
    var html = [
      '<option value="',
        escapeHtml(this.model.get('name')),
        '">',
        escapeHtml(this.model.get('name')),
      '</option>'
    ].join('');

    return this.$el.html(html);
  }
});

var RoomsView = Backbone.View.extend({
  initialize: function(){
    this.model.on('change:name', this.render, this)
  },

  render: function(){
    $('select').append(this.model.map(function(room){
      return new RoomView({ model: room }).render();
    }))
  }
});

var MessagesView = Backbone.View.extend({
  initialize: function() {
    this.model.on('change:currentRoom', this.render, this)
  },

  render: function() {
    this.$el.append(this.model.map(function(message) {
      return new MessageView({ model: message }).render();
    }));

    return this.$el;
  }
});

//FETCH FUNCTION
var fetch = function() {
  $.ajax({
    url: server,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      allMessages = [];

      _.each(data.results, function(item){
        allMessages.push(new Message(item));
        // allRooms.push(new Room(item));

      });

      // Add all of these to a new collection:
      var messages = new Messages(allMessages);

      // Associate a view to the collection:
      var messagesView = new MessagesView({ model: messages });

      // Append it to the page (uncomment this when you are ready):
      $('#chats').append(messagesView.render());
    },
    error: function(data){
      console.error('Could not get messages.')
    }
  });
};

fetch();