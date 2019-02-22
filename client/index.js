const cron = require('node-cron');
const LdapLoader = require('../etl/aduser.js');
const CimLoader = require('../etl/cimuser.js');
const compare = require('../etl/collectionCompare.js');
const CimApi = require('../client/cimapi.js');

const aduser = new LdapLoader();
const cimuser = new CimLoader();
const cim = new CimApi();

const adschedule = '10,30,50 * * * *'
const cimschedule = '0,20,40 * * * *'

/*
These cron jobs are split because the AD functions delete the ADUser collection.
Cim runs before the Collection is populated, and thinks that all users are deleted, then it sends the delete to the CIM api.
We dont want that.

Tried some await tricks here, but could figure it out.
*/
cron.schedule(adschedule, () => {
  try {
    console.log('AD CRON RAN');
    aduser.importUsers();
  }
  catch (error) {
    console.error(error)
  }
});

cron.schedule(cimschedule, async () => {
  try {
    console.log('CIM CRON RAN');
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
  }
  catch (error) {
    console.error(error)
  }
});

process.on('SIGINT', function() {
  console.log('Got SIGINT, stopping application');
  process.exit(err ? 1 : 0);
});
