document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.querySelector('.cartContainer');
  const form = document.querySelector('form');
  const termsCheckbox = document.getElementById('termsCheckbox');

  function updateCartTitle() {
    const cartItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update page title with product count
    const pageTitle = document.querySelector('h1');
    if (pageTitle) {
      pageTitle.textContent = `Su Carrito (${cartItems} ${cartItems === 1 ? 'producto' : 'productos'})`;
    }

    // Update global cart count
    if (typeof window.updateCartCount === 'function') {
      window.updateCartCount();
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(price);
  }

  function renderCart() {
    container.innerHTML = '';
    updateCartTitle();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-8 text-center">
          <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <a href="./products.html" class="inline-flex items-center px-4 py-2 bg-mainblue text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>
            Continue Shopping
          </a>
        </div>
      `;
      return;
    }

    cart.forEach((item, index) => {
      const itemDiv = `
        <div class="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center border-b border-gray-200 last:border-b-0">
          <!-- Product Image -->
          <div class="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            <img class="w-full h-full object-cover" src="${item.image}" alt="${item.name}">
          </div>

          <!-- Product Details -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
            <p class="text-sm text-gray-600 mt-1">Size: ${item.selectedSize}${item.uom || ''}</p>
            ${item.price ? `<p class="text-sm font-medium text-gray-900 mt-1">${formatPrice(item.price)}</p>` : ''}
          </div>

          <!-- Quantity Controls -->
          <div class="flex items-center gap-3">
            <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button class="removeQuantity w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors" data-index="${index}">
                <i class="fas fa-minus text-xs"></i>
              </button>
              <span class="w-12 h-8 flex items-center justify-center border-x border-gray-200 font-medium text-gray-900">
                ${item.quantity}
              </span>
              <button class="addQuantity w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors" data-index="${index}">
                <i class="fas fa-plus text-xs"></i>
              </button>
            </div>

            <!-- Delete Button -->
            <button class="deleteItem w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors" data-index="${index}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
      container.innerHTML += itemDiv;
    });

    // Add event listeners after rendering
    attachEventListeners();
  }

  function attachEventListeners() {
    // Delete item handlers
    document.querySelectorAll('.deleteItem').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = e.currentTarget.dataset.index;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartTitle(); // Add this line
      });
    });

    // Quantity handlers
    document.querySelectorAll('.addQuantity').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = e.currentTarget.dataset.index;
        cart[index].quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartTitle(); 
      });
    });

    document.querySelectorAll('.removeQuantity').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = e.currentTarget.dataset.index;
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
        } else {
          cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartTitle(); 
      });
    });
  }

  function collectCartInfoForForm() {
    const cartData = cart.map(item => 
      `Product: ${item.name}\nSize: ${item.selectedSize}${item.uom || ''}\nQuantity: ${item.quantity}\n${'-'.repeat(40)}`
    ).join('\n');
    
    document.querySelector('.cartDetails').value = cartData;
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
    if (!termsCheckbox.checked) {
      e.preventDefault();
      alert('Please accept the terms and conditions before submitting the request.');
      return;
    }
    collectCartInfoForForm();
  });

  renderCart();
});