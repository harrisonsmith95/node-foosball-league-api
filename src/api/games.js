const makeGameRoute = ({express, getDatabase, parseDbData}) => {
  // ==== Route for /games ====

  const route = express.Router();
  const database = getDatabase();

  const insertNewGame = (db, data) => {
    return new Promise((resolve, reject) => {
      const { round, cup_id, player_1, player_2 } = data;
      const SQL = "INSERT INTO `games` (`id`, `round`, `player_1`, `player_2`, `result`, `cup_id`) VALUES (NULL, '?', '?', '?', '0', '?')";
      db.query(SQL, [round, player_1, player_2, cup_id], (err, rows) => {
        if (err) {
          reject({
            status: 'error',
            errorMsg: err.code
          });
          return;
        }
        resolve(rows);
      });

    });
  };

  const updateGame = (db, data) => {
    return new Promise((resolve, reject) => {
      const {id} = data;

      if (typeof id !== 'number') {
        reject({
          status: 'error',
          errorMsg: 'Invalid ID specified, please provide an integer'
        });
        return;
      }

      db.query('SELECT * FROM games WHERE id = ?', [id], (err, rows) => {

        if (err) {
          reject({
            status: 'error',
            errorMsg: err.code
          });
          return;
        }

        if (rows.length < 1) {
          reject({
            status: 'error',
            errorMsg: `No game with ID: ${id} found`
          });
          return;
        } else if (rows.length > 1) {
          reject({
            status: 'error',
            errorMsg: `ERR_BAD_REQUEST - returned more than one row for ID: ${id}. Please contact site administrator`
          });
          return;
        }

        const currData = rows[0];

        if (currData.result === data.result) {
          reject({
            status: 'error',
            errorMsg: `Nothing to update, game with ID: ${id} already has result of: ${data.result}`
          });
          return;
        }

        if (data.result !== currData.player_1 && data.result !== currData.player_2 && data.result !== 0) {
          reject({
            status: 'error',
            errorMsg: `Result must be ID of player_1 (${currData.player_1}) OR player_2 (${currData.player_2}) OR 0`
          });
          return;
        }

        const newGameData = Object.assign({}, {...currData, result: data.result});

        db.query('UPDATE games SET result = ? WHERE id = ?', [newGameData.result, id], (err, rows) => {
          if (err) {
            reject({
              status: 'error',
              errorMsg: err.code
            });
            return;
          }

          resolve(rows);
        });
      });
    });
  };

  route.get('/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * from games WHERE id = ?` : `SELECT * FROM games`;

    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  route.get('/cup/:id', (req, res) => {
    database.query(`SELECT * FROM games WHERE cup_id = ?`, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  route.post('/:id?', async (req, res) => {
    const requestBody = req.body;

    if (req.params.id) {
      await updateGame(database, {...requestBody, id: parseInt(req.params.id)}).catch(err => {
        return res.json(err);
      });

      return res.json({
        status: 'success',
        successMsg: 'Successfully updated'
      })
    } else {
      await insertNewGame(database, requestBody).catch(err => {
        return res.json(err);
      });

      return res.json({
        status: "success",
        successMsg: "Game successfully added"
      })
    }
  });

  return route;
};

module.exports = makeGameRoute;
