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
    this.conn = mongoose
      .connect(
        process.env.MONGO, {
          useNewUrlParser: true,
          user: process.env.MUSER,
          pass: process.env.MPW,
          dbName: process.env.MDBNAME
        },
        function (err) {
          if (err) console.error('Failed to connect to mongo', err);    // this might be changed to do some better errorhandling later...
        });

    let updateArr = [];

    userSchema.post('updateOne', function (doc) {
      /* TODO: make this send the updated users to the client */
      console.log('got updateOne');
      console.log(doc.result.upserted[0]._id);
      updateArr.push(doc.result.upserted[0]._id);
      console.log(updateArr);
    });

    userSchema.post('deleteOne', function () {
      /* TODO: make this send the deleted user to the client */
      console.log('got deleteOne');
      console.log(this._conditions.user_import_id);
    });

    this.User = mongoose.model('user', userSchema);   // create the User model so we can run queries against the users collection.
  }
  
  async findUser(sid) {
    let Query = this.User.findOne({ user_import_id: sid })
    Query.select('-_id -__v')
    return Query.exec();   // get user by UII/SID, returns a callback function
  }

  /* will be removed */
  async usernameTest(username) {
    let Query = this.User.findOne({ username: username })
    Query.select('-_id -__v -job_phone')
    return Query.exec();   // get user by username, returns a callback function
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

  disconnectdb() {
    mongoose.disconnect();
    return;
  }

}

module.exports = db;
