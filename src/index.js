const express = require('express');
const config = require('config');
const cors = require('cors');
const mysql = require('mysql');
const parseDbData = require('./parse-db-data');
const bodyParser = require('body-parser');
const getDatabase = require('./get-database')({mysql, process});

/**
 * ======
 * ROUTES
 * ======
 */
const cupRoute = require('./api/cups')({express, getDatabase, parseDbData});
const gameRoute = require('./api/games')({express, getDatabase, parseDbData});
const teamRoute = require('./api/teams')({express, getDatabase, parseDbData});
const participantRoute = require('./api/participants')({express, getDatabase, parseDbData});

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
  participantRoute
});

serve();
