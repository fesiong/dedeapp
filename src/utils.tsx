function padZero(str, num = 2){
  return String(str).padStart(num, "0")
}

const utils = {
  dateFormat: function(t, full = true){
    let date = new Date(t*1000)
    let dateStr = padZero(date.getMonth()+1) + "-" + padZero(date.getDate())
    if(full){
      dateStr = date.getFullYear() + "-" + dateStr
    }

    return dateStr;
  },
  dateTimeFormat: function(t, full = true){
    let date = new Date(t*1000)
    let timeStr = padZero(date.getHours()) + ":" + padZero(date.getMinutes()) + ":" + padZero(date.getSeconds())
    let dateStr = date.getFullYear() + "-" + padZero(date.getMonth()+1) + "-" + padZero(date.getDate())
    
    return dateStr + " " + timeStr
  }
}

export default utils