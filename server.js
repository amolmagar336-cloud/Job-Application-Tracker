const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const db = new sqlite3.Database(path.join(__dirname, "job_tracker.db"));


// GET APPLICATIONS
app.get("/applications", (req, res) => {

const query = `
SELECT Applications.application_id,
company_name,
role,
status,
application_date
FROM Applications
JOIN Jobs ON Applications.job_id = Jobs.job_id
JOIN Companies ON Jobs.company_id = Companies.company_id
`;

db.all(query, [], (err, rows) => {

if(err){
res.status(500).json(err);
}
else{
res.json(rows);
}

});

});


// ADD APPLICATION
app.post("/addApplication", (req, res) => {

const { company_id, role, source, user_id, status, date } = req.body;

db.run(
"INSERT INTO Jobs (company_id, role, source) VALUES (?, ?, ?)",
[company_id, role, source],
function(err){

if(err){
res.status(500).json(err);
return;
}

let jobId = this.lastID;

db.run(
"INSERT INTO Applications (user_id, job_id, application_date, status) VALUES (?, ?, ?, ?)",
[user_id, jobId, date, status],
function(err){

if(err){
res.status(500).json(err);
}
else{
res.json({message:"Application Added"});
}

});

});

});


// DELETE APPLICATION
app.delete("/deleteApplication/:id", (req, res) => {

let id = req.params.id;

db.run(
"DELETE FROM Applications WHERE application_id = ?",
[id],
function(err){

if(err){
res.status(500).json(err);
}
else{
res.json({message:"Deleted"});
}

});

});


// UPDATE STATUS
app.put("/updateStatus/:id", (req, res) => {

let id = req.params.id;
let status = req.body.status;

db.run(
"UPDATE Applications SET status=? WHERE application_id=?",
[status, id],
function(err){

if(err){
res.status(500).json(err);
}
else{
res.json({message:"Updated"});
}

});

});


// DASHBOARD STATS
app.get("/stats", (req, res) => {

const query = `
SELECT 
COUNT(*) as total,
SUM(CASE WHEN status='Applied' THEN 1 ELSE 0 END) as applied,
SUM(CASE WHEN status='Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) as rejected,
SUM(CASE WHEN status='Interview Scheduled' THEN 1 ELSE 0 END) as interview
FROM Applications
`;

db.get(query, [], (err, row) => {

if(err){
res.status(500).json(err);
}
else{
res.json(row);
}

});

});


app.listen(3000, () => {
console.log("Server running on http://localhost:3000");
});