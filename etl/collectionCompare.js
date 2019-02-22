const Logging = require('../log/logging.js');
const logger = new Logging();

async function upsertUsers(destination, user, diff) {
  /*
    We want to check if the source user exists, or has any changes at the destination.
    if the user doesnt exists at the destination, just create it.
    If there are changed values from the source, we change the values on the properties.
    If there are properties on the destination that doesnt exist on the source, they will be deleted.
  */
  try {
    let duser = await destination.findUser(user.user_import_id);
    let action;
    if (!duser) { // check if the user doesnt exist, then add if so.
      diff.upserted.push(user.user_import_id);
      action = await destination.setUser(user.user_import_id, user, {});
      return action;
    }
    else {
      let sourceProps = {};
      let destinationProps = {};

      Object.keys(user._doc)                                          // put the keys of the source user in an array. then filter the array based on the destination.
        .filter((prop) => Object.keys(duser._doc).indexOf(prop) < 0)  // this way we can get the properties that doesnt exist on the destination user.
        .forEach(key => sourceProps[key] = user[key]);                // loop over the remaining keys in the array and add them to the sourceProps object.

      // this is the same as above only oposite, and it does not add the values, they are not needed.
      Object.keys(duser._doc)
        .filter((prop) => Object.keys(user._doc).indexOf(prop) < 0)
        .forEach(key => destinationProps[key] = '');

      Object.keys(user._doc).forEach(key => { // get all the keys from the source user and forloop
        if (duser[key] != user[key]) {          // check if the destination property has the same value as the source.
          sourceProps[key] = user[key];         // if not then add it to the sourceProps object.
        }
      });

      // this exits if there is nothing to be changed.
      if (Object.keys(sourceProps).length === 0 && Object.keys(destinationProps).length === 0) {
        return;
      };

      diff.upserted.push(user.user_import_id);  // add the user to the upserted array.
      action = await destination.setUser(user.user_import_id, sourceProps, destinationProps);
      return action;
    }
  }
  catch (error) {
    logger.errorHandler(error);
  }
}

async function removeUsers(destination, sidArr, diff) {
  let destinationUsers = await destination.getUsers();
  try {
    destinationUsers.forEach(async (user) => {
      let exists = false;                   // create a var to change if it exists.
      sidArr.forEach(sid => {               // loop over the sids in the array we made earlier.
        if (user.user_import_id === sid) {  // check if the users "importid(SID)" equals type and content.
          exists = true;                    // set to true if true :)
        }
      });
      if (!exists) {                        // check if exists is false and call removeUser if so.
        diff.removed.push(user.user_import_id);
        await destination.removeUser(user.user_import_id);
      }
    })
  }
  catch (error) {
    logger.errorHandler(error);
  }
}

async function compare(source, destination) {
  try {
    let diff = {
      upserted: [],
      removed: []
    };
    let sidArr = [];
    let users = await source.getUsers();
    users.forEach(async user => {
      sidArr.push(user.user_import_id);           // push the sid for use later.
      await upsertUsers(destination, user, diff);
    });
    await removeUsers(destination, sidArr, diff)

    return diff;
  }
  catch (error) {
    logger.errorHandler(error);
  }
}

module.exports = compare;