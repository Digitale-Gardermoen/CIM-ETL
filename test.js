const MSsql = require('./data/mssql.js');
const sql = new MSsql();

(async function test() {
  await sql.connect();
  let res = await sql.getUsers();
  console.log(res.rowsAffected);
})();

process.on('SIGINT', function() {
  console.log('Got SIGINT, stopping application');
  sql.disconnect();
  process.exit();
});