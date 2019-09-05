const makeCupRoute = ({express, getDatabase, parseDbData, authMiddleware}) => {
  // ==== Route for /cups ====

  const route = express.Router();
  route.use(authMiddleware);

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

  const database = getDatabase();

  route.get('/:id?', (req, res) => {

    const SQL = req.params.id ? `SELECT * FROM cups WHERE id = ?` : `SELECT * FROM cups`;

    // @todo auth and jwt implementation / header check
    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });

  });

  route.get('/current/:teamid', (req, res) => {
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

  route.get('/full/:id', async (req, res) => {
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
      if (typeof parsedGameData.rounds[game.round] === "undefined") {
        parsedGameData.rounds[game.round] = [];
      }
      parsedGameData.rounds[game.round].push(game);
    });

    res.json({
      ...cupData,
      games: parsedGameData
    });
  });

  return route;
};

module.exports = makeCupRoute;
