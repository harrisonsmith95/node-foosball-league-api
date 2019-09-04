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
const cupRoute = require('./api/cups')({parseDbData, getDatabase, express});

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
  cupRoute
});

serve();
