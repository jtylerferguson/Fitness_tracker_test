const http = require("http");
const PORT = process.env["PORT"] ?? 3000;
const express = require("express");
const chalk = require("chalk");
const app = require("./app");
const cors = require('cors');
const server = http.createServer(app);


app.use(cors());
const morgan = require('morgan');
app.use(morgan('dev'));

app.use(express.json());



server.listen(PORT, () => {
  console.log(
    chalk.blueBright("Server is listening on PORT:"),
    chalk.yellow(PORT),
    chalk.blueBright("Get your routine on!")
  )
})

 