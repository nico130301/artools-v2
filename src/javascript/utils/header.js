fetch('../html/utils/header.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('.top').innerHTML = data;

    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (document.querySelector('.cartQuantity'))
        document.querySelector('.cartQuantity').textContent = totalQuantity;
    }

    window.updateCartCount = updateCartCount;
    updateCartCount();
    document.addEventListener('DOMContentLoaded', updateCartCount);

    const searchInput = document.getElementById('searchText');
    const searchButton = document.getElementById('searchButton');

    function handleSearch() {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `./searchPage.html?query=${encodeURIComponent(query)}`;
      }
    }    

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    
    
    window.addEventListener('scroll', () => {
      const logoImage = document.querySelector('.logoImage');
      const search = document.querySelector('.search');
      const searchText = document.querySelector('.searchText');
      const searchButton = document.querySelector('.searchButton');
      const info = document.querySelector('.info');
      const menuContainer = document.querySelector('.menuContainer');
      const headerIcons = document.querySelectorAll('.headerIcons');
      const head = document.querySelector('.headContainer');

      if (window.scrollY > 50) {
        head.classList.add('px-10');
        // When scrolled
        logoImage.classList.remove('h-10');
        logoImage.classList.add('h-6');
        logoImage.classList.add('pl-6');

        search.classList.remove('text-md');
        search.classList.add('text-xs');

        searchText.classList.remove('px-4', 'py-2');
        searchText.classList.add('px-2', 'py-1');
        
        searchButton.classList.remove('p-2');
        searchButton.classList.add('p-1');

        info.classList.remove('h-14');
        info.classList.add('h-10');

        menuContainer.classList.remove('h-14', 'text-2xl');
        menuContainer.classList.add('h-10','text-xl');

        // Make header icons smaller
        headerIcons.forEach(icon => {
          icon.classList.remove('text-3xl');
          icon.classList.add('text-2xl');
        });
      } else {
        // When at top
        head.classList.remove('px-10');
        logoImage.classList.remove('h-6');
        logoImage.classList.add('h-10');
        logoImage.classList.remove('pl-6');

        search.classList.remove('text-xs');
        search.classList.add('text-md');

        searchText.classList.remove('px-2', 'py-1');
        searchText.classList.add('px-4', 'py-2');

        searchButton.classList.remove('p-1');
        searchButton.classList.add('p-2');

        info.classList.remove('h-10');
        info.classList.add('h-14');

        menuContainer.classList.remove('h-10', 'text-xl');
        menuContainer.classList.add('h-14', 'text-2xl');

        // Restore header icons size
        headerIcons.forEach(icon => {
          icon.classList.remove('text-2xl');
          icon.classList.add('text-3xl');
        });
      }
    });
  });