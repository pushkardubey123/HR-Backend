const mongoose=require('mongoose')

const dbConnect=()=>{
    const URI=process.env.MONGO_URL
    const con =mongoose.connect(`${URI}`)
}

module.exports=dbConnect