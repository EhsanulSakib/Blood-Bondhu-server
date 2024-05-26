const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhwjvgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  const logger = (req, res, next) =>{
    console.log('log info: ', req.method, req.url)
    next()
  }
  
  const verifyToken = (req,res,next)=>{
    const token = req.cookies?.token
    // console.log('token in the middleware', token)
    if(!token){
        return res.status(401).send({message: 'Unauthorized Access'})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) =>{
        if(err){
            return res.status(401).send({message: 'Unauthorized Access'})
        }
        req.user = decode
        console.log(decode)
        next()
    })
  }
  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
  
      const userCollection = client.db("BloodBondhu").collection('user');
      const donorCollection = client.db("BloodBondhu").collection('donor');
  
      app.get('/user', async(req,res) =>{
        const cursor = userCollection.find();
        const result = await cursor.toArray();
  
        res.send(result)
    })

      app.post('/user', async(req,res) =>{
        const userInfo = req.body;
        console.log(userInfo)
        const check = await userCollection.findOne({email: userInfo.email})
        if (check && check.email === userInfo.email){
          userCollection.updateOne({email: check.email},{$set: userInfo})
          return res.status(400).send({message: "email already exist"})
        }
        else{
          const result = await userCollection.insertOne(userInfo);
        }
        res.send(userInfo)
      })

      app.post('/donor', async(req,res) =>{
        const donorInfo = req.body;
        console.log(donorInfo)
        const check = await donorCollection.findOne({email: donorInfo.email})
        if (check && check.email === donorInfo.email){
          return res.status(400).send({message: "already registered"})
        }
        else{
          const result = await donorCollection.insertOne(donorInfo);
        }
        res.send(donorInfo)
      })

      // Send a ping to confirm a successful connection
      // await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);






app.get('/', (req,res) =>{
    res.send("Blood Bondhu Website running ")
})

app.listen(port,() => {
    console.log(`Server Running on port: ${port}`)
})