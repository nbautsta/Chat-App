const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const ws = require('ws'); //web sockets

//mongo connection url PLACED ON THE .ENV FILE
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
// console.log(process.env.MONGO_URL);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
  // methods: ['GET', 'POST','PUT','DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization']
}))

app.get('/test',(req, res) => {
  res.json('test ok');
})

app.get('/profile', async (req, res) =>{
  try {
    const token = req.cookies?.token;
    if (token) {
      const userData = await jwt.verify(token, jwtSecret, {});
      res.json(userData);
    } else {
      res.status(401).json('no token');
    }
  } catch (err) {
    res.status(401).json(err.message);
  }
});
 


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) => {
          if (err) throw err;
          res.cookie('token', token, { sameSite: 'none', secure: true }).json({
            id: foundUser._id,
          });
        });
      }
    }
  } catch (err) {
    res.status(500).json('error');
  }
});



app.post('/register', async (req, res) =>{
  const{username, password} = req.body;
  
  try{
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
    const createdUser = await User.create({
      username: username, 
      password: hashedPassword
    });
    jwt.sign({userID:createdUser._id, username}, jwtSecret, {}, (err,token) => {
      if (err)
      throw err;
      res.cookie('token',token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    });
  }catch(err){
    if(err) throw err;
    res.status(500).json('error');
  }

 
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection, req) => {

  //read username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if(cookies){
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
  }

  connection.on('message', (message) => {
    const messageData = JSON.parse(message.toString());
    const {recipient,text} = messageData;
    if(recipient && text){
      [...wss.clients].filter(c => c.userId === recipient).forEach(c => c.send(JSON.stringify({text})));
    }
  });

  //notify everyone about online people (when soeone connects)
  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map( c => ({userId: c.userId,username: c.username}))
    }
      
    ))
  })

})