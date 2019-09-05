const makeTeamRoute = ({express, getDatabase, parseDbData, authMiddleware}) => {
  // ==== Route for /teams ====

  const route = express.Router();
  route.use(authMiddleware);

  const database = getDatabase();

  route.get('/:id?', (req, res) => {
    const SQL = req.params.id ? `SELECT * FROM teams WHERE id = ?` : `SELECT * FROM teams`;
    database.query(SQL, [req.params.id], (err, rows) => {
      return res.json(parseDbData(rows));
    });
  });

  return route;

};

module.exports = makeTeamRoute;
