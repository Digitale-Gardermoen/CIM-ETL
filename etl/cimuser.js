require('dotenv').config();
const db = require('../data/mongo.js');
const cimUsers = new db();

class CimLoader {
  constructor() {}

  async findUser(SID) {
    return cimUsers.findCIMUser(SID);
  }
  
  async getUsers() {
    return cimUsers.fetchCIMUsers();
  }
  
  async getUsersBySid(sidArr) {
    return cimUsers.fetchCIMUsersBySID(sidArr);
  }

  async setUser(SID, userObj, unset) {
    return cimUsers.upsertCIMUser(SID, userObj, unset);
  }

  async removeUser(SID) {
    return cimUsers.removeCIMUser(SID);
  }
}

module.exports = CimLoader;