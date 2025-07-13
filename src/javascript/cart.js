document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.querySelector('.cartContainer');
  const form = document.querySelector('form');
  const termsCheckbox = document.getElementById('termsCheckbox');
  const submitButton = document.getElementById('submitButton');
  const loadingSpinner = document.getElementById('loadingSpinner');

  function updateCartTitle() {
    const cartItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update cart badge in hero section
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
      cartBadge.textContent = `${cartItems} ${cartItems === 1 ? 'item' : 'items'}`;
    }

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
          <p class="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
          <a href="./products.html" class="inline-flex items-center px-4 py-2 bg-mainblue text-white rounded-lg hover:bg-secondaryblue transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>
            Seguir Comprando
          </a>
        </div>
      `;
      return;
    }

    cart.forEach((item, index) => {
      const itemDiv = `
        <div class="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center border-b border-gray-200 last:border-b-0">
          <!-- Product Image -->
          <div class="w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
            <img class="max-w-full max-h-full object-contain p-2" src="${item.image}" alt="${item.name}">
          </div>

          <!-- Product Details -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
            <p class="text-sm text-gray-600 mt-1">Tamaño: ${item.selectedSize}${item.uom || ''}</p>
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
        updateCartTitle();
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

  function updateCartDetails() {
    const cartData = cart.map(item => 
      `${item.name} - ${item.selectedSize}${item.uom || ''} - Cantidad: ${item.quantity}`
    ).join('\n');
    
    document.querySelector('.cartDetails').value = cartData;
  }

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      // Show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';

      // Update cart details
      updateCartDetails();
      
      // Prepare form data
      const formData = new FormData(form);
      const jsonData = Object.fromEntries(formData);

      // Submit to Formspark
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      if (response.ok) {
        // Clear cart and show success message
        localStorage.removeItem('cart');
        alert('Orden enviada exitosamente');
        
        // Redirect to success page
        window.location.href = formData.get('_redirect');
      } else {
        throw new Error('Error en el envío');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la orden. Por favor, intente nuevamente.');
    } finally {
      // Reset button state
      submitButton.disabled = false;
      submitButton.textContent = 'ENVIE SOLICITUD DE ORDEN';
    }
  });

  renderCart();
});