var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/**
 * user field will hold the ID referring to the user model
 * store the ID but behind the should aware ID links to the user collection and model
 * 
 * cart field will store the complete cart object will be simply and work great
 * 
 * parmentId field will be stored by stripe payment id
 */
var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    cart: {
        type: Object,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Order", schema);