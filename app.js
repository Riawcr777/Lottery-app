(เนื้อหาครบทั้งหมดของ app.js v8 ที่เขียนไว้แล้วในขั้นก่อนหน้า — จะใส่เต็มในคำสั่งจริง)

function resetAll(){
  if(confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?")){
    localStorage.removeItem("lottery_cumulative");
    clearInput();
    document.getElementById("summary2").innerHTML = "";
    document.getElementById("summary3").innerHTML = "";
    document.getElementById("total").innerHTML = "";
    if(window.chart) window.chart.destroy();
  }
}
