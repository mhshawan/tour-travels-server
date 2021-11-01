const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iajji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//function
async function run() {
    try {
        await client.connect();
        console.log('database connected');
        const database = client.db('tour_travels');
        const tourCollection = database.collection('packages');
        const clientCollection = database.collection('client');

        //GET product API
        app.get('/packages', async (req, res) => {
            // console.log(req.query);
            const cursor = tourCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        // POST API For New Package
        app.post('/package', async (req, res) => {
            const newPackage = req.body;
            const result = await tourCollection.insertOne(newPackage);
            console.log('Got New Package', req.body);
            res.json(result);
        })

        app.get('/orders', async (req, res) => {
            const cursor = clientCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        });

        //ADD orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await clientCollection.insertOne(order);
            //console.log('order',order);
            res.json(result);
        })

        //  Delete API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await clientCollection.deleteOne(query);
            console.log('deleting user with id', id);
            res.json(result);
        });

        // PUT API FOR UPDATE
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const updatedOrder = req.body;
            console.log(updatedOrder)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: 'Approved',
                }
            }
            const result = await clientCollection.updateOne(filter, updateDoc, options);

            console.log('Update Hitted ', id);
            res.json(result);

        })

        // GET api for getting orders by USERID
        app.get('/orders/:uid', async (req, res) => {
            const USERID = req.params.uid;
            console.log(USERID)
            const query = { userID: USERID };
            const eachUserOrderData = await clientCollection.find(query).toArray();
            console.log(eachUserOrderData)
            res.json(eachUserOrderData);
        });
    }


    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello tour & travels..');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})