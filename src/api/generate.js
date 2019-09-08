const makeGenerateRoute = ({express, authMiddleware}) => {
  // Route for /generate

  const route = express.Router();
  route.use(authMiddleware);

  route.get('/', (req, res) => {

    res.send('Will return generated data...');

  });

  return route;
};

module.exports = makeGenerateRoute;
