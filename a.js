// Set up a collection to contain OrderDetail information. On the server,
// it is backed by a MongoDB collection named "OrderDetails".

OrderDetails = new Mongo.Collection("OrderDetails");
User = new Mongo.Collection("users");
Orders = new Mongo.Collection("Orders");


if (Meteor.isClient) {
  Template.split.helpers({
    OrderDetails: function () {
      return OrderDetails.find({}, {sort: { _id: 1 } });
    },
    selectedName: function () {
      var OrderDetail = OrderDetails.findOne(Session.get("selectedOrderDetail"));
      return OrderDetail.product_name;
    },
    getUsers: function () {
      var tab = Orders.findOne(Session.get("selectedTable"));
      console.log(tab);
      Session.set("listUser", tab.user)
      return tab.user;
    },
  });

  Template.split.events({
    'click .share': function () {
      var OrderDetail = OrderDetails.findOne(Session.get("selectedOrderDetail"));
      Session.set("selectedTable", OrderDetail.table_id);
      console.log(OrderDetail.table_id);
      var tab = Orders.findOne(Session.get("selectedTable"));
      Session.set("listUser", tab.user)
      console.log(Session.get("listUser"))
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
      Session.set("selectedOrderDetail", this._id);
    }
  });

  Template.Customers.helpers({
    // selectedUser: function () {
    //   return Session.equals("selectedUser", this._id) ? "selected" : '';
    // },
    getUserName: function () {
      user_list = {customer: [{user_id: '1', name: "User 1"},{user_id: '2', name: "User 2"}]};
      // user_list = Session.get("listUser");
      console.log(user_list);
      return user_list
    },
  });


  Template.Customers.events({
    'click': function () {
      console.log('click');
      var selectedSharer = Session.set("selectedSharer", this.user_id);
      console.log(Session.get("selectedSharer"));
      console.log(OrderDetails.findOne(Session.get("selectedOrderDetail")));
      updated_order = OrderDetails.findOne(Session.get("selectedOrderDetail"))._id;
      console.log(updated_order)
      OrderDetails.update({_id:updated_order}, {$addToSet: {share: Session.get("selectedSharer")}});
    }
  })
}

// On server startup, create some OrderDetails if the database is empty; create dollections for snakes & ladders position.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (OrderDetails.find().count() === 0) {
      OrderDetails.insert({_id: '1', table_id: '1', order_id: "1", product_id: 1, product_name: "dish 1", price: "12.90", owner_id: 12, owner_name: "User 1", share: [3], created_at: "2016-09-25"});
      OrderDetails.insert({_id: '2', table_id: '1', order_id: "1", product_id: 2, product_name: "dish 2", price: "10.90", owner_id: 12, owner_name: "User 1", share: [3], created_at: "2016-09-25"});
    }
    if (User.find().count() === 0) {
      User.insert({_id: '1', name: "User 1", created_at: "2016-09-20"});
      User.insert({_id: '2', name: "User 2", created_at: "2016-09-20"});
    }
    if (Orders.find().count() === 0){
      Orders.insert({
        _id: '1',
        status: 1,
        max_seat: 4,
        table_id: 1,
        user:[{user_id: '1', name: "User 1"},{user_id: '2', name: "User 2"}]
      });
      Orders.insert({
        _id: '2',
        status: 0,
        max_seat: 4,
        table_id: 2,
        user: []
      });
    }
  });


  Meteor.methods ({
  resetScore: function(OrderDetail) {
  }
});
}
