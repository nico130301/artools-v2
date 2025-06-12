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
            item.href = './products.html';
            item.setAttribute('data-category', category);
            item.className = 'block w-full text-white px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-center';
            item.textContent = category;
            item.addEventListener('click', (e) => {
              e.preventDefault();
              localStorage.setItem('selectedCategory', category);
              window.location.href = './products.html';
            });
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
      const cartQuantityElement = document.querySelector('.cartQuantity');
      
      if (cartQuantityElement) {
        cartQuantityElement.textContent = totalQuantity;
        
        // Adjust position based on number of digits
        if (totalQuantity > 9) {
          cartQuantityElement.classList.remove('right-[32%]');
          cartQuantityElement.classList.add('right-[25%]');
        } else {
          cartQuantityElement.classList.remove('right-[25%]');
          cartQuantityElement.classList.add('right-[32%]');
        }
      }
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
      if (window.innerWidth >= 768) {
        const logoImage = document.querySelector('.logoImage');
        const headerIcons = document.querySelectorAll('.headerIcons');
        const head = document.querySelector('.headContainer');
        const menuContainer = document.querySelector('.menuContainer');
        const dropdown = document.querySelector('.dropdown-menu');
        const cartQty = document.querySelector('.cartQuantity');

        if (window.scrollY > 50) {
          // Head container changes
          head.classList.add('px-10', 'py-2');
          head.classList.remove('py-4');
          
          // Menu container changes
          menuContainer.classList.add('h-10');
          menuContainer.classList.remove('h-14');
          menuContainer.classList.add('text-xl');
          menuContainer.classList.remove('text-2xl');
          
          // Dropdown position adjustment
          dropdown.classList.remove('top-32');
          dropdown.classList.add('top-24');
          
          // Logo and icons changes
          logoImage.classList.remove('h-10');
          logoImage.classList.add('h-6');
          headerIcons.forEach(icon => {
            icon.classList.remove('text-3xl');
            icon.classList.add('text-2xl');
          });
          cartQty.classList.remove('text-[0.75rem]', 'leading-[1rem]','right-[32%]','top-[12%]');
          cartQty.classList.add('text-[0.625rem]', 'leading-[0.85rem]','right-[29%]', 'top-[15%]');
        } else {
          // Reset head container
          head.classList.remove('px-10', 'py-2');
          head.classList.add('py-4');
          
          // Reset menu container
          menuContainer.classList.remove('h-10');
          menuContainer.classList.add('h-14');
          menuContainer.classList.remove('text-xl');
          menuContainer.classList.add('text-2xl');
          
          // Reset dropdown position
          dropdown.classList.remove('top-24');
          dropdown.classList.add('top-32');
          
          // Reset logo and icons
          logoImage.classList.remove('h-6');
          logoImage.classList.add('h-10');
          headerIcons.forEach(icon => {
            icon.classList.remove('text-2xl');
            icon.classList.add('text-3xl');
          });
          cartQty.classList.remove('text-[0.625rem]', 'leading-[0.85rem]','right-[29%]', 'top-[15%]');
          cartQty.classList.add('text-[0.75rem]', 'leading-[1rem]','right-[32%]', 'top-[12%]');
        }
      }
    });
  });