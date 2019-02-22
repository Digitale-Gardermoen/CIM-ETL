const sql = require('mssql');

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER, // You can use 'localhost\\instance' to connect to named instance
  database: process.env.MSSQL_DATABASE,
  port: process.env.MSSQL_PORT
}

class MssqlDB {
  constructor() {
    this.pool = sql.connect(config);
  }

}

module.exports = MssqlDB;