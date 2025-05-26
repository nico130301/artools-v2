import {newproducts} from '/src/data/data_newProducts.js';
import {recommendedProducts} from '/src/data/data_newProducts.js';

document.addEventListener('DOMContentLoaded', function() {

  let newproductsHTML = '';

  newproducts.forEach((newproduct) => {
    newproductsHTML += `
      <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" id="${newproduct.id}" onclick="location.href='../html/productPage.html'">
      <div class="product-image-container p-4 h-64 flex items-center justify-center">
        <img class="productImage max-h-full w-auto object-contain" src="${newproduct.image}">
      </div>
      <div class="mt-auto p-3 border-t border-gray-200">
        <div class="productId text-gray-500 text-[11px]">${newproduct.id}</div>
        <div class="productName text-lg font-medium text-gray-800 truncate">${newproduct.name}</div>
      </div>
    </div>
    `;
  });

  document.querySelector('.newProductsGrid').innerHTML = newproductsHTML;

  document.querySelector('.newProductsGrid').addEventListener('click', (event) => {
        const productElement = event.target.closest('.product');
        if (productElement) {
            const productId = productElement.getAttribute('id');
            productClicked.id = productId;
            localStorage.setItem('productClicked', JSON.stringify(productClicked));
        }
    });
  
  let recommendedProductsHTML = '';
  recommendedProducts.forEach((recommendedProduct) => {
  recommendedProductsHTML += `
    <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" id="${recommendedProduct.id}" onclick="location.href='../html/productPage.html'">
      <div class="product-image-container p-4 h-64 flex items-center justify-center">
        <img class="productImage max-h-full w-auto object-contain" src="${recommendedProduct.image}">
      </div>
      <div class="mt-auto p-3 border-t border-gray-200">
        <div class="productId text-gray-500 text-[11px]">${recommendedProduct.id}</div>
        <div class="productName text-lg font-medium text-gray-800 truncate">${recommendedProduct.name}</div>
      </div>
    </div>
    `;
  });

  document.querySelector('.recommendedProductsGrid').innerHTML = recommendedProductsHTML;

  document.querySelector('.recommendedProductsGrid').addEventListener('click', (event) => {
        const productElement = event.target.closest('.product');
        if (productElement) {
            const productId = productElement.getAttribute('id');
            productClicked.id = productId;
            localStorage.setItem('productClicked', JSON.stringify(productClicked));
        }
    });


})
  


