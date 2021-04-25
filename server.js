const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const MongoClient=require('mongodb').MongoClient
var db;
var string;
let date=new Date().toString()
MongoClient.connect('mongodb://localhost:27017',{ useUnifiedTopology: true},(err,database)=>{
    if(err) return console.log(err)
    db=database.db('centro')
    app.listen(1000,()=>{
        console.log("Listening to port #1000")
    })
})
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))


app.get('/',(req,res)=>{
    db.collection('stock').find().toArray((err,result)=>{
        if(err) return console.log(err)
        res.render('homepage.ejs',{data:result})
    })
})
app.get('/create',(req,res)=>{
    res.render('add.ejs')
})

app.get('/update',(req,res)=>{
    res.render('update.ejs')
})

app.get('/delete',(req,res)=>{
    res.render('delete.ejs')
})
app.post('/add_data',(req,res)=>{
    db.collection('stock').save(req.body,(err,result)=>{
        if(err) return console.log(err)
        res.redirect('/')
    })
})
app.post('/update_data',(req,res)=>{
    db.collection('stock').find().toArray((err,result)=>{
        if(err) return console.log(err)
        for(var i=0;i<result.length;i++){
            if(result[i].product_id==req.body.product_id){
                string=parseInt(result[i].quantity)
                break
            }
        }
    db.collection('stock').findOneAndUpdate({product_id:req.body.product_id},{
        $set: {quantity: string+parseInt(req.body.quantity)}},{sort: {_id:-1}}
        ,(err,result)=>{
            if(err) return console.log(err)
        })
    })
    db.collection('updated_db').insertOne({date: date,product_id:req.body.product_id,quantity:req.body.quantity},(err,result)=>{
        if(err) return console.log(err)
    })
    res.redirect('/')
})

app.post('/delete_data',(req,res)=>{
    db.collection('stock').findOneAndDelete({product_id:req.body.product_id},(err,result)=>{
        if(err) return console.log(err)
    })
    db.collection('deleted_db').insertOne({date: date,product_id:req.body.product_id},(err,result)=>{
        if(err) return console.log(err)
    })
    res.redirect('/')
})
