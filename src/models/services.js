const mongoose = require('mongoose')
const aws = require('aws-sdk')
const minio = require('minio');
const config = require('../config').minio

var s3 = new minio.Client({
    endPoint: config.endpoint,
    port: config.endpoint_port,
    useSSL: config.useSSL || false,
    accessKey: config.username,
    secretKey: config.password
});

// Database information required
var serviceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  legacy: {
    type: Boolean,
    default: false
  },
  encoding: {
    type: String,
    default: 'hex'
  },
  create_date:{
    type: Date,
    default: Date.now
  }
});

serviceSchema.methods.toJSON = async function () {
  const logo = await this.getLogo()
  return {
    id: this.id,
    user: this.user,
    name: this.name,
    logo: logo,
    note: this.note,
    legacy: this.legacy,
    encoding: this.encoding,
    created: this.create_date
  }
}

serviceSchema.methods.getLogo = async function () {
  if (this.logo.split('/').length > 2) return this.logo
  
  const logo = s3.presignedGetObject('icons', this.logo, 24*60*60*7, (err, presignedUrl) => {
    if (err) return ''
    return presignedUrl
  })

  return logo
}

// Call clearbit's api for autocomplete and use the logo from there
serviceSchema.methods.findAndSetLogo = async function () {
  const res = await axios.get('https://autocomplete.clearbit.com/v1/companies/suggest?query=' + this.name)
  this.logo = res.data[0].logo || ''
  return logo
}

//Access outside of the file
var Service = module.exports = mongoose.model('Service', serviceSchema);