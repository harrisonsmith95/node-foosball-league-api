const makeGenerateRoute = ({express, getDatabase, parseDbData, authMiddleware, R}) => {
  // Route for /generate

  const route = express.Router();
  //route.use(authMiddleware);
  const database = getDatabase();

  // Impure
  const getTeamData = (teamid) => {
    return new Promise((resolve, reject) => {
      database.query('SELECT * FROM teams WHERE id = ?', [teamid], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows[0]);
      });
    });
  };


  const getParticipants = (participantIdString) => {
    return new Promise((resolve, reject) => {
      database.query(`SELECT * FROM participants WHERE id in ( ${participantIdString} )`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  };

  const Impure = {
    getTeamData,
    getParticipants
  };

  const getColumnValue = R.curry((columnName, data) => data[columnName]);
  const getTeamParticipants = R.compose(JSON.parse, getColumnValue('participants'));

  const chunkArray = (arr,n) => {
    const chunkLength = Math.max(arr.length/n ,1);
    const chunks = [];
    for (let i = 0; i < n; i++) {
      if(chunkLength*(i+1)<=arr.length)chunks.push(arr.slice(chunkLength*i, chunkLength*(i+1)));
    }
    return chunks;
  };

  const generateCupFromParticipants = (parsedParticipants) => {
    const randomisedParticipants = parsedParticipants.map(item => item);

    // IMPLEMENTATION OF Fisher-Yates shuffle algorithm
    for (let i = randomisedParticipants.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [randomisedParticipants[i], randomisedParticipants[j]] = [randomisedParticipants[j], randomisedParticipants[i]];
    }

    const firstRoundGames = randomisedParticipants.length / 2;

    if (!Number.isInteger(firstRoundGames) || firstRoundGames % 2 !== 0 || (firstRoundGames / 2) % 2 !== 0 ) {
      // TODO - MAKE THIS IF STATEMENT CLEANER
      // Not possible to generate cup without also generating byes todo - include byes at some point

      throw 'Not a correct number of games'; // todo - improve error

      // todo - don't make this many todo's again!!
    }

    return chunkArray(randomisedParticipants, firstRoundGames);

  };

  route.get('/cup/:teamid', async (req, res) => {

    try {
      const teamData = await Impure.getTeamData(req.params.teamid);
      const parsedParticipants = getTeamParticipants(teamData);
      const participants = await Impure.getParticipants(parsedParticipants.join(','));
      const cup = generateCupFromParticipants(participants);
      res.json(cup);
    } catch (err) {
      console.log(err);
    }

  });

  return route;
};

module.exports = makeGenerateRoute;
