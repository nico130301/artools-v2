fetch('/artools-v2/src/html/utils/wapp.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('.wapp').innerHTML = data;
});
