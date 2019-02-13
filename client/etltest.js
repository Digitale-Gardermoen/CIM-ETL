const cron = require('node-cron');
const LdapLoader = require('../etl/aduser.js');
const CimLoader = require('../etl/cimuser.js');
const compare = require('../etl/collectionCompare.js');
const aduser = new LdapLoader();
const cimuser = new CimLoader();

const adschedule = '10,30,50 * * * * *'
const cimschedule = '0,20,40 * * * * *'

cron.schedule(adschedule, () => {
  console.log('ad ran');
  aduser.importUsers();
});

cron.schedule(cimschedule, async () => {
  console.log('cim ran');
  let diff = await compare(aduser, cimuser)
  if (diff.upserted.length > 0) {
    console.log('upserted: ', diff.upserted);
    users = await cimuser.getUsersBySid(diff.upserted);
    console.log(users);
  }
  if (diff.removed.length > 0) {
    console.log('removed: ', diff.removed);
  }
});
