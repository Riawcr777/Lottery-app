
document.getElementById("date").valueAsDate = new Date();

function reverseRow(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const topInput = row.querySelector(".top");
  const bottomInput = row.querySelector(".bottom");
  const todInput = row.querySelector(".tod");
  const number = numberInput.value;
  if(number.length >= 2){
    const reversed = number.split("").reverse().join("");
    const rows = document.querySelectorAll("table tr");
    for(let i=1;i<rows.length;i++){
      const n = rows[i].querySelector(".number");
      const t = rows[i].querySelector(".top");
      const b = rows[i].querySelector(".bottom");
      const td = rows[i].querySelector(".tod");
      if(n.value === ""){
        n.value = reversed;
        t.value = topInput.value;
        b.value = bottomInput.value;
        td.value = todInput.value;
        break;
      }
    }
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
  const summary = {};
  let total3 = 0;
  let total2 = 0;
  for(let i=0;i<numbers.length;i++){
    const num = numbers[i].value;
    const top = parseFloat(tops[i].value)||0;
    const bottom = parseFloat(bottoms[i].value)||0;
    const tod = parseFloat(tods[i].value)||0;
    if(num !== ""){
      if(!summary[num]) summary[num] = {top:0,bottom:0,tod:0};
      summary[num].top += top;
      summary[num].bottom += bottom;
      summary[num].tod += tod;
      total3 += top + tod;
      total2 += bottom;
    }
  }
  displaySummary(summary);
  document.getElementById("total").innerHTML = "ยอดรวม 3 ตัว: " + total3 + " บาท | ยอดรวม 2 ตัว: " + total2 + " บาท";
  localStorage.setItem("lottery_summary", JSON.stringify(summary));
}

function displaySummary(summary){
  let html = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th><th>แก้ไข</th></tr>";
  for(const [num,amt] of Object.entries(summary)){
    html += `<tr><td contenteditable="true">${num}</td><td contenteditable="true">${amt.top}</td><td contenteditable="true">${amt.bottom}</td><td contenteditable="true">${amt.tod}</td><td><button onclick="saveBill()">💾</button></td></tr>`;
  }
  html += "</table>";
  document.getElementById("summary").innerHTML = html;
}

function cutBill(){
  saveBill();
  const history = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  const summary = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  history.push({date:new Date().toLocaleString(), data:summary});
  localStorage.setItem("lottery_history", JSON.stringify(history));
  loadHistory();
  document.getElementById("lottery-form").reset();
  localStorage.removeItem("lottery_summary");
  document.getElementById("summary").innerHTML = "";
  document.getElementById("total").innerHTML = "";
}

function loadHistory(){
  const history = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  let html = "";
  for(const h of history){
    html += `<div><b>${h.date}</b><table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th><th>แก้ไข</th></tr>`;
    for(const [num,amt] of Object.entries(h.data)){
      html += `<tr><td contenteditable="true">${num}</td><td contenteditable="true">${amt.top}</td><td contenteditable="true">${amt.bottom}</td><td contenteditable="true">${amt.tod}</td><td><button onclick="saveBill()">💾</button></td></tr>`;
    }
    html += "</table></div><hr>";
  }
  document.getElementById("history").innerHTML = html;
}

function exportExcel(){
  const data = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  const ws = XLSX.utils.json_to_sheet(Object.keys(data).map(k=>({เลข:k,บน:data[k].top,ล่าง:data[k].bottom,โต๊ด:data[k].tod})));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "lottery_summary.xlsx");
}

function exportCSV(){
  const data = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  let csv = "เลข,บน,ล่าง,โต๊ด\n";
  for(const [num,amt] of Object.entries(data)){
    csv += `${num},${amt.top},${amt.bottom},${amt.tod}\n`;
  }
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lottery_summary.csv";
  a.click();
}

function startVoice(){
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "th-TH";
  recognition.onresult = function(event){
    const text = event.results[0][0].transcript;
    alert("คำสั่งเสียง: " + text);
  }
  recognition.start();
}
