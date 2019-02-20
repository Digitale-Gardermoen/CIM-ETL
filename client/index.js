const cron = require('node-cron');
const LdapLoader = require('../etl/aduser.js');
const CimLoader = require('../etl/cimuser.js');
const compare = require('../etl/collectionCompare.js');
const CimApi = require('../client/cimapi.js');
const Logging = require('../log/logging.js');
const aduser = new LdapLoader();
const cimuser = new CimLoader();
const cim = new CimApi();
const logger = new Logging();

const adschedule = '10,30,50 * * * * *'
const cimschedule = '0,20,40 * * * * *'

cron.schedule(adschedule, () => {
  try {
    logger.consoleHandler('ad ran');
    aduser.importUsers();
  }
  catch (error) {
    logger.errorHandler(error)
  }
});

cron.schedule(cimschedule, async () => {
  try {
    logger.consoleHandler('cim ran');
    let diff = await compare(aduser, cimuser)                 // get the diff object from the compare function.
    if (diff.upserted.length > 0) {                           // check if any users are upserted.
      logger.consoleHandler('upserted: ' + diff.upserted.toString());
      let users = await cimuser.getUsersBySid(diff.upserted); // get the users from the CIMUser model. This returns an array.
      await cim.upsert(JSON.stringify(users, null, 2));       // send the array of users as a json string to the api.
    }
    if (diff.removed.length > 0) {
      logger.consoleHandler('removed: ' + diff.removed.toString());
      await cim.delete(JSON.stringify(diff.removed));
    }
  }
  catch (error) {
    logger.errorHandler(error)
  }
});
