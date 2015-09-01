//GLOBAL VARS
var server = 'https://api.parse.com/1/classes/chatterbox';
var allMessages = [];
var allRooms = null;
var currentRoom = 'All';
var friends = [];


// MODELS
var Message = Backbone.Model.extend({
  initialize: function(messageObj){
    this.set('message', messageObj.text);
    this.set('username', messageObj.username);
    this.set('roomname', messageObj.roomname || 'All');
  }
  //message?
});



// MODEL COLLECTIONS
var Messages = Backbone.Collection.extend({
  initialize: function(){
    this.set('currentRoom','All');
  },
  model: Message
});

// VIEWS
var MessageView = Backbone.View.extend({

  initialize: function() {

  },

  entityMap: {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  },

  escapeHtml: function(string) {
    var context = this;
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return context.entityMap[s];
    })
  },

  render: function() {
    var html = [
      '<div class="chat">',
        '<span class="username">',
          this.escapeHtml(this.model.get('username')),
        '</span>',
        ': ',
        '<span class="text">',
          this.escapeHtml(this.model.get('message')),
        '</span>',
      '</div>'
    ].join('');
    
    return this.$el.html(html);
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