const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const ws = require('ws'); //web sockets
const Message = require('./models/Message');
const fs = require('fs');

//mongo connection url PLACED ON THE .ENV FILE
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


dotenv.config();
mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) throw err;
});
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
// console.log(process.env.MONGO_URL);

const app = express();

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));

function getUserDataFromRequest(req) {
  try {
    const token = req.cookies?.token;
    if (token) {
      const userData = jwt.verify(token, jwtSecret, {});
      return userData;
    } else {
      throw 'no token';
    } 
  } catch (err) {
    throw err;
  }
}

app.get('/test', (req,res) => {
  try { 
    res.json('test ok');
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Something went wrong!'
    });
  }
});

app.get('/messages/:userId', async (req,res) => {
  try {
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender:{$in:[userId,ourUserId]},
      recipient:{$in:[userId,ourUserId]},
    }).sort({createdAt: 1});
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});


app.get('/people', async (req,res) => {
  try {
    const users = await User.find({}, {'_id':1,username:1});
    res.json(users);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

app.get('/profile', (req,res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        res.json(userData);
      });
    } else {
      res.status(401).json('no token');
    }
  } catch(err) {
    console.log('Error while verifying token: ', err);
  }
});


app.post('/login', async (req,res) => {
  try {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
          res.cookie('token', token, {sameSite:'none', secure:true}).json({
            id: foundUser._id,
          });
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.post('/logout', (req,res) => {
  try {
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
    throw new Error('Unable to process request'); 
  } catch(err) {
    console.log(err);
    res.status(500).send('Something went wrong.')
  }
});

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username:username,
      password:hashedPassword,
    });
    jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    });
  } catch(err) {
    if (err) throw err;
    res.status(500).json('error');
  }
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection, req) => {

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

  //read username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if(cookies){
    try {
      const tokenCookiesString = cookies.split(';').find(str => str.startsWith('token='));
      if(tokenCookiesString){
        const token = tokenCookiesString.split('=')[1];
        if(token){
          jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if(err) throw err;
            const {userId, username} = userData;
            connection.userId = userId;
            connection.username = username;
          })
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  connection.on('message', async (message) => {
    try {
        const messageData = JSON.parse(message.toString());
        const {recipient, text} = messageData;
        if (recipient && text) {
            const messageDoc = await Message.create({
            sender: connection.userId,
            recipient,
            text,
            });
            [...wss.clients].filter(c => c.userId === recipient).forEach(c => c.send(JSON.stringify({text, sender:connection.userId, recipient, _id:messageDoc._id})));
        }
    } catch (err) {
        console.error(err);
    }
});

  //notify everyone about online people (when soeone connects)
  notifyAboutOnlinePeople();

});