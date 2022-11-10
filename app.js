require("dotenv").config()
const express = require("express")
const app = express()
const apiRouter = require("./api")
app.use("/api", apiRouter)

// Setup your Middleware and API Router here


module.exports = app;
