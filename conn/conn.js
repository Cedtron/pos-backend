const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')


const setupMiddleware = (app) => {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    console.log(`${req.method} and ${req.path}`);
    next();
  });
};

module.exports = setupMiddleware;
 