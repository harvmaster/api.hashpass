const jwt = require('express-jwt')
const jwtVerify = require('jsonwebtoken')
const secret = require('../config').secret
const Users = require('../models/users')

export const auth = {
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  }),
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  })
}

const getTokenFromHeader = req => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
  }

  return null;
}

export const getUserId = (req, res) => {
  if (req.headers && req.headers.authorization) {
    const header = req.headers.authorization
    let decoded
    
    try {
      decoded = jwtVerify.verify(authorization.split(' ')[1], secret);
    } catch (err) {
      return res.status(401).send('unauthorized');
    }

    return decoded.id
  }

  return null
}

export const getUser = async (req, res) => {
  const id = getUserId(req, res)
  const user = await Users.findById(id)
  return user
}

export default { auth, getUserId, getUser }