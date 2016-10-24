// Set up a collection to contain OrderDetail information. On the server,
// it is backed by a MongoDB collection named "OrderDetails".

OrderDetails = new Mongo.Collection("orderdetails");
Orders = new Mongo.Collection("orders");
Users = new Mongo.Collection("users");


var message = "";
var userId = "1"

if (Meteor.isClient) {
  Template.split.helpers({
    OrderDetails: function () {
      return OrderDetails.find({}, {sort: { _id: 1 } });
    },
    getUsers: function () {
      var owner = OrderDetails.findOne({});
      if (owner){
        var order = Orders.findOne({"users": {$elemMatch: {"id": {$ne: owner.owner_id}}}});
        if (order){
          return order.users;
        }
      }
    },
    selectedUser: function () {
      var userArr = (Session.get("selectedUser"));
      if (userArr){
        if (userArr.length > 0) {
          return true;
        }
        else {
          return false;
        }
      }
    },
    showUsers: function () {
      var selectedOrder = Session.get("selectedOrderDetail");
      if(selectedOrder) {
        return "active";
      }
      return "";
    }
  });

  Template.split.events({
    'click .share': function () {
      var userArr = Session.get("selectedUser");
      OrderDetails.update(Session.get("selectedOrderDetail"),  {$set: {share: userArr}});
      Session.set("selectedUser", []);
      Session.set("selectedOrderDetail", '');
      message = "You share this item with ";
      for (i = 0; i < userArr.length; ++i) {
        if (i < userArr.length - 1) {
          message += " " + Users.findOne({"_id": userArr[i]}).name +",";
        }
        else {
          message += " and " + Users.findOne({"_id": userArr[i]}).name;
        }
      }
    },
    'click .reset': function(){
    }
  });

  Template.OrderDetail.helpers({
    selected: function () {
      return Session.equals("selectedOrderDetail", this._id) ? "selected" : '';
    }
  });

  Template.OrderDetail.events({
    'click': function () {
      if(!Session.equals("selectedOrderDetail", this._id)){
        Session.set("selectedOrderDetail", this._id);
        Session.set("selectedUser", []);
      }
    }
  });

  Template.Customers.helpers({
    selected: function () {
      if (Session.get("selectedOrderDetail")) {
        var userArr = Session.get("selectedUser");
        if (userArr.indexOf(this.user_id) >= 0) {
          return "selected";
        }
        else {
          return '';
        }
      }
    }
  });

  Template.Customers.events({
    'click': function () {
      var userArr = Session.get("selectedUser") ? Session.get("selectedUser") : [];
      if (userArr.indexOf(this.user_id) >= 0) {
        userArr.splice(userArr.indexOf(this.user_id),1);
      }
      else {
        userArr.push(this.user_id);
      }
      Session.set("selectedUser", userArr);
    },
  })
}

// On server startup
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (OrderDetails.find().count() === 0) {
      OrderDetails.insert({_id: '1', order_id: '12', product_id: 1, product_name: "dish 1", price: "12.90", owner_id: '1', share: [], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '2', order_id: '12', product_id: 2, product_name: "dish 2", price: "15.90", owner_id: '1', share: [], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '3', order_id: '12', product_id: 3, product_name: "dish 3", price: "10.90", owner_id: '1', share: [], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '4', order_id: '12', product_id: 4, product_name: "dish 4", price: "11.90", owner_id: '1', share: [], created_at: "2016-09-25"});
    }
    if (Orders.find().count() === 0){
      Orders.insert({
        _id: '12',
        table_id: '1',
        status: 1,
        users:[{user_id: '1', name: "User 1"},{user_id: '2', name: "User 2"}, {user_id: '3', name: "User 3"}, {user_id: '4', name: "User 4"}],
        created_at: "2016-09-25"
      });
    }
    if (Users.find().count() === 0) {
      Users.insert({_id: '1', name: "User 1", created_at: "2016-09-20"});
      Users.insert({_id: '2', name: "User 2", created_at: "2016-09-20"});
      Users.insert({_id: '3', name: "User 3", created_at: "2016-09-20"});
      Users.insert({_id: '4', name: "User 4", created_at: "2016-09-20"});
    }
  });

}
