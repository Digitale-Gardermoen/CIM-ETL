async function upsertUsers(destination, diff, user) {
  let duser = await destination.findUser(user.user_import_id);
  try {
    let action;
    if (!duser) {
      console.log(user.username, ' doesn\'t exist');
      diff.upserted.push(user.user_import_id);
      action = await destination.setUser(user.user_import_id, user, {});
      return action;
    }
    else {
      let adProperties = {};
      Object.keys(user._doc)
        .filter((prop) => Object.keys(duser._doc).indexOf(prop) < 0)
        .forEach(key => adProperties[key] = user[key]);

      let cimProperties = {};
      Object.keys(duser._doc)
        .filter((prop) => Object.keys(user._doc).indexOf(prop) < 0)
        .forEach(key => cimProperties[key] = '');

      Object.keys(user._doc).forEach(key => {
        if (duser[key] != user[key]) {
          adProperties[key] = user[key];
        }
      });

      if (Object.keys(adProperties).length === 0 && Object.keys(cimProperties).length === 0) {
        return;
      };

      diff.upserted.push(user.user_import_id);
      action = await destination.setUser(user.user_import_id, adProperties, cimProperties);
      return action;
    }
  }
  catch (err) {
    console.log(err);
  }
}

async function removeUsers(destination, sidArr, diff) {
  await destination.getUsers()
    .then(async function (destinationUsers) {
      destinationUsers.forEach(async user => {
        let exists = false;                   // create a var to change if it exists.
        sidArr.forEach(sid => {               // loop over the sids in the array we made earlier.
          if (user.user_import_id === sid) {  // check if the users "importid(SID)" equals type and content.
            exists = true;                    // set to true if true :)
          }
        });
        if (!exists) {                        // check if exists is false and call removeUser if so.
          console.log('removed user: ', user.username);
          diff.remove.push(user.user_import_id);
          await destination.removeUser(user.user_import_id);
        }
      })
    })
    .catch(console.log);
}

async function compare(source, destination) {
  let diff = {
    upserted: [],
    removed: []
  }

  await source.getUsers()
    .then(async function (users) {
      let sidArr = [];

      await users.forEach(async user => {
        sidArr.push(user.user_import_id);     // push the sid for use later.
        await upsertUsers(destination, diff, user);
      });
      await removeUsers(destination, sidArr, diff)
    })
    .catch(console.log);
  return diff;
}

module.exports = compare;