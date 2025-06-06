const mongoose=require('mongoose')

const dbConnect=()=>{
    const URI=process.env.MONGO_URL
    const con =mongoose.connect("mongodb://localhost:27017/HR_Hareetech")
    if (con) {
        console.log("Database connected !")
    }
}

module.exports=dbConnect