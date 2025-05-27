fetch('../html/utils/wapp.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('.wapp').innerHTML = data;
});
