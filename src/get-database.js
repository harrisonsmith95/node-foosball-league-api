const makeGetDatabase = ({mysql, process}) => {
  let database = false;

  return () => {
    const dbUrl = `${process.env.CLEARDB_DATABASE_URL}&connectionLimit=10`;

    if (database)
      return database;

    database = mysql.createPool(dbUrl);

    return database;
  };
};

module.exports = makeGetDatabase;
