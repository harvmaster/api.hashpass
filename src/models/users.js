const mongoose = require('mongoose')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')
var secret = require('../config').secret
const Services = require('./services')
const RefreshTokens = require('./refreshtokens')

// Database information required
var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    create_date:{
        type: Date,
        default: Date.now
    }
});

userSchema.methods.validPassword = function (password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.password === hash;
};

userSchema.methods.setPassword = function (password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// userSchema.methods.generateJWT = function () {
//   var today = new Date();
//   var exp = new Date(today);
//   exp.setDate(today.getDate() + 1);

//   return jwt.sign({
//     id: this._id,
//     exp: parseInt(exp.getTime() / 10000),
//   }, secret);
// };

userSchema.methods.toAuthJSON = async function () {
    return {
        id: this.id,
        username: this.username,
    }
};

userSchema.methods.getServices = async function () {
    let services = await Services.find({ user: this.id })

    const results = await Promise.all(services.map(service => service.toJSON()))
    return results
}

//Access outside of the file
var User = module.exports = mongoose.model('User', userSchema);
