'use strict'

const express = require('express')
const router = express.Router()

const jwt = require('../../authentication/jwt')

// models
const Services = require('../../models/services')

class ServicesRoute {
  constructor () {
    // Define the routes

    // Get Routes
    router.get('/', jwt.auth.required, (req, res) => this.getServices(req, res))
    router.get('/:service', jwt.auth.required, (req, res) => this.getService(req, res))

    // Put routes
    router.put('/:service', jwt.auth.required, (req, res) => this.editService(req, res))

    // Post Routes
    router.post('/', jwt.auth.required, (req, res) => this.create(req, res))

    return router
  }

  // Get a single user's services
  async getServices (req, res) {
    console.log('getting services')

    const user = await jwt.getUser(req, res)
    const services = await user.getServices()

    if (!services.length > 0) return res.status(204).send([])

    res.status(200).send(services)
  }

  // Get a single service by ID
  async getService (req, res) {
    console.log('getting services')
    const user = await jwt.getUser()
    const service = await Services.findById(req.params.service)

    if (!service) return res.status(204).send('No service found with that ID')

    res.status(200).send(service)
  }

  // Create a new Service
  async create(req, res) {
    const user = await jwt.getUser()
    const body = req.body.service

    const alreadyExists = await Services.find({ user: user.id, name: body.name })
    if (alreadyExists.length > 0) return res.status(409).send('That service already exists')

    const service = new Service({
      name: body.name,
      user: user.id,
      note: body.note,
      legacy: body.legacy,
      encoding: body.encoder
    })

    let created = await service.save()
    let logo = await created.findAndSetLogo()
    created = await created.toJSON()
    res.status(201).send(created)
  }
}

module.exports = new ServicesRoute()
