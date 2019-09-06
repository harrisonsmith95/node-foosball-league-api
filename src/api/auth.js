// Authorises a user and returns a long-lasting (~2 days) refresh token, along with a short-lived (~15 mins) access token
const makeAuthRoute = ({express, getDatabase, parseDbData, jwt, process}) => {
  // Route for /auth

  const route = express.Router();
  const database = getDatabase();
  const key = process.env.jwtKey;

  const checkPassMatch = (dbUser, userData) => {
    if (!dbUser || !dbUser.hasOwnProperty('password')) {
      return false;
    }
    return dbUser.password === userData.password;
  };

  const makeGenericError = () => ({
    status: "Error",
    errorMsg: "Username or Password did not match"
  });

  const getUser = (userData) => {
    return new Promise((resolve, reject) => {
      const uniqueSelector = userData.hasOwnProperty('email') ? 'email' : 'username';
      const SQL = `SELECT * FROM users WHERE ${uniqueSelector} = ?`;

      database.query(SQL, [userData[uniqueSelector]], (err, rows) => {
        if (err) {
          reject({
            status: "Error",
            errorMsg: err.code
          });
          return;
        }

        if (rows.length > 1) {
          // something has gone very wrong...
          // todo - this should never happen but don't just log it...
          console.log('VERY WRONG...');
        }

        if (rows.length < 1) {
          reject(makeGenericError());
          return;
        }

        const dbUser = rows[0];
        resolve(dbUser);

      });
    });
  };

  route.post('/', async (req, res) => {
    const {email, username, password} = req.body;

    if (!(email || username) || !password) {
      // incorrect data sent
      res.json({
        status: 'Error',
        errorMsg: 'One of: email/username or password not provided'
      });
      return;
    }

    await getUser(req.body).then(dbUser => {
      const passMatch = checkPassMatch(dbUser, req.body);

      if (passMatch) {
        const tokenData = {
          id: dbUser.id,
          userPrivileges: 'administrator'
        };
        const token = jwt.sign(tokenData, key, {
          expiresIn: '24h'
        });

        res.json({
          status: "Success",
          successMsg: "Authentication successful",
          token
        });

      } else {
        res.json(makeGenericError());
      }
    }).catch(err => {
      res.json(err);
    });

  });

  return route;
};

module.exports = makeAuthRoute;
