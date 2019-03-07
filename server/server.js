// read .env file
require('dotenv').config();

// controllers
const signIn = require('./controllers/signIn');
const register = require('./controllers/register');

const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;

// middleware
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require('cors');

// modules
const bcrypt = require('bcrypt-nodejs');
// library for SQL
const knex = require('knex');

const Chatkit = require('@pusher/chatkit-server');
const chatkit = new Chatkit.default({
  instanceLocator: 'v1:us1:e715b746-5ea8-4ca9-84d8-3c82b88981d8',
  key: process.env.CK_KEY
});

// for testing only
// const pwdHash = bcrypt.hashSync('password');
// const database = {
//   users: [
//     {
//       id: 1,
//       first_name: 'Jeremy',
//       last_name: 'Kimble',
//       email_address: 'gmail',
//       joined: new Date(),
//       username: 'jkcoder',
//       password: pwdHash,
//       messageCount: 0,
//     },
//     {
//       id: 1,
//       name: 'Amy',
//       username: 'batman',
//       email: 'email',
//       password: pwdHash,
//       messageCount: 0,
//       joined: new Date(),
//     },
//   ]
// };
/** SQL queries to make the tables
CREATE TABLE RCA_OWNER.users (
  sys_user_id serial PRIMARY KEY,
  user_name VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email_address text UNIQUE NOT NULL,
  joined TIMESTAMP NOT NULL
);
CREATE TABLE RCA_OWNER.login (
  sys_login_id serial PRIMARY KEY,
  user_email_address text UNIQUE REFERENCES users(email_address),
  password_hash varchar(100) NOT NULL
);
CREATE TABLE RCA_OWNER.chatrooms (
  sys_room_id serial PRIMARY KEY,
  room_name VARCHAR(100),
  message_count INTEGER
);
CREATE TABLE RCA_OWNER.chatroom_members (
  cr_room_id serial REFERENCES chatrooms(sys_room_id),
  users_user_id serial REFERENCES users(sys_user_id)
);
CREATE TABLE RCA_OWNER.message_history (
  sys_message_id serial PRIMARY KEY,
  cr_room_id serial REFERENCES chatrooms(sys_room_id),
  sender_user_id serial REFERENCES users(sys_user_id)
);
*/

const database = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ['rca_owner', 'public'],
  // debug: true,
});

app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  // some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200
};

// enable CORS pre-flight request
app.options('/signin', cors(corsOptions));
app.options('/register', cors(corsOptions));

// production mode
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client/build/index.html'))
  });
} else {
    app.use(express.static(path.resolve(__dirname, '..', 'client/public')));
    app.get('*', (req, res) => {
      res.sendFile(path.normalize('C:\\Users\\kimbl\\Desktop\\react-chat-app\\client\\public\\index.html'));
    });
  }

app.post('/signin', cors(), jsonParser, (req, res, next) => { signIn.handleSignIn(req,res,database,bcrypt) });
app.post('/register', cors(), jsonParser, (req, res, next) => { register.handleRegister(req, res, database, bcrypt, chatkit) });


app.listen(port, () => console.log(`Listening on port ${port}...`));