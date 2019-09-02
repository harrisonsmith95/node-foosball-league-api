const express = require('express');
const config = require('config');
const cors = require('cors');
const mysql = require('mysql');
const parseDbData = require('./parse-db-data');

const serve = require('./serve').bind(null, {
  express,
  config,
  cors,
  process,
  mysql,
  parseDbData
});

serve();
