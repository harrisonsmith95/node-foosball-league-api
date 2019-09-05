const makeParticipantRoute = ({express, getDatabase, parseDbData, authMiddleware}) => {
  // ==== Route for /participants ====

  const route = express.Router();
  route.use(authMiddleware);

  const database = getDatabase();

  route.get('/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * FROM participants WHERE id = ?` : `SELECT * FROM participants`;
    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  route.get('/team/:id', (req, res) => {
    database.query(`SELECT * FROM participants WHERE team_id = ?`, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  return route;
};

module.exports = makeParticipantRoute;
