import {newproducts} from '../data/data_newProducts.js';
import {relatedProducts} from '../data/data_newProducts.js';

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
  
  let relatedProductsHTML = '';
  relatedProducts.forEach((relatedProduct) => {
  relatedProductsHTML += `
    <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" id="${relatedProduct.id}" onclick="location.href='../html/productPage.html'">
      <div class="product-image-container p-4 h-64 flex items-center justify-center">
        <img class="productImage max-h-full w-auto object-contain" src="${relatedProduct.image}">
      </div>
      <div class="mt-auto p-3 border-t border-gray-200">
        <div class="productId text-gray-500 text-[11px]">${relatedProduct.id}</div>
        <div class="productName text-lg font-medium text-gray-800 truncate">${relatedProduct.name}</div>
      </div>
    </div>
    `;
  });

  document.querySelector('.relatedProductsGrid').innerHTML = relatedProductsHTML;

  document.querySelector('.relatedProductsGrid').addEventListener('click', (event) => {
        const productElement = event.target.closest('.product');
        if (productElement) {
            const productId = productElement.getAttribute('id');
            productClicked.id = productId;
            localStorage.setItem('productClicked', JSON.stringify(productClicked));
        }
    });


})
  


