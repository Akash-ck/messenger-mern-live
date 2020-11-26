import express from 'express'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import cors from 'cors'

import mongoMessages from './messageModel.js'

const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: "1113758",
    key: "1313343deff79be71cd1",
    secret: "427211308b08a1e2513d",
    cluster: "ap2",
    useTLS: true
  });

app.use(express.json())
app.use(cors())


const mongoURI = 'mongodb://admin:PlfmgrFYUkwHAm1Q@cluster0-shard-00-00.ynvp5.mongodb.net:27017,cluster0-shard-00-01.ynvp5.mongodb.net:27017,cluster0-shard-00-02.ynvp5.mongodb.net:27017/<dbname>?ssl=true&replicaSet=atlas-1zyqqh-shard-0&authSource=admin&retryWrites=true&w=majority'
mongoose.connect(mongoURI,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once('open',()=>{
    console.log('DB CONNECTED')

    const changeStream = mongoose.connection.collection('messages').watch()

    changeStream.on('change',(change)=>{
        pusher.trigger('messages','newMessage',{
            'change': change
        });
    })
})

app.get('/', (req,res)=>res.status(200).send('hello world'));

app.post('/save/message',(req,res) => {
    const dbMessage = req.body
    mongoMessages.create(dbMessage,(err,data)=>{
        if (err){
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get('/retrieve/conversation',(req,res)=>{

    mongoMessages.find((err, data)=>{
        if (err){
            res.status(500).send(err)
        } else {
            data.sort((b, a) => {
                return a.timestamp- b.timestamp;
            })
            res.status(201).send(data)
        }
    })

})

app.listen(port,()=>console.log(`listening on local host:${port}`))