const mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
const config = require('../config')
const Services = require('./services')

// Database information required
var refreshTokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  expired: {
    type: Date
  },
  create_date: {
    type: Date,
    default: Date.now
  }
});

refreshTokenSchema.methods.generateRefreshToken = async function () {
  const token = jwt.sign({
      id: this.user
    },
    config.refreshTokenSecret,
    {
      expiresIn: 60*60*24*180*1000
    }
  )
  this.token = token
  await this.save()
  return this.token
}

refreshTokenSchema.methods.generateAccessToken = async function (user) {
  let expiresAt = new Date()

  expiresAt.setSeconds(
    expiresAt.getSeconds() + parseInt(config.tokenExpiryTime)
  )

  const token = jwt.sign({
    id: this.user,
    createdBy: this.id,
    exp: expiresAt.getTime()
  }, config.accessTokenSecret)

  return {
    token: `Bearer ${token}`,
    expires: expiresAt.getTime()
  }
}

refreshTokenSchema.methods.verifyRefreshToken = async function () {
  if (this.expired > Date.now()) return false
  return true
}

refreshTokenSchema.methods.removeAccess = async function () {
  if (this.expired != null) {
    throw { summary: 'Expiry already set', details: 'The expiration date for this refresh token has already been set' }
  }
  this.expired = Date.now()
  await this.save()
  return
}

const RefreshToken = module.exports = mongoose.model('RefreshToken', refreshTokenSchema);