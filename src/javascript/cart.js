document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.querySelector('.cartContainer');
  const form = document.querySelector(".form");

  function updateCartTitle() {
    const cartTitleElement = document.querySelector('.cartTitle');
    cartTitleElement.innerHTML = `Cart (${cart.length} ${cart.length === 1 ? 'item' : 'items'})`;
  }

  function renderCart() {
    container.innerHTML = '';
    updateCartTitle();
    if (cart.length === 0) {
      container.innerHTML = '<div class="text-center">Your cart is empty.</div>';
    } else {
      cart.forEach((item,index) => {
        let itemDiv = ``;
        itemDiv= `
        <div class="flex flex-row items-start gap-6 m-4 p-6 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all bg-white">
          <!-- Column 1: Image -->
          <div class="w-24">
            <img class="h-24 w-24 object-cover rounded-md" src="${item.image}" />
          </div>

          <!-- Column 2: Product Details -->
          <div class="flex-1 flex flex-col gap-4">
            <!-- Row 1: Name -->
            <div class="text-xl font-semibold text-gray-800">
              ${item.name}
            </div>
            
            <!-- Row 2: Size and Quantity Controls -->
            <div class="flex flex-row items-center gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-600 mr-2">Size:</span>
                <span class="text-sm inline-block px-1 py-1  ">
                  ${item.selectedSize}
                </span>
              </div>

              <div class="flex flex-row items-center p-2 border border-gray-300 rounded-lg h-10 bg-white">
                <div class="text-gray-400 flex justify-center items-center cursor-pointer w-8 text-2xl font-bold font-openSans hover:text-black hover:bg-gray-50 removeQuantity" data-index=${index}>
                  &ndash;
                </div>
                <div class="text-sm text-black flex justify-center items-center font-openSans font-bold itemQuantity w-8 border-x border-gray-200">
                  ${item.quantity}
                </div>
                <div class="text-gray-400 flex justify-center items-center cursor-pointer w-8 text-2xl font-bold font-openSans hover:text-black hover:bg-gray-50 addQuantity" data-index=${index}>
                  +
                </div>
              </div>
            </div>
          </div>

          <!-- Column 3: Delete Button -->
          <div class="deleteItem">
            <button class="bg-white w-10 h-10 border border-gray-200 text-gray-400 text-xl font-bold cursor-pointer rounded-full flex justify-center items-center font-openSans hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors deleteButton">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
          `;
        container.innerHTML += itemDiv;
      });
    }

    function collectCartInfoForForm() {

      let cartData = "";

      cart.forEach(item => {
        cartData += `${item.name} - Quantity: ${item.quantity}\n`;
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