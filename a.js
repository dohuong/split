// Set up a collection to contain OrderDetail information. On the server,
// it is backed by a MongoDB collection named "OrderDetails".

OrderDetails = new Mongo.Collection("OrderDetails");
User = new Mongo.Collection("users");
Orders = new Mongo.Collection("Orders");


if (Meteor.isClient) {
  Session.set("user_id","1");

  Array.prototype.remove = function(value) {
       this.splice(this.indexOf(value), 1);
       return true;
     };

  Template.split.helpers({
    AppUser: function() {
      return Session.get("user_id");
    },
    OrderDetails: function () {
      return OrderDetails.find({owner_id: Session.get("user_id")}, {sort: { _id: 1 } });
    },
    selectedName: function () {
      var OrderDetail = OrderDetails.findOne(Session.get("selectedOrderDetail"));
      return OrderDetail.product_name;
    },
    getUsers: function () {
      // var tab = Orders.findOne(Session.get("selectedTable"));
      // console.log(tab);
      // Session.set("listUser", tab.user)
      return Session.get("listUser");
    },
  });

  Template.split.events({
    'click .share': function () {
      Session.set("listUser", "")
      var OrderDetail = OrderDetails.findOne(Session.get("selectedOrderDetail"));
      Session.set("selectedTable", OrderDetail.table_id);
      console.log(OrderDetail.table_id);
      var tab = Orders.findOne(Session.get("selectedTable")).user;
      console.log(tab)
      var other_users = tab.filter(function(el) { return el.user_id != Session.get("user_id"); });
      console.log(other_users) 
      Session.set("listUser", other_users)
      // console.log(Session.get("listUser"))
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
      console.log("dish"+ Session.get("selectedOrderDetail"));
      // User.update({}, {$set: { chosen: false }});

    }
  });

  Template.Customers.helpers({
    // selectedUser: function () {
    //   return Session.equals("selectedUser", this._id) ? "selected" : '';
    // },
    message: function () {
      var current_state = Session.get("listUser")
    },
    status: function(user_id) {
      // var selectedCustomer = Session.get("selectedCustomer")
      console.log("selectedCustomer" + user_id)
      var current_order = OrderDetails.findOne(Session.get("selectedOrderDetail"));
      console.log("current_order" + current_order)
      var current_order_sharers = current_order.share;
      console.log("current_order_sharers" + current_order_sharers);
      // return true if inside current order details
      if (current_order_sharers.includes(user_id)) {
        console.log("yes")
        return "share this with you"
      } else {
        console.log("nope")
        return ""}
      // return false if not inside current order details
    },
    selectedCustomer: function() {
      return Session.equals("selectedCustomer", this._id) ? "selected" : '';
    }
  });


  Template.Customers.events({
    'click': function () {
      var selectedSharer = this.user_id
      Session.set("selectedCustomer", selectedSharer)
      console.log("selectedCustomer" + selectedSharer)
      var current_order = OrderDetails.findOne(Session.get("selectedOrderDetail"));
      console.log("current_order" + current_order)
      var current_order_sharers = current_order.share;
      console.log("current_order_sharers" + current_order_sharers);
      var order = Session.get("selectedOrderDetail");
      updated_order = OrderDetails.findOne(order)._id;
      // return true if inside current order details
      if (current_order_sharers.includes(selectedSharer)) {
        User.update(selectedSharer, {$pull: { current_orders: order }});
        OrderDetails.update({_id:updated_order}, {$pull: {share: selectedSharer}});
        console.log("Unshare");
      } else {
        User.update({ _id: selectedSharer }, {$addToSet: { current_orders: order }});
        OrderDetails.update({_id:updated_order}, {$addToSet: {share: selectedSharer}});
        console.log("Share")}
      }
    //   var isSharer = User.findOne({_id:selectedSharer});
    //   console.log("chosen" + isSharer.chosen)

    //   if(isSharer.chosen == true){
    //     User.update({ _id: selectedSharer }, {$set: { chosen: false }});
    //     User.update(selectedSharer, {$pull: { current_orders: order }});
    //     OrderDetails.update({_id:updated_order}, {$pull: {share: selectedSharer}});
    //     console.log("Unshare");
    // } else {
    //     User.update({ _id: selectedSharer }, {$set: { chosen: true }});
    //     User.update({ _id: selectedSharer }, {$addToSet: { current_orders: order }});
    //     OrderDetails.update({_id:updated_order}, {$addToSet: {share: selectedSharer}});
    //     console.log("Share");
    // }

    }
  );
  Router.route('/payment');
}

// On server startup, create some OrderDetails if the database is empty; create dollections for snakes & ladders position.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (OrderDetails.find().count() === 0) {
      OrderDetails.insert({_id: "1", table_id: '1', order_id: "1", product_id: 1, product_name: "dish 1", price: "12.90", owner_id: "1", owner_name: "User 1", share: ["1"], created_at: "2016-09-25"});
      OrderDetails.insert({_id: "2", table_id: '1', order_id: "1", product_id: 2, product_name: "dish 2", price: "10.90", owner_id: "1", owner_name: "User 1", share: ["1"], created_at: "2016-09-25"});
    }
    if (User.find().count() === 0) {
      User.insert({_id: '1', name: "User 1", created_at: "2016-09-20", current_orders:["1","2"]});
      User.insert({_id: '2', name: "User 2", created_at: "2016-09-20", current_orders:[]});
      User.insert({_id: '3', name: "User 3", created_at: "2016-09-20", current_orders:[]})
    }
    if (Orders.find().count() === 0){
      Orders.insert({
        _id: '1',
        status: 1,
        max_seat: 4,
        table_id: 1,
        user:[{user_id: '1', name: "User 1"},{user_id: '2', name: "User 2"},{user_id: '3', name: "User 3"}]
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
