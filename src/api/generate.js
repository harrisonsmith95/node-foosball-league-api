const makeGenerateRoute = ({express, authMiddleware}) => {
  // Route for /generate

  const route = express.Router();
  route.use(authMiddleware);

  // Impure
  const getTeamData = (teamid) => {

  };

  const Impure = {
    getTeamData
  };

  const getParticipantsFromTeam = (teamData) => {

  };

  const generateCupFromParticipants = (parsedParticipants) => {

  };

  route.get('/cup/:teamid', (req, res) => {

    if (!req.teamid) {
      res.status(500).send('No team ID specified...');
    }

    const teamData = Impure.getTeamData(req.teamid);
    const parsedParticipants = getParticipantsFromTeam(teamData);

    // Generate cup from participants

    res.json(generateCupFromParticipants(parsedParticipants));

  });

  return route;
};

module.exports = makeGenerateRoute;
