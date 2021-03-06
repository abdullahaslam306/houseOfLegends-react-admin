const mongoose = require("mongoose");

const convertRawIDToMongoDBId = (rawID) => mongoose.Types.ObjectId(rawID);

const renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({
  [newProp]: old,
  ...others
});

// massage mongodb _id to react admin's id
const rename_IdToId = (rawMongoDBObject) =>
  renameProp("_id", "id", rawMongoDBObject.toObject());

const massageResponses = (status, response) => ({ status, response });

const isValid = (param) => {
  if (param !== undefined && param !== null) {
    return true;
  }
  return false;
};

module.exports = {
  convertRawIDToMongoDBId,
  rename_IdToId,
  massageResponses,
  isValid
};
