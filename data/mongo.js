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

class MongoDB {
  constructor() {
    this.conn = mongoose.connect(
      process.env.MONGOOSE_MONGO, {
        useNewUrlParser: true,
        user: process.env.MONGOOSE_USERNAME,
        pass: process.env.MONGOOSE_PASSWORD,
        dbName: process.env.MONGOOSE_DBNAME
      },
      function (err) {
        if (err) console.error('Failed to connect to mongo', err);    // this might be changed to do some better errorhandling later...
      }
    );

    this.CIMUser = mongoose.model('cimuser', userSchema);
    this.ADUser = mongoose.model('aduser', userSchema);
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
    if (Object.keys(unset).length !== 0 && Object.keys(userObj).length !== 0) {
      return this.CIMUser.updateOne(
        { user_import_id: SID },
        { $unset: unset, $set: userObj },
        { upsert: true }
      );
    }
    else if (Object.keys(unset).length !== 0 && Object.keys(userObj).length === 0) {
      return this.CIMUser.updateOne(
        { user_import_id: SID },
        { $unset: unset },
        { upsert: true }
      );
    }
    else {
      return this.CIMUser.updateOne(
        { user_import_id: SID },
        { $set: userObj },
        { upsert: true }
      );
    }
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

module.exports = MongoDB;
