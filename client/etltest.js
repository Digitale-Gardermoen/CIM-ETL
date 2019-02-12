const LdapLoader = require('../etl/aduser.js');
const CimLoader = require('../etl/cimuser.js');
const compare = require('../etl/collectionCompare.js');
const aduser = new LdapLoader();
const cimuser = new CimLoader();
const cron = require('node-cron');

const schedule = '*/10 * * * * *'

cron.schedule(schedule, async () => {
  console.log('cron ran');
  aduser.importUsers();
  await compare(aduser, cimuser);
});
