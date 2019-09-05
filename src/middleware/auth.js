const makeAuthMiddleware = ({jwt, process}) => (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  if (!token) {
    return res.status(401).send('No token provided');
  }

  try {
    req.foosballAPi = {
      user: jwt.verify(token, process.env.jwtKey)
    };

    next();
  } catch (Error) {
    return res.status(400).send('Invalid Token');
  }
};

module.exports = makeAuthMiddleware;
