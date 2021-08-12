'use strict'

require('dotenv').config()
const config = require('./config')

// Application
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes')

// Authentication
const passport = require('passport');
require('./authentication/passport')

// Services
const mongoose = require('./services/mongoose')

class App {
  async start () {
    //
    // Setup MongoDB
    //
    try {
      console.log('Connecting to MongoDB')
      await mongoose.connect()
      console.log('Connected to MongoDB')
    } catch (err) {
      console.error(err.message)
    }

    //
    // Setup ExpressJS middleware, routes, etc
    //
    var app = express()
    app.use(cors())
    app.use(bodyParser.json())
    app.use(bodyParser.raw({ type: '*/*' }))
    app.use(routes)

    //
    // Set port and start ExpressJS Server
    //
    var server = app.listen(config.port, function () {
      console.log('Starting ExpressJS server')
      console.log(`ExpressJS listening at http://${server.address().address}:${server.address().port}`)
    })
  }
}

new App().start()
