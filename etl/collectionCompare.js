async function compare(source, destination) {
  source.getUsers()
    .then(function (users) {
      let sidArr = [];

      users.forEach(user => {
        sidArr.push(user.user_import_id);     // push the sid for use later.
        destination.findUser(user.user_import_id)
          .then(function (res, err) {
            if (err) {
              console.log(err);
              return err;
            }
            if (!res) {
              console.log(user.username, ' doesn\'t exist')
              destination.setUser(user.user_import_id, user);
            }
            else {
              res = res.toJSON();
              Object.keys(res).forEach((key) => {             // loop over keys so we can get the values.
                if (res[key] != user[key]) {                  // check if the values in the db is the same as the AD values.
                  console.log(key, 'is not equal for user', user.username);
                  destination.setUser(user.user_import_id, user); // import the user if true.
                  return;
                }
              });
            }
          })
          .catch(console.log)
      });

      destination.getUsers()
        .then(function (destinationUsers) {
          destinationUsers.forEach(user => {
            let exists = false;                   // create a var to change if it exists.
            sidArr.forEach(sid => {               // loop over the sids in the array we made earlier.
              if (user.user_import_id === sid) {  // check if the users "importid(SID)" equals type and content.
                exists = true;                    // set to true if true :)
              }
            });
            if (!exists) {                        // check if exists is false and call removeUser if so.
              console.log('removed user: ', user.username);
              destination.removeUser(user.user_import_id);
            }
          })
        })
        .catch(console.log);
    })
    .catch(console.log);

}

module.exports = compare;