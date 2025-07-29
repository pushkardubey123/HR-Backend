const mongoose=require('mongoose')

const dbConnect=()=>{
    const URI=process.env.MONGO_URL
    const con =mongoose.connect(`${URI}`)
    if (con) {
        console.log("Database Connected !!")
    }
}

module.exports=dbConnect