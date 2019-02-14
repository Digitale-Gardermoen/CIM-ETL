const cron = require('node-cron');
const LdapLoader = require('../etl/aduser.js');
const CimLoader = require('../etl/cimuser.js');
const compare = require('../etl/collectionCompare.js');
const CimApi = require('../client/cimapi.js');
const aduser = new LdapLoader();
const cimuser = new CimLoader();
const cim = new CimApi();

const adschedule = '10,30,50 * * * * *'
const cimschedule = '0,20,40 * * * * *'

cron.schedule(adschedule, () => {
  console.log('ad ran');
  aduser.importUsers();
});

cron.schedule(cimschedule, async () => {
  console.log('cim ran');
  let diff = await compare(aduser, cimuser)                 // get the diff object from the compare function.
  if (diff.upserted.length > 0) {                           // check if any users are upserted.
    console.log('upserted: ', diff.upserted);
    let users = await cimuser.getUsersBySid(diff.upserted); // get the users from the CIMUser model. This returns an array.
    await cim.upsert(JSON.stringify(users, null, 2));       // send the array of users as a json string to the api.
  }
  if (diff.removed.length > 0) {
    console.log('removed: ', diff.removed);
    await cim.delete(JSON.stringify(diff.removed));
  }
});
