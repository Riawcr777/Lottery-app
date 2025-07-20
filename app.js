
const users = [
  {username: "user1", password: "pass1"},
  {username: "user2", password: "pass2"},
  {username: "user3", password: "pass3"},
  {username: "user4", password: "pass4"},
  {username: "user5", password: "pass5"}
];

window.onload = function(){
  if(localStorage.getItem("current_user")){
    document.getElementById("login-page").style.display = "none";
    document.getElementById("app-page").style.display = "block";
    document.getElementById("current-user").innerText = localStorage.getItem("current_user");
    loadSummary();
  }
};

function login(){
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const found = users.find(x => x.username === u && x.password === p);
  if(found){
    localStorage.setItem("current_user", u);
    document.getElementById("login-page").style.display = "none";
    document.getElementById("app-page").style.display = "block";
    document.getElementById("current-user").innerText = u;
    loadSummary();
  }else{
    alert("Username หรือ Password ไม่ถูกต้อง");
  }
}

function logout(){
  localStorage.removeItem("current_user");
  location.reload();
}

function clearInput(){
  document.querySelectorAll(".number,.top,.bottom,.tod").forEach(e=>{
    e.value="";
    e.style.backgroundColor = "";
  });
}

function resetAll(){
  if(confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?")){
    localStorage.removeItem("lottery_cumulative");
    localStorage.removeItem("lottery_history");
    location.reload();
  }
}

function reverseRow(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  if(numberInput.value.length === 2){
    numberInput.value = numberInput.value.split("").reverse().join("");
  }
}

function reverse6Way(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const val = numberInput.value;
  if(val.length === 3){
    const perms = [...new Set([
      val,
      val[0]+val[2]+val[1],
      val[1]+val[0]+val[2],
      val[1]+val[2]+val[0],
      val[2]+val[0]+val[1],
      val[2]+val[1]+val[0]
    ])];
    alert("6 ประตู: " + perms.join(", "));
  }
}

document.getElementById("lottery-form").onsubmit = function(e){
  e.preventDefault();
  saveBill();
};

function saveBill(){
  const numbers = document.querySelectorAll(".number");
  const tops = document.querySelectorAll(".top");
  const bottoms = document.querySelectorAll(".bottom");
  const tods = document.querySelectorAll(".tod");
  const date = new Date().toLocaleString();

  const cumulative = JSON.parse(localStorage.getItem("lottery_cumulative") || "{}");
  const history = JSON.parse(localStorage.getItem("lottery_history") || "[]");

  let total3 = 0;
  let total2 = 0;

  for(let i=0;i<numbers.length;i++){
    const num = numbers[i].value.trim();
    const top = parseFloat(tops[i].value)||0;
    const bottom = parseFloat(bottoms[i].value)||0;
    const tod = parseFloat(tods[i].value)||0;
    if(num !== ""){
      if(!cumulative[num]) cumulative[num] = {top:0, bottom:0, tod:0};
      cumulative[num].top += top;
      cumulative[num].bottom += bottom;
      cumulative[num].tod += tod;

      history.push({num, top, bottom, tod, date});
      total3 += top + tod;
      total2 += bottom;

      numbers[i].value = "";
      tops[i].value = "";
      bottoms[i].value = "";
      tods[i].value = "";

      numbers[i].style.backgroundColor = "#ccc";
      tops[i].style.backgroundColor = "#ccc";
      bottoms[i].style.backgroundColor = "#ccc";
      tods[i].style.backgroundColor = "#ccc";
    }
  }

  localStorage.setItem("lottery_cumulative", JSON.stringify(cumulative));
  localStorage.setItem("lottery_history", JSON.stringify(history));
  displaySummary(cumulative);
  document.getElementById("total").innerHTML = "ยอดรวม 3 ตัว: " + total3 + " บาท | ยอดรวม 2 ตัว: " + total2 + " บาท";
  renderChart(cumulative);
}

function displaySummary(data){
  let summary2 = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";
  let summary3 = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";

  const entries = Object.entries(data).sort((a,b)=>{
    if(a[0].length !== b[0].length) return a[0].length - b[0].length;
    return parseInt(a[0]) - parseInt(b[0]);
  });

  for(const [num,amt] of entries){
    const row = `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
    if(num.length === 2){
      summary2 += row;
    }else if(num.length === 3){
      summary3 += row;
    }
  }

  summary2 += "</table>";
  summary3 += "</table>";
  document.getElementById("summary2").innerHTML = summary2;
  document.getElementById("summary3").innerHTML = summary3;
}

function loadSummary(){
  const cumulative = JSON.parse(localStorage.getItem("lottery_cumulative") || "{}");
  displaySummary(cumulative);
  renderChart(cumulative);
}

function exportExcel(){
  const data = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "History");
  XLSX.writeFile(wb, "lottery_history.xlsx");
}

function exportCSV(){
  const data = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  let csv = "เลข,บน,ล่าง,โต๊ด,วันเวลา
";
  for(const row of data){
    csv += `${row.num},${row.top},${row.bottom},${row.tod},${row.date}
`;
  }
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lottery_history.csv";
  a.click();
}

function renderChart(data){
  const ctx = document.getElementById("chart").getContext("2d");
  const sorted = Object.entries(data).sort((a,b)=>a[0].localeCompare(b[0]));
  const labels = sorted.map(e=>e[0]);
  const tops = sorted.map(e=>e[1].top);
  const bottoms = sorted.map(e=>e[1].bottom);
  const tods = sorted.map(e=>e[1].tod);

  if(window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "บน", data: tops },
        { label: "ล่าง", data: bottoms },
        { label: "โต๊ด", data: tods }
      ]
    }
  });
}
