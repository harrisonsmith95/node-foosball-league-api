const makeTeamRoute = ({express, getDatabase, parseDbData}) => {
  // ==== Route for /teams ====

  const route = express.Router();
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
