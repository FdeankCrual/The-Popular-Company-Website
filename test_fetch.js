const url = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec?action=getWorkbook";
fetch(url).then(res => res.text()).then(text => console.log(text.substring(0, 1000))).catch(console.error);
