const express =require('express')
const dotenv=require('dotenv')
const dbConnect=require('./Dbconnect/dbConfig')
const fileupload=require('express-fileupload')
const router=require('./Router/userRouter')
const cors =require('cors')
const leaveRouter=require('./Router/LeaveRouter')

dotenv.config()
const app= express()
app.use(cors({
  origin: ['http://localhost:5173', 'https://hareetech.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

dbConnect()
app.use(express.json())
app.use(fileupload())
app.use("/uploads", express.static("uploads"));

app.use("/api/departments", require("./Router/departmentRouter"));
app.use("/api/designations", require("./Router/designationRouter"));
app.use("/api/shifts", require("./Router/ShiftRouter"));
app.use("/api/projects", require("./Router/projectRoutes"));
app.use("/api/leaves", leaveRouter);
app.use("/api/attendance", require("./Router/AttendenceRouter"));
app.use("/api/payrolls", require("./Router/PayrollsRouter"));

app.use(router)
const PORT=process.env.PORT || 3003

app.listen(PORT,()=>{
    console.log(`Server is running on:${PORT}`)
})