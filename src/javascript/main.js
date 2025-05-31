document.addEventListener('DOMContentLoaded', async function() {
  // Load Excel data first
  const response = await fetch('../data/data.xlsx');
  const blob = await response.blob();
  
  const workbook = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      resolve(workbook);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  // Parse Excel data
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const products = XLSX.utils.sheet_to_json(sheet);

  // Filter new products and recommended products
    const newProducts = products.filter(product => product['New Product'] === 'x').map(product => ({
      ...product,
      related: product.related ? 
        (typeof product.related === 'string' ? 
          product.related.split(',').map(r => r.trim()) : 
          product.related) : 
        []
    }));

    const recommendedProducts = products.filter(product => product['Recommended Product'] === 'x').map(product => ({
      ...product,
      related: product.related ? 
        (typeof product.related === 'string' ? 
          product.related.split(',').map(r => r.trim()) : 
          product.related) : 
        []
    }));
// Updated column name

  // Generate HTML for new products
  let newProductsHTML = '';
  newProducts.forEach((product) => {
    // Get size range
    const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
    const sizeRange = sizes.length ? 
      `Sizes: ${Math.min(...sizes)} - ${Math.max(...sizes)}` : 
      'Size not available';

    newProductsHTML += `
      <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px] md:min-w-0" data-category="${product.Category}" data-id="${product.id}">
        <div class="product-image-container p-7 flex items-center justify-center">
          <img class="productImage max-h-full w-auto object-contain" src="${product.image}">
        </div>
        <div class="mt-auto p-3 border-t border-gray-200">
          <div class="productSize text-gray-500 text-[11px]">${sizeRange}</div>
          <div class="productName text-lg font-medium text-gray-800 truncate">${product.name}</div>
          <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
        </div>
      </div>
    `;
  });

  // Generate HTML for recommended products
  let recommendedProductsHTML = '';
  recommendedProducts.forEach((product) => {
    // Get size range
    const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
    const sizeRange = sizes.length ? 
      `Sizes: ${Math.min(...sizes)} - ${Math.max(...sizes)}` : 
      'Size not available';

    recommendedProductsHTML += `
      <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px] md:min-w-0" data-category="${product.Category}" data-id="${product.id}">
        <div class="product-image-container p-7 flex items-center justify-center">
          <img class="productImage max-h-full w-auto object-contain" src="${product.image}">
        </div>
        <div class="mt-auto p-3 border-t border-gray-200">
          <div class="productSize text-gray-500 text-[11px]">${sizeRange}</div>
          <div class="productName text-lg font-medium text-gray-800 truncate">${product.name}</div>
          <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
        </div>
      </div>
    `;
  });

  // Update the DOM
  document.querySelector('.newProductsGrid').innerHTML = newProductsHTML;
  document.querySelector('.recommendedProductsGrid').innerHTML = recommendedProductsHTML;

  // Add click handlers
  ['newProductsGrid', 'recommendedProductsGrid'].forEach(gridClass => {
    document.querySelector('.' + gridClass).addEventListener('click', (event) => {
      const productElement = event.target.closest('.product');
      if (productElement) {
        const category = productElement.dataset.category;
        const productId = productElement.dataset.id;
        
        // Find the clicked product data
        const clickedProduct = [...newProducts, ...recommendedProducts].find(p => p.id === productId);
        
        if (clickedProduct) {
          // Store the product data and navigation stack
          localStorage.setItem('selectedProduct', JSON.stringify(clickedProduct));
          localStorage.setItem('navStack', JSON.stringify([
            { title: category, data: null }
          ]));
          
          // Navigate directly to product page
          window.location.href = '../html/productPage.html';
        }
      }
    });
  });
});


