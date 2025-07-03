const express =require('express')
const dotenv=require('dotenv')
const dbConnect=require('./Dbconnect/dbConfig')
const fileupload=require('express-fileupload')
const router=require('./Router/userRouter')
const cors =require('cors')
const path = require("path");
const leaveRouter=require('./Router/LeaveRouter')
const notifyTaskDeadlines = require("./utils/taskDeadlineNotifier");
const birthdayAnniversaryNotifier = require("./utils/birthdayAnniversaryNotifier");

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
app.use("/static", express.static(path.join(__dirname, "uploads")));

app.use("/api/departments", require("./Router/departmentRouter"));
app.use("/api/designations", require("./Router/designationRouter"));
app.use("/api/shifts", require("./Router/ShiftRouter"));
app.use("/api/projects", require("./Router/projectRoutes"));
app.use("/api/leaves", leaveRouter);
app.use("/api/attendance", require("./Router/AttendenceRouter"));
app.use("/api/payrolls", require("./Router/PayrollsRouter"));
app.use("/api/documents", require("./Router/documentRoutes"));
app.use("/api/exit", require("./Router/exitRoutes"));
app.use("/api/reports", require("./Router/reportRoutes"));
app.use("/api/notifications", require("./Router/notificationRoutes"));
app.use(router)

 
notifyTaskDeadlines();

birthdayAnniversaryNotifier();

const PORT=process.env.PORT || 3003

app.listen(PORT,()=>{
    console.log(`Server is running on:${PORT}`)
})