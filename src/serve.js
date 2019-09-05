const serve = ({ express, config, cors, process, mysql, parseDbData, bodyParser, getDatabase, cupRoute, gameRoute, teamRoute, participantRoute, authRoute }) => {
  const app = express();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log('listening on port', port);
  });

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    /**
     * @todo
     * include information on routes, auth, etc
     */
    return res.json('Welcome to the Foosball Cup management API!!!');
  });

  /**
   * Rough breakdown of app requirements
   *
   * 1. Needs to save cup data to mysql database
   * 2. Needs to provide API endpoint to access the data
   * 3. Needs to provide API endpoint to modify the data
   * 4. Needs to have authentication in place (middleware?) to protect the data
   * 5. Should it use own users table or another service? Let's use our own table
   * 6. Needs to be able to generate league table based on users within a 'team'
   * 7. How should we manage teams? @todo - FOR NOW JUST DO HARDCODED
   *
   * // Next steps:
   *
   *  1. Users table and relevant endpoints
   *  2. User authentication via JWT
   *  3. Add some verification with JOI for users
   */

  app.use('/cups', cupRoute);
  app.use('/games', gameRoute);
  app.use('/teams', teamRoute);
  app.use('/participants', participantRoute);
  app.use('/auth', authRoute);

};

module.exports = serve;
