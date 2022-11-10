const http = require("http");
const express = require("express");
const chalk = require("chalk");
const app = require("./app");
const cors = require('cors');

const server = http.createServer(app);
const PORT = process.env["PORT"] ?? 8080;
server.use(cors());
const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json());



server.listen(PORT, () => {
  console.log(
    chalk.blueBright("Server is listening on PORT:"),
    chalk.yellow(PORT),
    chalk.blueBright("Get your routine on!")
  )
})

 