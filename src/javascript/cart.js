document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.querySelector('.cartContainer');
  const form = document.querySelector(".form");
  const termsCheckbox = document.getElementById("termsCheckbox");

  form.addEventListener("submit", function (e) {
    if (!termsCheckbox.checked) {
      e.preventDefault();
      alert("Please accept the terms and conditions before submitting the request.");
      return;
    }
    collectCartInfoForForm();
  });

  function updateCartTitle() {
    const cartTitleElement = document.querySelector('.cartTitle');
    cartTitleElement.innerHTML = `Cart (${cart.length} ${cart.length === 1 ? 'item' : 'items'})`;
  }

  function renderCart() {
    container.innerHTML = '';
    updateCartTitle();
    if (cart.length === 0) {
      container.innerHTML = '<div class="text-center p-4">Your cart is empty.</div>';
    } else {
      cart.forEach((item,index) => {
      // Replace the cart item display template in renderCart:
      let itemDiv = `
      <div class="flex flex-row items-center gap-4 m-4 p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all bg-white">
        <!-- Column 1: Image -->
        <div class="w-24 h-24 flex-shrink-0">
          <img class="w-full h-full object-cover rounded-md" src="${item.image}" alt="${item.name}" />
        </div>

        <!-- Column 2: Product Details -->
        <div class="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
          <div class="flex flex-col gap-1">
            <div class="text-lg font-semibold text-gray-800">
              ${item.name}
            </div>
            <div class="text-sm text-gray-600">
              Size: ${item.selectedSize}${item.uom || ''}
            </div>
          </div>

          <!-- Quantity Controls -->
          <div class="flex items-center gap-4">
            <div class="flex items-center p-1 border border-gray-300 rounded-lg h-8 bg-white">
              <div class="text-gray-400 flex justify-center items-center cursor-pointer w-8 text-xl font-bold hover:text-black hover:bg-gray-50 removeQuantity" data-index=${index}>
                &ndash;
              </div>
              <div class="text-sm text-black flex justify-center items-center font-bold w-8 border-x border-gray-200">
                ${item.quantity}
              </div>
              <div class="text-gray-400 flex justify-center items-center cursor-pointer w-8 text-xl font-bold hover:text-black hover:bg-gray-50 addQuantity" data-index=${index}>
                +
              </div>
            </div>

            <!-- Delete Button -->
            <button class="deleteItem bg-white w-8 h-8 border border-gray-200 text-gray-400 text-lg font-bold cursor-pointer rounded-full flex justify-center items-center hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors" data-index=${index}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      `;
        container.innerHTML += itemDiv;
      });
    }

    function collectCartInfoForForm() {
      let cartData = "";
      cart.forEach(item => {
        cartData += `${item.name} - Size: ${item.selectedSize}${item.uom || ''} - Quantity: ${item.quantity}\n`;
      });
      document.querySelector(".cartDetails").value = cartData;
    }

    form.addEventListener("submit", function (e) {
      collectCartInfoForForm();
    });


    document.querySelectorAll('.deleteItem').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.dataset.index;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      });
    });

    document.querySelectorAll('.addQuantity').forEach(add => {
      add.addEventListener('click', (event) => {
        const index = event.target.dataset.index;
        cart[index].quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      });
    });

    document.querySelectorAll('.removeQuantity').forEach(remove => {
      remove.addEventListener('click', () => {
        const index = event.target.dataset.index;
        if (cart[index].quantity > 1) 
          cart[index].quantity--; 
        else
          cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      });
    });

    if (window.updateCartCount) {
      window.updateCartCount();
    }
  } 
  
  renderCart();
  
});