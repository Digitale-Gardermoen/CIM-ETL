const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  lastname: String,
  firstname: String,
  username: String,
  user_import_id: String,
  job_mobile: String,
  job_phone: String,
  email: String,
  email_secondary: String,
  timezone: String,
  employee_id: String,
  job_title: String,
  roles: String,
  person_type: String,
  dist_list: String,
  description: String
});

class db {
  constructor() {
    this.conn = mongoose.connect(
      process.env.MONGO, {
        useNewUrlParser: true,
        user: process.env.MUSER,
        pass: process.env.MPW,
        dbName: process.env.MDBNAME
      },
      function (err) {
        if (err) console.error('Failed to connect to mongo', err);    // this might be changed to do some better errorhandling later...
      }
    );

    this.User = mongoose.model('user', userSchema);
    this.CIMUser = mongoose.model('cimuser', userSchema);
    this.ADUser = mongoose.model('aduser', userSchema);
  }

  async findUser(sid) {
    let Query = this.User.findOne({ user_import_id: sid })
    Query.select('-_id -__v')
    return Query.exec();   // get user by UII/SID, returns a callback function
  }

  // function to update a user, if it doesn't exist insert the user.
  // NOTE: this updates even if the user document has that same data. this is to be changed in the ETL layer.
  async upsertUser(SID, userObj) {
    return this.User.updateOne(
      { user_import_id: SID },
      { $set: userObj },
      { upsert: true }
    );
  }

  // fetch all documents in the users collection, returns an array.
  async fetchUsers() {
    return this.User
      .find()
      .select('-_id -__v')
      .exec();
  }

  async removeUser(sid) {
    return this.User.deleteOne({ user_import_id: sid }).exec();
  }

  async findCIMUser(sid) {
    return this.CIMUser.findOne({ user_import_id: sid })
      .select('-_id -__v')
      .exec();   // get user by UII/SID, returns a promise
  }

  async fetchCIMUsersBySID(sidArr) {
    return this.CIMUser
      .find()
      .select('-_id -__v')
      .where({ user_import_id: sidArr })
      .exec();
  }

  async fetchCIMUsers() {
    return this.CIMUser
      .find()
      .select('-_id -__v')
      .exec();
  }

  async upsertCIMUser(SID, userObj, unset) {
    if (Object.keys(unset).length !== 0) {
      return this.CIMUser.updateOne(
        { user_import_id: SID },
        { $unset: unset, $set: userObj },
        { upsert: true }
      );
    }
    return this.CIMUser.updateOne(
      { user_import_id: SID },
      { $set: userObj },
      { upsert: true }
    );
  }

  async removeCIMUser(sid) {
    return this.CIMUser.deleteOne({ user_import_id: sid }).exec();
  }

  async fetchADUsers() {
    return this.ADUser
      .find()
      .select('-_id -__v')
      .exec();
  }

  async insertADUsers(userData) {
    return this.ADUser.insertMany(userData);  // give this function an array of objects.
  }

  async deleteADUsers() {
    return this.ADUser.deleteMany({}).exec(); // delete all AD users from the mongodb.
  }

  disconnectdb() {
    mongoose.disconnect();
    return;
  }

}

module.exports = db;
