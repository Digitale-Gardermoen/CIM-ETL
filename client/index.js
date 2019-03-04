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

console.log('############### CIM-ETL START UP ###############')
getDateString()
.then((date) => console.log(date, ' - Ready...'))
.catch(console.error);

/*
These cron jobs are split because the AD functions delete the ADUser collection.
Cim runs before the Collection is populated, and thinks that all users are deleted, then it sends the delete to the CIM api.
We dont want that.

Tried some await tricks here, but could figure it out.
*/
cron.schedule(adschedule, () => {
  try {
    getDateString()
      .then((date) => console.log(date, ' - AD CRON RAN'))
      .catch(console.error);
    aduser.importUsers();
  }
  catch (error) {
    console.error(error)
  }
});

cron.schedule(cimschedule, async () => {
  try {
    getDateString()
      .then((date) => console.log(date, ' - CIM CRON RAN'))
      .catch(console.error);
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

process.on('SIGINT', async function () {
  try {
    let date = await getDateString()
    console.log(date, ' - Got SIGINT, stopping application')
  }
  catch (error) {
    console.error(error);
  }
  finally {
    process.exit();
  }
});
