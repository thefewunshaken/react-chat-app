const handleSignIn = (req, res, database, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('Incorrect form submission');
  }
// grab loginInfo from database and compare to req.body
  database.select('user_email_address', 'password_hash').from('login')
    .where('user_email_address', '=', email)
    .then(queryResult => {
      const userLogin = queryResult[0];
        // if an entry does not exist in the database
        if(userLogin === undefined) {
          res.status(400).json('User does not exist.');
        } else {
            // compare password
            const isUserValid = bcrypt.compareSync(password, userLogin.password_hash);
            // if user is valid, send user, otherwise, send 403 & message
            if (isUserValid) {
              return database.select('*').from('users')
                .where('email_address', '=', email )
                .then(user => {
                  res.json(user[0]);
                  console.log('User sent successfully.');
                })
                .catch(err => res.status(400).json('Unable to fetch user.'));
            } else {
              res.status(403).json('Email/password is incorrect.');
            }
          }
    })
    .catch(err => console.log(err));
}

module.exports = {handleSignIn}