const express = require('express')
const port = 4000
const MongoClient = require('mongodb').MongoClient;

const cors = require("cors");
const bodyParser = require("body-parser");
var admin = require("firebase-admin");
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_ALL}:${process.env.DB_ALL}@cluster0.ki0s6.mongodb.net/${process.env.DB_ALL}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var serviceAccount = require("./burj-al-arab-5fedf-firebase-adminsdk-zitzi-750ced34e7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-5fedf.firebaseio.com"
});


const app = express()
app.use(cors());
app.use(bodyParser.json());

client.connect(err => {
  const bookings = client.db(`${process.env.DB_ALL}`).collection("bookings");
  app.post('/addBooking', (req, res) => {
    console.log(req.body);
    bookings.insertOne(req.body)
      .then(result => { res.send(result.insertedCount > 0) })
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization
    const email = req.query.email
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1]
      // idToken comes from the client app
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          let verifiedEmail = decodedToken.email;
          if (verifiedEmail == email) {
            bookings.find({ email: email })
              .toArray((err, result) => {
                res.send(result)
              })
          }
          else {
            res.status(401).send('Unauthorize Access')
          }

        }).catch(function (error) {
          res.status(401).send('Unauthorize Access')
        });
    }
    else {
      res.status(401).send('Unauthorize Access')
    }

  })

});


app.listen(port, () => {
  console.log(`${port} is running`)
})