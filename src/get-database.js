const makeGetDatabase = ({mysql, process}) => {
  let database = false;

  return () => {
    const dbConfig = {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    };

    if (database)
      return database;

    database = mysql.createPool({connectionLimit: 10, ...dbConfig});

    return database;
  };
};

module.exports = makeGetDatabase;
