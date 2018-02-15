var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    userSchema            = new mongoose.Schema({
      username: String,
      password: String,
      isAdmin: {Type: Boolean, default: false}
    });

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);