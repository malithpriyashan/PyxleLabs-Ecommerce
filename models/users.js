const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var userSchema = new Schema({
  local: {
    email: { type: String, unique: true },
    password: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  google: {
    id: String,
    //token: String,
    email: String,
    name: String,
  },
});

userSchema.methods.generateHash = function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compare(password, this.local.password);
};

module.exports = mongoose.model("User", userSchema);
