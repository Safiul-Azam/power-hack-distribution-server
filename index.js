const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//port set
const port = process.env.PORT || 5000
require('dotenv').config()

// middle ware
app.use(cors())
app.use(express.json())

// connect mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5d2zd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//FUNCTION FOR API
async function run() {
    try {

        await client.connect()
        const billCollection = client.db('power-hack').collection('billingList')


        app.get('/billing-list', async (req, res) => {
            const clickPage = parseInt(req.query.clickPage)
            const perPageData = parseInt(req.query.perPageData)
            let billList;
            if (clickPage || perPageData) {
                billList = await billCollection.find().skip(clickPage * perPageData).limit(perPageData).toArray()
            }else{
                billList = await billCollection.find().toArray()
            }
            res.send(billList)
        })

        app.get('/billing-count', async (req, res) => {
            const cursor = await billCollection.estimatedDocumentCount()
            res.send({ cursor })
        })
        
        app.post('/add-billing', async (req, res) => {
            const billDoc = req.body
            const result = await billCollection.insertOne(billDoc)
            res.send(result)
        })

        app.delete('/delete-billing/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await billCollection.deleteOne(query)
            res.send(result)
        })
        app.patch('/update-billing/:id', async (req, res) => {
            const id = req.params.id
            const bill = req.body
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: bill
            }
            const result = await billCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('power-hack-distribution is running')
})
app.listen(port, () => {
    console.log('listening', port)
})