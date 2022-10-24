const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase-admin/app');
const admin = require("firebase-admin");


const app = express();

app.use(cors());
app.use(bodyParser.json())

app.get('/',(req,res) => {
    res.send('server running')
})




const serviceAccount = require("./burj-al-arab-626ef-firebase-adminsdk-52yn0-3929090bba.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = "mongodb+srv://mdashik:mongopass@cluster0.bgcjjxf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const hotelCollection = client.db('hoteldb').collection('hotelcollections');
  const bookingCollection = client.db('hoteldb').collection('bookings');

  
  app.post('/booking',(req,res) => {
    bookingCollection.insertOne(req.body)
    .then(res => {
        console.log(res)
    })
  })
  
  app.post('/currentbookings',(req,res) => {
    const currentUserId = req.body.user.uid;

    bookingCollection.find({userId:currentUserId})
    .toArray((err, result) => {
        res.send(result)
    })
  })

  app.get('/getbookings/:email',(req,res) => {
    const email = req.params.email;
    const headers = req?.headers?.authorization?.split(' ');

    if (headers !== undefined && email !== undefined && headers[0] === 'Bearar' ) {
       admin.auth()
      .verifyIdToken(headers[1])
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        if (tokenEmail === email) {
            bookingCollection.find({userEmail:email})
            .toArray((err, result) => {
                res.send(result)
            })
        }else{
          res.sendStatus(401)
          res.send('un-authorized')
        }
      })
      .catch((error) => {
        res.send(error.message)
      });

    }else{
      res.sendStatus(401)
      res.send('un-authorized');
    }
  })
});



app.listen(4000,() => {
    console.log('running at port 4000')
})