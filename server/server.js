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


// ================= REGISTER =================

app.post("/register",(req,res)=>{

const {
full_name,
email,
password,
role
} = req.body;

const checkSql =
"SELECT * FROM users WHERE email=?";

db.query(checkSql,[email],(checkErr,checkResult)=>{

if(checkErr){

console.log(checkErr);

return res.json({
success:false,
message:"Database Error"
});

}

if(checkResult.length > 0){

return res.json({
success:false,
message:"User already exists"
});

}

const sql =
"INSERT INTO users(full_name,email,password,role) VALUES(?,?,?,?)";

db.query(
sql,
[full_name,email,password,role],
(err,result)=>{

if(err){

console.log(err);

return res.json({
success:false,
message:err.message
});

}

return res.json({
success:true
});

});

});

});


// ================= LOGIN =================

app.post("/login",(req,res)=>{

const {email,password} = req.body;

const sql =
"SELECT * FROM users WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(err){

console.log(err);

return res.json({
success:false
});

}

if(result.length > 0){

res.json({
success:true,
user:result[0]
});

}
else{

res.json({
success:false
});

}

});

});


// ================= ADD PROJECT =================

app.post("/add-project",(req,res)=>{

const {
recruiter_id,
title,
description,
budget,
status
} = req.body;

const sql = `
INSERT INTO projects
(recruiter_id,title,description,budget,status)
VALUES(?,?,?,?,?)
`;

db.query(
sql,
[
recruiter_id,
title,
description,
budget,
status
],
(err,result)=>{

if(err){

console.log(err);

return res.json({
success:false,
message:err.message
});

}

res.json({
success:true
});

});

});


// ================= GET PROJECTS =================

app.get("/projects",(req,res)=>{

const sql = `
SELECT
project_id,
title,
description,
budget,
status
FROM projects
ORDER BY project_id DESC
`;

db.query(sql,(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
success:false,
message:"Database error"
});

}

const projects = result.map(project => ({

project_id: project.project_id,
title: project.title,
description: project.description,
budget: project.budget,
status: project.status

}));

res.json(projects);

});

});


// ================= SERVER =================

app.listen(5000,()=>{

console.log("Server Running on Port 5000");

});