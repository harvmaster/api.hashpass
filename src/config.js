module.exports = {
  env: process.env.NODE_ENV,
  domain: process.env.DOMAIN,
  port: process.env.PORT || 3000,
  mongoDB: process.env.MONGODB,
  secret: process.env.SECRET,
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    endpoint_port: parseInt(process.env.MINIO_ENDPOINT_PORT),
    useSSL: process.env.MINIO_USESSL == 'true',
    username: process.env.MINIO_USERNAME,
    password: process.env.MINIO_PASSWORD
  },
  refreshTokenSecret: process.env.REFRESHTOKENSECRET,
  accessTokenSecret: process.env.ACCESSTOKENSECRET,
  tokenExpiryTime: process.env.TOKENEXPIRYTIME || 86400
}