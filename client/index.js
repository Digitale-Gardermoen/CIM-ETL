require('dotenv').config();
const cron = require('node-cron');
const LdapLoader = require('../etl/aduser.js');
const CimLoader = require('../etl/cimuser.js');
const compare = require('../etl/collectionCompare.js');
const CimApi = require('../client/cimapi.js');
const getDateString = require('../client/dateString.js');

const aduser = new LdapLoader();
const cimuser = new CimLoader();
const cim = new CimApi();

const adschedule = process.env.CRON_AD;
const cimschedule = process.env.CRON_CIM;
const maxRemovedUsers = process.env.MAXREMOVEDUSERS;

console.log('############### CIM-ETL START UP ###############')
console.log(getDateString(), '- Ready...');

/*
These cron jobs are split because the AD functions delete the ADUser collection.
Cim runs before the Collection is populated, and thinks that all users are deleted, then it sends the delete to the CIM api.
We dont want that.

Tried some await tricks here, but couldnt figure it out.
*/
cron.schedule(adschedule, () => {
  console.log(getDateString(), '- AD CRON RAN');
  aduser.importUsers();
});

cron.schedule(cimschedule, async () => {
  try {
    console.log(getDateString(), '- CIM CRON RAN');
    let diff = await compare(aduser, cimuser)                 // get the diff object from the compare function.
    if (diff.upserted.length > 0) {                           // check if any users are upserted.
      console.log('upserted: ', diff.upserted);
      let users = await cimuser.getUsersBySid(diff.upserted); // get the users from the CIMUser model. This returns an array.
      await cim.upsert(JSON.stringify(users, null, 2));       // send the array of users as a json string to the api.
    }
    if (diff.removed.length > 0) {
      console.log('removed: ', diff.removed);
      if (diff.removed.length > Number(maxRemovedUsers)) {
        console.warn(getDateString(), '- Max remove user lenght received, raise the limit before deleting the users');
        return;
      }
      else {
        await cim.delete(JSON.stringify(diff.removed));
      }
    }
  }
  catch (error) {
    console.error(getDateString(), error)
  }
});

process.on('SIGINT', async function () {
  try {
    console.log(getDateString(), '- Got SIGINT, stopping application');
  }
  catch (error) {
    console.error(getDateString(), error);
  }
  finally {
    process.exit();
  }
});
