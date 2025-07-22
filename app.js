
document.getElementById("date").valueAsDate = new Date();

const table = document.getElementById("lottery-table");
for (let i = 0; i < 10; i++) {
  const row = table.insertRow();
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  const cell3 = row.insertCell(2);
  const cell4 = row.insertCell(3);
  const cell5 = row.insertCell(4);
  cell1.innerHTML = "<input type='text' class='number' maxlength='3'>";
  cell2.innerHTML = "<input type='number' class='top'>";
  cell3.innerHTML = "<input type='number' class='bottom'>";
  cell4.innerHTML = "<input type='number' class='tod'>";
  cell5.innerHTML = "<button type='button' onclick='reverseRow(this)'>กลับเลข</button>";
}

function reverseRow(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const topInput = row.querySelector(".top");
  const bottomInput = row.querySelector(".bottom");
  const todInput = row.querySelector(".tod");
  const number = numberInput.value.trim();
  let reversedNumbers = [];

  if(number.length === 2){
    reversedNumbers = [number.split("").reverse().join("")];
  } else if(number.length === 3){
    reversedNumbers = get3DigitPermutations(number).filter(n => n !== number);
  }

  const rows = document.querySelectorAll("#lottery-table tr");
  for(const rev of reversedNumbers){
    for(let i=1;i<rows.length;i++){
      const n = rows[i].querySelector(".number");
      const t = rows[i].querySelector(".top");
      const b = rows[i].querySelector(".bottom");
      const td = rows[i].querySelector(".tod");
      if(n && n.value === ""){
        n.value = rev;
        t.value = topInput.value;
        b.value = bottomInput.value;
        td.value = todInput.value;
        break;
      }
    }
  }
}

function get3DigitPermutations(number) {
  const results = [];
  const digits = number.split("");
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      for (let k = 0; k < digits.length; k++) {
        if (i !== j && j !== k && i !== k) {
          const perm = digits[i] + digits[j] + digits[k];
          if (!results.includes(perm)) {
            results.push(perm);
          }
        }
      }
    }
  }
  return results;
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
  const summary = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  let totalTop = 0, totalBottom = 0, totalTod = 0;
  for(let i=0;i<numbers.length;i++){
    const num = numbers[i].value.trim();
    const top = parseFloat(tops[i].value)||0;
    const bottom = parseFloat(bottoms[i].value)||0;
    const tod = parseFloat(tods[i].value)||0;
    if(num !== ""){
      if(!summary[num]) summary[num] = {top:0,bottom:0,tod:0};
      summary[num].top += top;
      summary[num].bottom += bottom;
      summary[num].tod += tod;
      totalTop += top;
      totalBottom += bottom;
      totalTod += tod;
      numbers[i].value = "";
      tops[i].value = "";
      bottoms[i].value = "";
      tods[i].value = "";
      numbers[i].style.backgroundColor = "";
    }
  }
  localStorage.setItem("lottery_summary", JSON.stringify(summary));
  document.getElementById("total").innerHTML = `ยอดรวมทั้งหมด: ${totalTop+totalBottom+totalTod} บาท (บน: ${totalTop}, ล่าง: ${totalBottom}, โต๊ด: ${totalTod})`;
  displaySummary(summary);
  drawChart(totalTop, totalBottom, totalTod);
}

function displaySummary(summary){
  const summary2 = [];
  const summary3 = [];
  for(const [num, amt] of Object.entries(summary)){
    if(num.length === 2) summary2.push([num, amt]);
    else if(num.length === 3) summary3.push([num, amt]);
  }
  summary2.sort((a,b)=>parseInt(a[0]) - parseInt(b[0]));
  summary3.sort((a,b)=>parseInt(a[0]) - parseInt(b[0]));
  let html2 = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";
  for(const [num, amt] of summary2){
    html2 += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
  }
  html2 += "</table>";
  let html3 = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";
  for(const [num, amt] of summary3){
    html3 += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
  }
  html3 += "</table>";
  document.getElementById("summary2").innerHTML = html2;
  document.getElementById("summary3").innerHTML = html3;
}

function drawChart(top, bottom, tod){
  const ctx = document.getElementById('summaryChart').getContext('2d');
  if(window.summaryChart) window.summaryChart.destroy();
  window.summaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['บน', 'ล่าง', 'โต๊ด'],
      datasets: [{
        label: 'ยอดรวม (บาท)',
        data: [top, bottom, tod]
      }]
    }
  });
}

function cutBill(){
  saveBill();
  const summary = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  const history = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  history.push({date: new Date().toLocaleString(), data: summary});
  localStorage.setItem("lottery_history", JSON.stringify(history));
  document.getElementById("summary2").innerHTML = "";
  document.getElementById("summary3").innerHTML = "";
  document.getElementById("total").innerHTML = "";
  loadHistory();
}

function loadHistory(){
  const history = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  let html = "";
  for(const h of history){
    html += `<div><b>${h.date}</b><table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>`;
    for(const [num,amt] of Object.entries(h.data)){
      html += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
    }
    html += "</table></div><hr>";
  }
  document.getElementById("history").innerHTML = html;
}

function resetAll(){
  if(confirm("ยืนยันล้างข้อมูลทั้งหมด?")){
    localStorage.clear();
    location.reload();
  }
}

function exportExcel(){
  const data = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  const now = new Date().toLocaleString();

  const sorted = Object.entries(data).sort((a,b)=>{
    if(a[0].length !== b[0].length) return a[0].length - b[0].length;
    return parseInt(a[0]) - parseInt(b[0]);
  });

  const rows = sorted.map(([k,v]) => ({
    เลข: k,
    บน: v.top,
    ล่าง: v.bottom,
    โต๊ด: v.tod,
    "บันทึกเมื่อ": now
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  const fileName = `lottery_summary_${now.replace(/[/,: ]/g,"_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function exportCSV(){
  const data = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  const now = new Date().toLocaleString();

  const sorted = Object.entries(data).sort((a,b)=>{
    if(a[0].length !== b[0].length) return a[0].length - b[0].length;
    return parseInt(a[0]) - parseInt(b[0]);
  });

  let csv = "เลข,บน,ล่าง,โต๊ด,บันทึกเมื่อ
";
  for(const [num,amt] of sorted){
    csv += `${num},${amt.top},${amt.bottom},${amt.tod},${now}
`;
  }

  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lottery_summary_${now.replace(/[/,: ]/g,"_")}.csv`;
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

loadHistory();
