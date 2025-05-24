document.querySelectorAll('.countryButton').forEach(button => {
  button.addEventListener('click', () => {
    const cities = button.nextElementSibling;
    cities.classList.toggle('hidden');
  });
});


document.querySelectorAll('.cityButton').forEach(button => {
  button.addEventListener('click', () => {
    const distributors = button.nextElementSibling;
    distributors.classList.toggle('hidden');
  });
});