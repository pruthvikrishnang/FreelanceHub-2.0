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

// ================= REGISTER =================

app.post("/register",(req,res)=>{

const {

full_name,
email,
password,
role,

title,
city,
bio,
hourly_rate,
experience_years,
category,
skills,
location

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

const userId = result.insertId;


// AUTO CREATE FREELANCER PROFILE

if(role === "Freelancer"){

const freelancerSql = `
INSERT INTO freelancers
(
user_id,
city_id,
title,
bio,
hourly_rate,
experience_years,
rating,
linkedin_url,
category,
location,
skills,
availability,
description
)

VALUES
(?,?,?,?,?,?,?,?,?,?,?,?,?)
`;

db.query(
freelancerSql,
[
userId,
1,
title,
bio,
hourly_rate,
experience_years,
4.5,
"https://linkedin.com",
category,
location,
skills,
"yes",
bio
],
(err2,result2)=>{

if(err2){

console.log(err2);

return res.json({
success:false,
message:"Freelancer profile creation failed"
});

}

return res.json({
success:true
});

});

}
else{

return res.json({
success:true
});

}

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
status,
category
} = req.body;
const sql = `
INSERT INTO projects
(recruiter_id,title,description,budget,status,category)
VALUES(?,?,?,?,?,?)
`;

db.query(
sql,
[
recruiter_id,
title,
description,
budget,
status,
category
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
status,
category
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
status: project.status,
category: project.category

}));

res.json(projects);

});

});
// ================= GET FREELANCERS =================

app.get("/freelancers",(req,res)=>{

const sql = `
SELECT
f.freelancer_id,
u.full_name,
f.title,
f.category,
f.location,
f.skills,
f.hourly_rate,
f.rating,
f.availability,
f.description

FROM freelancers f

JOIN users u
ON f.user_id = u.user_id

ORDER BY f.rating DESC
`;

db.query(sql,(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
success:false
});

}

res.json(result);

});

});

// ================= SERVER =================

app.listen(5000,()=>{

console.log("Server Running on Port 5000");

});