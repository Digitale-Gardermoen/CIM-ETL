async function upsertUsers(destination, diff, user) {
  console.log('checking user: ', user.username);
  await destination.findUser(user.user_import_id)
    .then(async function (res, err) {
      if (err) {
        console.log(err);
        return err;
      }
      if (!res) {
        console.log(user.username, ' doesn\'t exist');
        diff.upserted.push(user.user_import_id);
        await destination.setUser(user.user_import_id, user);
      }
      else {
        res = res.toJSON();
        Object.keys(res).forEach(async (key) => {             // loop over keys so we can get the values.
          if (res[key] != user[key]) {                  // check if the values in the db is the same as the AD values.
            let unset = {};
            if (!user[key]) {
              unset[key] = "";
            }
            if (user[key] && !res[key]) {

            }
            console.log(key, 'is not equal for user', user.username);
            diff.upserted.push(user.user_import_id);
            await destination.setUser(user.user_import_id, user, unset); // import the user if true.
            return;
          }
        });
      }
    })
    .catch(console.log)
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