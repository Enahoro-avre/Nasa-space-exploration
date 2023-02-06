const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once("open" , (err)=>{
    console.log("MongoDB connection ready")
})

mongoose.connection.on("error" , (err)=>{
    console.log(err)
})

async function mongoConnect(){
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
}

module.exports = {
    mongoConnect
}