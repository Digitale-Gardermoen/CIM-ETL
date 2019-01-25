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
  org_import_id: String,
  location_import_id: String,
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
    // establish connection, there is no particular reason for using createConnection in place of connect. This just worked.
    this.conn = mongoose
      .connect(
        process.env.MONGO,
        { useNewUrlParser: true },
        function (err) {
          if (err ) console.error('Failed to connect to mongo', err);
        });
    // create the User model so we can run queries against the users collection.
    userSchema.post('updateOne', function() {
      console.log('got updateOne')
    });
    this.User = mongoose.model('user', userSchema);
  }

  // get user by username, returns a callback function
  async findUser(username) {
    return this.User.find({ username: username }).exec();
  }

  // function to update a user, if it doesn't exist insert the user.
  // this function only updates ONE document!
  async upsertUser(SID, userObj) {
    return this.User.updateOne(
      { user_import_id: SID },
      { $set: userObj },
      { upsert: true }
    );
  }

  // fetch all documents in the users collection, returns an array.
  async fetchUsers() {
    let Query = this.User.find();
    Query.select('-_id -__v');
    return Query.exec();
  }

  disconnectdb () {
    mongoose.disconnect();
    return;
  }

}

module.exports = db;
