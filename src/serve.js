const serve = ({ express, config, cors, process, mysql, parseDbData, bodyParser }) => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  const dbConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  };

  const port = process.env.PORT || 3000;
  const database = mysql.createConnection(dbConfig);

  database.connect();

  const getCupData = (db, cupId) => {
    return new Promise((resolve) => {
      db.query(`SELECT * FROM cups WHERE id = ?`, [cupId], (err, rows) => {
        resolve(parseDbData(rows));
      });
    });
  };

  const getGamesInCup = (db, cupId) => {
    return new Promise((resolve) => {
      db.query(`SELECT * FROM games WHERE cup_id = ?`, [cupId], (err, rows) => {
        resolve(parseDbData(rows));
      });
    });
  };

  const insertNewGame = (db, data) => {

    return new Promise((resolve, reject) => {
      const { round, cup_id, player_1, player_2 } = data;
      const SQL = "INSERT INTO `games` (`id`, `round`, `player_1`, `player_2`, `result`, `cup_id`) VALUES (NULL, '?', '?', '?', '0', '?')";
      db.query(SQL, [round, player_1, player_2, cup_id], (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });

    });

  };

  app.listen(port, () => {
    console.log('listening on port', port);
  });

  app.get('/', (req, res) => {
    return res.json('Welcome to the Foosball Cup management API');
  });

  /**
   * Rough breakdown of app requirements
   *
   * 1. Needs to save league data to mysql database
   * 2. Needs to provide API endpoint to access the data
   * 3. Needs to provide API endpoint to modify the data
   * 4. Needs to have authentication in place (middleware?) to protect the data
   * 5. Should it use own users table or another service? ???
   * 6. Needs to be able to generate league table based on users within a 'team'
   * 7. How should we manage teams? @todo - FOR NOW JUST DO HARDCODED
   */

  // @todo move this into db data and query dynamically based on current users affiliation

  app.get('/cups/:id?', (req, res) => {

    const SQL = req.params.id ? `SELECT * FROM cups WHERE id = ?` : `SELECT * FROM cups`;

    // @todo auth and jwt implementation / header check
    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });

  });

  app.get('/teams/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * FROM teams WHERE id = ${req.params.id}` : `SELECT * FROM teams`;
    database.query(SQL, (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/games/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * from games WHERE id = ?` : `SELECT * FROM games`;

    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/games/cup/:id', (req, res) => {
    database.query(`SELECT * FROM games WHERE cup_id = ?`, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/participants/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * FROM participants WHERE id = ?` : `SELECT * FROM participants`;
    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/participants/team/:id', (req, res) => {
    database.query(`SELECT * FROM participants WHERE team_id = ?`, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/cups/current/:teamid', (req, res) => {
    database.query(`SELECT * FROM cups WHERE team = ? AND active = 1`, [req.params.teamid], (err, rows) => {
      if (rows.length < 1) {
        return res.json({
          status: 'error',
          errorMsg: `Team with ID: ${req.params.teamid} does not have an active cup.`
        });
      }
      return res.json(parseDbData(rows));
    });
  });

  app.get('/cup/full/:id', async (req, res) => {
    // Get cup data,
    const cupData = await getCupData(database, req.params.id);

    // Get each game in cup
    const gameData = await getGamesInCup(database, req.params.id);

    const parsedGameData = {
      rounds: {
        0: []
      }
    };

    gameData.forEach((game) => {
      (parsedGameData.rounds[game.round]).push(game);
    });

    res.json({
      ...cupData,
      games: parsedGameData
    });
  });

  app.post('/game/:id?', async (req, res) => {
    const requestBody = req.body;

    if (req.params.id) {



    } else {
      const result = await insertNewGame(database, requestBody).catch(err => {
        return res.json({
          status: "error",
          errorMsg: err.code
        });
      });

      return res.json({
        status: "success",
        successMsg: "Game successfully added"
      })
    }
  });

};

module.exports = serve;
