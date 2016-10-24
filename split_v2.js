// Set up a collection to contain OrderDetail information. On the server,
// it is backed by a MongoDB collection named "OrderDetails".

OrderDetails = new Mongo.Collection("orderdetails");
Orders = new Mongo.Collection("orders");


if (Meteor.isClient) {
  Template.split.helpers({
    OrderDetails: function () {
      return OrderDetails.find({}, {sort: { _id: 1 } });
    },
    selectedItem: function () {
      var arr = (Session.get("selectedOrderDetail"));
      if (arr.length > 0) {
        return true;
      }
      else {
        return false;
      }
    },
    getUsers: function () {
      var users = Orders.findOne({}).users;
      console.log(users);
      return users;
    },
  });

  Template.split.events({
    'click .share': function () {
    },
    'click .reset': function(){
    }
  });

  Template.OrderDetail.helpers({
    selected: function () {
      if (Session.get("selectedUser")) {
        var arr = Session.get("selectedOrderDetail");
        if (arr.indexOf(this._id) >= 0) {
          return "selected";
        }
        else {
          return '';
        }
      }
    }
  });

  Template.OrderDetail.events({
    'click': function () {
      var arr = Session.get("selectedOrderDetail") ? Session.get("selectedOrderDetail") : [];
      if (arr.indexOf(this._id) >= 0) {
        arr.splice(arr.indexOf(this._id),1);
      }
      else {
        arr.push(this._id);
      }
      Session.set("selectedOrderDetail", arr);
    }
  });

  Template.Customers.helpers({
    selected: function () {
      return Session.equals("selectedUser", this.user_id) ? "selected" : '';
    }
  });


  Template.Customers.events({
    'click': function () {
      if(!Session.equals("selectedUser", this.user_id)){
        Session.set("selectedUser", this.user_id);
        Session.set("selectedOrderDetail", '');
      }
    },
  })
}

// On server startup
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (OrderDetails.find().count() === 0) {
      OrderDetails.insert({_id: '1', order_id: '12', product_id: 1, product_name: "dish 1", price: "12.90", owner_name: "User 1", share: [], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '2', order_id: '12', product_id: 2, product_name: "dish 2", price: "15.90", owner_name: "User 1", share: [], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '3', order_id: '12', product_id: 3, product_name: "dish 3", price: "10.90", owner_name: "User 1", share: [], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '4', order_id: '12', product_id: 3, product_name: "dish 4", price: "11.90", owner_name: "User 1", share: [], created_at: "2016-09-25"});
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
  });


  Meteor.methods ({
  resetScore: function(OrderDetail) {
  }
});
}
