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
  timezonee: String,
  employee_id: String,
  job_title: String,
  roles: String,
  person_type: String,
  dist_list: String,
  description: String
});

class db {
  constructor() {
    this.conn = mongoose.createConnection("mongodb://127.0.0.1:27017/myapp", {
      useNewUrlParser: true,
      bufferCommands: false
    });
    this.User = this.conn.model("user", userSchema);
  }

  async findUser(username) {
    console.log('checking db for user: ', username);
    return this.User.find({ username: username }).exec();
  }
}

module.exports = db;