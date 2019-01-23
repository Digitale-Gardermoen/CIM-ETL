const mongoose = require("mongoose");
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
    // establish connection, there is no particular reason for using createConnection in place of connect. This just worked. I belive both of them work...
    this.conn = mongoose.createConnection(process.env.MONGO, {
      useNewUrlParser: true
    });
    // create the User model so we can run queries against the users collection.
    this.User = this.conn.model("user", userSchema);
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
    return this.User.find().exec();
  }
}

module.exports = db;
