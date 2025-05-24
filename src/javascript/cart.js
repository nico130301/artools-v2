document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.querySelector('.cartContainer');
  const form = document.querySelector(".form");

  function renderCart() {
    container.innerHTML = '';
    if (cart.length === 0) {
      container.innerHTML = '<div class="text-center">Your cart is empty.</div>';
    } else {
      cart.forEach((item,index) => {
        let itemDiv = ``;
        itemDiv= `
          <div class="flex flex-1 flex-row justify-center items-center m-5 p-2 border border-gray-300">
            <div class="flex-1 h-full p-10">
              <img class="h-20" src="${item.image}" />
            </div>

            <div class="flex-1 text-xl font-semibold text-gray-800"> ${item.name}</div>
            <div class="itemSize"> ${item.selectedSize}</div>
            <div class="flex flex-1 flex-row justify-center items-center p-2 border-2 border-gray-400 h-8">
              <div class="flex-1 text-gray-400 flex justify-center items-center cursor-pointer text-4xl font-bold font-openSans hover:text-black removeQuantity pb-2" data-index=${index}>&ndash;</div>
              <div class="flex-1 text-sm text-black flex justify-center items-center font-openSans font-bold itemQuantity">${item.quantity}</div>
              <div class="flex-1 text-gray-400 flex justify-center items-center cursor-pointer text-4xl font-bold font-openSans hover:text-black addQuantity" data-index=${index}>+</div>
            </div>
            <div class="flex flex-1 items-center justify-center deleteItem">
              <button class="bg-white border-none text-gray-300 text-2xl font-bold m-0.5 cursor-pointer rounded-full flex justify-center items-center font-openSans hover:text-red-600 deleteButton">x</button>
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