const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({

host:"localhost",
user:"root",
password:"krishna",
database:"freelancehub"

});

db.connect((err)=>{

if(err){

console.log(err);

}
else{

console.log("MySQL Connected");

}

});

app.post("/register",(req,res)=>{

const {
full_name,
email,
password,
role
} = req.body;

const sql =
"INSERT INTO users(full_name,email,password,role) VALUES(?,?,?,?)";

db.query(sql,
[full_name,email,password,role],
(err,result)=>{

if(err){

res.json({
success:false,
message:"User already exists"
});

}
else{

res.json({
success:true
});

}

});

});

app.post("/login",(req,res)=>{

const {email,password} = req.body;

const sql =
"SELECT * FROM users WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(result.length > 0){

res.json({
success:true
});

}
else{

res.json({
success:false
});

}

});

});

app.listen(5000,()=>{

console.log("Server Running on Port 5000");

});