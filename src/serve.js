const serve = ({ express, config, cors, process, mysql, parseDbData }) => {
  const app = express();
  app.use(cors());

  const port = process.env.PORT || 3000;
  const dbConfig = config.get('db');
  const database = mysql.createConnection(dbConfig);

  database.connect();

  const getCupData = (db, cupId) => {
    return new Promise((resolve) => {
      db.query(`SELECT * FROM cups WHERE id = ${cupId}`, (err, rows) => {
        resolve(parseDbData(rows));
      });
    });
  };

  const getGamesInCup = (db, cupId) => {
    return new Promise((resolve) => {
      db.query(`SELECT * FROM games WHERE cup_id = ${cupId}`, (err, rows) => {
        resolve(parseDbData(rows));
      });
    });
  };

  app.listen(port, () => {
    console.log('listening on port', port);
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

    const SQL = req.params.id ? `SELECT * FROM cups WHERE id = ${req.params.id}` : `SELECT * FROM cups`;

    // @todo auth and jwt implementation / header check
    database.query(SQL, (err, rows) => {
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
    const SQL = req.params.id ? `SELECT * from games WHERE id = ${req.params.id}` : `SELECT * FROM games`;

    database.query(SQL, (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/games/cup/:id', (req, res) => {
    database.query(`SELECT * FROM games WHERE cup_id = ${req.params.id}`, (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/participants/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * FROM participants WHERE id = ${req.params.id}` : `SELECT * FROM participants`;
    database.query(SQL, (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/participants/team/:id', (req, res) => {
    database.query(`SELECT * FROM participants WHERE team_id = ${req.params.id}`, (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  app.get('/cups/current/:teamid', (req, res) => {
    database.query(`SELECT * FROM cups WHERE team = ${req.params.teamid} AND active = 1`, (err, rows) => {
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

    console.log(gameData);

    res.json({
      ...cupData,
      games: parsedGameData
    });
  });

};

module.exports = serve;
