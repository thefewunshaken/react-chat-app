/** 
 * TO DO: investigate bug when creating new room after registering
 * CHATKIT shows that new room is created, but app crashes
 * ^^^ Have not been able to reproduce
 * Maybe it is if you click on the message form and then try to make a room?
*/

const handleRegister = (req, res, database, bcrypt, chatkit) => {
  const { firstName, lastName, email, username, password,  } = req.body;
  // flag to check if user is create in db
  let userCreated = false;

  database.select('user_name', 'email_address').from('users')
    .then(queryResult => {
      console.log(queryResult);
      // no entries in the database match the proposed username or email
      const isNewUsernameUnique = queryResult.every(entry => entry.user_name !== username);
      const isNewEmailUnique = queryResult.every(entry => entry.email_address !== email);
      validateProposedUser(isNewUsernameUnique, isNewEmailUnique);
    })
    .catch(err => res.status(400).json(`Error connecting to database: ${err}`));

  const validateProposedUser = (isUserUnq,isEmailUnq) => {
    if (isUserUnq && isEmailUnq) {
      console.log(`User ${username} is unique`);
      // create chatkit user
      chatkit.createUser({
        id: username,
        name: `${firstName} ${lastName}`
      })
        .then(() => {
          userCreated = true;
          commitNewUser(userCreated);
        }).catch((err) => {
          console.log(err.error_description);
          res.sendStatus(400).send(err.error_description);
        })
      .catch(err => console.log(`Chatkit user already exists. ${err}`));
    } else if (!isUserUnq) {
      console.log(`User ${username} already exists.`);
      res.status(400).json(`User ${username} already exists.`);
    } else {
      console.log('User already exists with this email.');
      res.status(400).json('User already exists with this email.');
    }
  }

  const commitNewUser = userCreated => {
    if(userCreated) {
      const pwdHash = bcrypt.hashSync(password);
      const newProposedUser = {
        user_name: username,
        first_name: firstName,
        last_name: lastName,
        email_address: email,
        joined: new Date()
      };
      // db insert newLogin into login
      database.transaction(trx => {
        trx.insert(newProposedUser)
        .into('users')
        .returning('*')
        .then(user => {
          res.json(user[0]);
          const newProposedLogin = {
            user_email_address: email,
            password_hash: pwdHash
          };
          // db insert newUser into users
          return trx.insert(newProposedLogin)
            .into('login')
        })
        .then(trx.commit)
        .catch(trx.rollback);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json('Unable to register');
      });
      return;
    }
  }

}

module.exports = {handleRegister}
