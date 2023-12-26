#!/bin/env/node
import fs from 'fs'
import 'dotenv/config'

// process.env.NITRO_SSL_CERT = fs.readFileSync('server.crt')
// process.env.NITRO_SSL_KEY = fs.readFileSync('server.key')
// process.env.NITRO_PORT = "3000"
process.env.ENV = "prod"
process.env.METAURL = import.meta.url
console.log(process.env.METAURL)

await import('./.output/server/index.mjs')