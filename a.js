// Set up a collection to contain order information. On the server,
// it is backed by a MongoDB collection named "Orders".

Orders = new Mongo.Collection("orders");
User = new Mongo.Collection("users");
Tables = new Mongo.Collection("tables");


if (Meteor.isClient) {
  Template.split.helpers({
    orders: function () {
      return Orders.find({}, {sort: { _id: 1 } });
    },
    selectedName: function () {
      var order = Orders.findOne(Session.get("selectedOrder"));
      return order.product_name;
    },
    getUsers: function () {
      var tab = Tables.findOne(Session.get("selectedTable"));
      console.log(tab);
      return tab.user;
    }
  });

  Template.split.events({
    'click .share': function () {
      var order = Orders.findOne(Session.get("selectedOrder"));
      Session.set("selectedTable", order.table_id);
      console.log(order.table_id);
    },
    'click .reset': function(){
    }
  });

  Template.order.helpers({
    selected: function () {
      return Session.equals("selectedOrder", this._id) ? "selected" : '';
    }
  });

  Template.order.events({
    'click': function () {
      Session.set("selectedOrder", this._id);
    }
  });
}

// On server startup, create some Orders if the database is empty; create dollections for snakes & ladders position.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Orders.find().count() === 0) {
      Orders.insert({_id: '1', table_id: '1', product_id: 1, product_name: "dish 1", quantity: 1, price: "12.90", owner_id: 12, owner_name: "User 1", share: [], created_at: "2016-09-25"});
      Orders.insert({_id: '2', table_id: '1', product_id: 2, product_name: "dish 2", quantity: 2, price: "10.90", owner_id: 12, owner_name: "User 1", share: [], created_at: "2016-09-25"});
    }
    if (User.find().count() === 0) {
      User.insert({_id: '1', name: "User 1", created_at: "2016-09-20"});
      User.insert({_id: '2', name: "User 2", created_at: "2016-09-20"});
    }
    if (Tables.find().count() === 0){
      Tables.insert({
        _id: '1',
        status: 1,
        max_seat: 4,
        user:["User 1", "User 2"]
      });
      Tables.insert({
        _id: '2',
        status: 0,
        max_seat: 4,
        user: []
      });
    }
  });


  Meteor.methods ({
  resetScore: function(order) {
  }
});
}
