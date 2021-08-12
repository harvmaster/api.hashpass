'use strict'

// Required imports
const express = require('express')
const router = express.Router()

// Server Logic
var passport = require('passport');

// Tools
const utils = require('../../resources/utils')

// models
const Users = require('../../models/users')

class UserRoute {
  constructor () {
    // Define the routes

    // Get Routes
    // router.get('/all', (req, res) => this.getUsers(req, res))
    // router.get('/:user', (req, res) => this.getUser(req, res))

    // Post Routes
    router.post('/create', (req, res) => this.create(req, res))
    router.post('/login', (req, res) => this.loginUser(req, res))

    return router
  }

  // Create a new user
  async createUser(req, res) {
    const body = req.body.user

    // Make sure username is unique
    const userByName = await Users.find({ username: body.username })
    if (userByName.length > 0) return res.status(409).send('That username is already taken')

    // Create user
    const user = new Users({
      username: body.username,
      password: setPassword(body.password)
    })

    const created = await user.save()

    console.log('Created User')
    res.status(201).send('Created User')
  }
  
  // Login a user
  async loginUser (req, res) {
    const body = req.body.user

    // Make sure all fields were sent
    const [hasFields, emptyFields] = utils.hasFields(body, 'username', 'password')
    if (!hasFields) return res.status(400).send(`Required fields not found [${emptyFields}]`)

    // Validate User
    passport.authenticate('local', {session: false}, async function(err, user, info){
      if (err) return next(err)
      if (!user) return res.status(422).json(info);
  
      const authed = user.toAuthJSON()
      const services = await user.getServices()

      return res.status(200).send({ ...authed, ...{ services } })
    })(req, res, next);
  }
}

module.exports = new UserRoute()
