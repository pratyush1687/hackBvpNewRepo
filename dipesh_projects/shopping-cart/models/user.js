const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
});

//add some methods to user schema
userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
}

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);//this refers to the user's password here
}

module.exports = mongoose.model('User', userSchema);
