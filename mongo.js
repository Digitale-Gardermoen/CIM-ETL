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
    this.conn = mongoose.createConnection(process.env.MONGO, {
      useNewUrlParser: true,
      bufferCommands: false
    });
    this.User = this.conn.model("user", userSchema);
  }

  async findUser(username) {
    return this.User.find({ username: username }).exec();
  }

  async upsertUser(SID, userObj) {
    return this.User.updateOne(
      { user_import_id: SID },
      { $set: userObj },
      { upsert: true }
    );
  }
}

module.exports = db;
