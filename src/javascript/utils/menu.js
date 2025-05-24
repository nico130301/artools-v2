fetch('/src/html/utils/menu.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('.menu').innerHTML = data;
});
