require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER, // You can use 'localhost\\instance' to connect to named instance
  database: process.env.MSSQL_DATABASE,
  port: process.env.MSSQL_PORT
}

class MssqlDB {
  async connect() {
    this.pool = await sql.connect(config);
  }

  async getUsers() {
    return this.pool.request().query('select * from dbo.ILM_view');
  }

  disconnect() {
    this.pool.close();
  }

}

module.exports = MssqlDB;