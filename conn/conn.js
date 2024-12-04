const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const setupMiddleware = (app) => {
  // Serve static files from the "public" directory
  app.use(express.static(path.join(__dirname, '../public'))); // Adjusted path for better structure
  app.use(cors()); // Enable Cross-Origin Resource Sharing
  app.use(helmet()); // Add security headers
  app.use(express.json()); // Parse JSON request bodies
  app.use(bodyParser.json()); // Legacy JSON parser
  app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
  app.use(cookieParser()); // Parse cookies

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
};

module.exports = setupMiddleware;
