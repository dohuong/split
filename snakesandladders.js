// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");
SnakesandLadders = new Mongo.Collection("snakesandladders");

var rolls = 0;
var message = [ ];
var status = "active";

if (Meteor.isClient) {
  Template.game.helpers({
    players: function () {
      return Players.find({}, { sort: { index: 1 } });
    },
    selectedName: function () {
      var player = Players.findOne(Session.get("selectedPlayer"));
      return player && message[message.length - 1];
    }
  });

  Template.game.events({
    'click .inc': function () {
      if (status === "active") {
        rolls++;
        var d = Math.floor(Math.random() * 6) + 1;
        var player = Players.findOne(Session.get("selectedPlayer"));
        var inc = (player.position + d > 100) ? 100 - (player.position + d): d;
        Players.update(Session.get("selectedPlayer"), {$inc: {position: inc}});
        var msg = player.name + " gets " + d + ", moves from " + player.position + " to " + (player.position + inc) + ". ";
        message.push(msg);
        console.log(msg);

        player = Players.findOne(Session.get("selectedPlayer"));
        var start = player.position;
        if (SnakesandLadders.find({"start": start}).count() == 1) {
          Players.update(Session.get("selectedPlayer"),  {$set: {position: SnakesandLadders.findOne({"start": start}).end}});
          player = Players.findOne(Session.get("selectedPlayer"));
          var end = player.position;
          var m = (start > end) ? "snake" : "ladder";
          msg = msg + player.name + " lands on a " + m + ", moves from " + start + " to " + end + ".";
          message.push(msg);
          console.log(msg);
        }

        Meteor.call("resetScore",player);

        if (player.position === 100) {
          var msg = player.name + " wins !!!";
          message.push(msg);
          console.log(msg);
          status = "end";
          return;
        }
        else {
          var nextPlayer = Players.findOne({"index": player.index % 4 + 1});
          Session.set("selectedPlayer", nextPlayer._id);
          console.log(Players.findOne(Session.get("selectedPlayer")).name + "'s turn");
          return;
        }
      }
    },
    'click .reset': function(){
      rolls = 0;
      status = "active"
      Session.set("selectedPlayer", 0);
      Meteor.call("reset");
      var msg = "Game Reset";
      message.push(msg);
      console.log(msg);
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function () {
      if (rolls === 0) {
        Session.set("selectedPlayer", this._id);
        var msg = this.name + " will start? Roll the dice!";
        message.push(msg);
        console.log(msg);
      }
    }
  });
}

// On server startup, create some players if the database is empty; create dollections for snakes & ladders position.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var i = 1;
      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Claude Shannon"];
      _.each(names, function (name) {
        Players.insert({
          index: i++,
          name: name,
          position: 0
        });
      
      });
    }
    if (SnakesandLadders.find().count() === 0) {
      var starts = [33, 66, 99, 23, 45, 67, 89];
      var ends = [20, 53, 86, 34, 56, 78, 100];
      var i = 0;
      _.each(starts, function (start) {
        SnakesandLadders.insert({
          start: start,
          end: ends[i++]
        });
      });
    }
  });

  Meteor.methods ({
  reset: function() {
    Players.update({},{$set: {position: 0}}, {multi:true});
  },
  resetScore: function(player) {
    if (Players.find({"position":player.position}).count() > 1) {
      Players.update({$and: [{"position":player.position}, {"_id": {$ne: player._id}}]}, {$set: {position: 0}});
    }
  }
});
}
