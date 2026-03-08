let allData=[];

fetch("/stats")
.then(res=>res.json())
.then(data=>{

document.getElementById("total").innerText=data.total;
document.getElementById("applied").innerText=data.applied;
document.getElementById("shortlisted").innerText=data.shortlisted;
document.getElementById("rejected").innerText=data.rejected;

const ctx=document.getElementById("statusChart");

new Chart(ctx,{
type:"bar",
data:{
labels:["Applied","Shortlisted","Rejected","Interview"],
datasets:[{
label:"Applications",
data:[data.applied,data.shortlisted,data.rejected,data.interview],
backgroundColor:["#3b82f6","#22c55e","#ef4444","#f59e0b"]
}]
}
});

});


function loadApplications(){

fetch("/applications")
.then(res=>res.json())
.then(data=>{
allData=data;
displayTable(data);
});

}

loadApplications();


function displayTable(data){

const table=document.getElementById("jobTable");

table.innerHTML=`
<tr>
<th>Company</th>
<th>Role</th>
<th>Status</th>
<th>Date</th>
<th>Action</th>
</tr>
`;

data.forEach(job=>{

let row=table.insertRow();

row.insertCell(0).innerText=job.company_name;
row.insertCell(1).innerText=job.role;

let status=row.insertCell(2);

let select=document.createElement("select");

["Applied","Shortlisted","Rejected","Interview Scheduled"].forEach(s=>{
let option=document.createElement("option");
option.value=s;
option.text=s;
if(s===job.status) option.selected=true;
select.appendChild(option);
});

select.onchange=()=>updateStatus(job.application_id,select.value);

status.appendChild(select);

row.insertCell(3).innerText=job.application_date;

let del=document.createElement("button");

del.innerText="Delete";

del.onclick=()=>deleteApplication(job.application_id);

row.insertCell(4).appendChild(del);

});

}


function deleteApplication(id){

fetch("/deleteApplication/"+id,{method:"DELETE"})
.then(()=>location.reload());

}


function updateStatus(id,status){

fetch("/updateStatus/"+id,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({status})
});

}


document.getElementById("jobForm").addEventListener("submit",function(e){

e.preventDefault();

let data={
company_id:document.getElementById("company").value,
role:document.getElementById("role").value,
source:document.getElementById("source").value,
status:document.getElementById("status").value,
date:document.getElementById("date").value,
user_id:1
};

fetch("/addApplication",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
})
.then(()=>location.reload());

});