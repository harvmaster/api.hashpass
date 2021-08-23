'use strict'

// Required imports
const express = require('express')
const router = express.Router()

// Server Logic
var passport = require('passport');

// Tools
import { hasFields } from '../../resources/utils'

// models
const Users = require('../../models/users')
const RefreshTokens = require('../../models/refreshtokens')

class UserRoute {
  constructor () {
    // Define the routes

    // Get Routes
    // router.get('/all', (req, res) => this.getUsers(req, res))
    // router.get('/:user', (req, res) => this.getUser(req, res))
    router.get('/all', (req, res) => console.log('req.all'))

    // Post Routes
    router.post('/create', (req, res) => this.create(req, res))
    router.post('/login', (req, res, next) => this.loginUser(req, res, next))
    router.post('/refreshtoken', (req, res) => this.refreshToken(req, res))

    return router
  }

  // Create a new user
  async create(req, res) {
    const body = req.body.user

    // Make sure all fields were sent
    const [fieldExists, emptyFields] = hasFields(body, 'username', 'password')
    if (!fieldExists) return res.status(400).send(`Required fields not found [${emptyFields}]`)

    // Convert name to lower case for easier sign in. Fuck people with capitals
    body.username = body.username.toLowerCase()

    // Make sure username is unique
    const userByName = await Users.find({ username: body.username })
    if (userByName.length > 0) return res.status(409).send('That username is already taken')

    // Create user
    const user = new Users({
      username: body.username
    })
    user.setPassword(body.password)

    const created = await user.save()

    console.log('Created User')
    res.status(201).send('Created User')
  }
  
  // Login a user
  async loginUser (req, res, next) {
    const body = req.body.user

    // Make sure all fields were sent
    const [fieldExists, emptyFields] = hasFields(body, 'username', 'password')
    if (!fieldExists) return res.status(400).send(`Required fields not found [${emptyFields}]`)

    // Convert name to lower case for easier sign in. Fuck people with capitals. We dont like 'eLoN mUsK' we like 'elon musk'
    body.username = body.username.toLowerCase()

    // Validate User
    passport.authenticate('local', {session: false}, async function(err, user, info){
      if (err) return next(err)
      if (!user) return res.status(422).json(info);
  
      const authed = await user.toAuthJSON()
      const services = await user.getServices()
      
      const refreshToken = new RefreshTokens({ user: authed.id })
      await refreshToken.generateRefreshToken()
      const accessToken = await refreshToken.generateAccessToken()

      console.log({...authed, services, refreshToken: refreshToken.token, accessToken })
      return res.status(200).send({...authed, services, refreshToken: refreshToken.token, accessToken })
    })(req, res, next);
  }

  async refreshToken (req, res, next) {
    const token = req.body.refreshToken
    const dbToken = await RefreshTokens.find({ token }) 

    if (!dbToken) return res.status(401).send('That is not a valid refresh token')
    if (!dbToken.verifyRefreshToken()) return res.status(401).send('That token has expired')

    const user = await Users.findById(dbToken.user)
    
    const authed = await user.toAuthJSON()
    const services = await user.getServices()
    const accessToken = await dbToken.generateAccessToken()

    return res.status(200).send({...authed, services, refreshToken: token, accessToken })
  }
}

module.exports = new UserRoute()
