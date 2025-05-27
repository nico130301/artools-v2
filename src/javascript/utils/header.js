fetch('../html/utils/header.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('.top').innerHTML = data;

    // Add this new function to load categories
    async function loadProductCategories() {
      try {
        const response = await fetch('../data/data.xlsx');
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          
          // Get unique categories
          const categories = [...new Set(json.map(item => item.Category))];
          
          // Populate dropdown
          const dropdown = document.getElementById('productDropdown');
          categories.forEach(category => {
            const item = document.createElement('a');
            item.href = `./products.html#${encodeURIComponent(category)}`;
            item.className = 'text-white hover:underline transition-colors duration-200';
            item.textContent = category;
            dropdown.appendChild(item);
          });
        };
        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }

    // Call the function to load categories
    loadProductCategories();

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
      const dropdown = document.querySelector('.dropdown-menu');
      const cartQty = document.querySelector('.cartQuantity');

      if (window.scrollY > 50) {
        head.classList.add('px-10');

        dropdown.classList.remove('top-32');
        dropdown.classList.add('top-24');

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

        cartQty.classList.remove('text-sm');
        cartQty.classList.add('text-xs');

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

        dropdown.classList.remove('top-24');
        dropdown.classList.add('top-32');
        
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

        cartQty.classList.remove('text-xs');
        cartQty.classList.add('text-sm');

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