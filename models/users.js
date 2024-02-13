const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var userSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  gender: { type: String },
  phone: { type: String },
  address: { type: String },
  accounts: [
    {
      type: { type: String },
      username: { type: String },
      password: { type: String },
    },
    {
      type: { type: String },
      providerid: { type: String },
    },
  ],
});

userSchema.methods.generateHash = function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compare(password, this.accounts[0].password);
};

module.exports = mongoose.model("User", userSchema);
