const express = require('express');
const config = require('config');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const R = require('ramda');
const parseDbData = require('./parse-db-data');
const getDatabase = require('./get-database')({mysql, process});

/**
 * Middleware
 */

const authMiddleware = require('./middleware/auth')({jwt, process});

/**
 * ROUTES
 */
const cupRoute = require('./api/cups')({express, getDatabase, parseDbData, authMiddleware});
const gameRoute = require('./api/games')({express, getDatabase, parseDbData, authMiddleware});
const teamRoute = require('./api/teams')({express, getDatabase, parseDbData, authMiddleware});
const participantRoute = require('./api/participants')({express, getDatabase, parseDbData, authMiddleware});
const authRoute = require('./api/auth')({express, getDatabase, parseDbData, jwt, process});
const generateRoute = require('./api/generate')({express, getDatabase, parseDbData, authMiddleware, R});

// ==== SERVE ====
const serve = require('./serve').bind(null, {
  express,
  config,
  cors,
  process,
  mysql,
  parseDbData,
  bodyParser,
  getDatabase,
  cupRoute,
  gameRoute,
  teamRoute,
  participantRoute,
  generateRoute,
  authRoute
});

serve();
