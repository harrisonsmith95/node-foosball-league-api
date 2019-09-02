const parseParticipantData = (row) => {
  if (row.hasOwnProperty('participants')) {
    const participantArray = JSON.parse(row.participants);

    return {
      ...row,
      participants: participantArray
    };
  }

  return row;
};

parseDbData = (rows) => {
  const parsedData = rows.map((row) => {
    return Object.assign({}, parseParticipantData(row));
  });

  return parsedData.length > 1 ? parsedData : parsedData[0];
};

module.exports = parseDbData;
