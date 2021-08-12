'use strict'

const express = require('express')
const router = express.Router()

// models
const Services = require('../../models/services')

class ServicesRoute {
  constructor () {
    // Define the routes

    // Get Routes
    router.get('/all', (req, res) => this.getUsers(req, res))
    router.get('/:user', (req, res) => this.getService(req, res))

    // Post Routes
    router.post('/', (req, res) => this.create(req, res))

    return router
  }

  // Get all of the users and return a formatted array
  async getUsers(req, res) {
    const users = await Users.find()
    const users_formatted = users.map(user => {
        return user.toJSON()
    })
    res.status(200).send(users_formatted)
  }

  // Get a single user back
  async getUser(req, res) {
    const user = await Users.find({name: req.params.user})
    if (!user) {
      return res.status(204).send('No user with that name')
    }
    user = user.toJSON()
    res.status(200).send(user)
  }  

  // Create a new user
  async createUser(req, res) {
    const body = req.body.user
    const user = new Users({
      username: body.username,
      password: setPassword(body.password)
    })
    user.save().then(created => {
      console.log('Created User')
      res.status(201).send(created)
    })
  }
}

module.exports = new ServicesRoute()
