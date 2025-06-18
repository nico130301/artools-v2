fetch('/artools-v2/src/html/utils/wapp.html')  // Updated path
  .then(response => response.text())
  .then(data => {
    document.querySelector('.wapp').innerHTML = data;
});
