const jwt = require('express-jwt')
const jwtVerify = require('jsonwebtoken')
const secret = require('../config').accessTokenSecret
const Users = require('../models/users')

export const auth = {
  optional: jwt({
    secret: secret,
    algorithms: ['HS256'],
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  }),
  required: jwt({
    secret: secret,
    algorithms: ['HS256'],
    // userProperty: 'payload',
    getToken: getTokenFromHeader
  })
}

const getTokenFromHeader = req => {
  console.log(req.header.authorization)
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
      decoded = jwtVerify.verify(header.split(' ')[1], secret);
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