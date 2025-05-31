// Load Excel and parse data
async function loadExcelData() {
  const response = await fetch('../data/data.xlsx');
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      const structuredData = buildDataStructure(json);
      resolve(structuredData);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}


// Build data: just Categories -> Products
function buildDataStructure(rows) {
  const data = {};

  rows.forEach(row => {
    const category = row.Category;
    const categoryImage = row['Category Image'];
    const productName = row.name;

    if (!data[category]) {
      data[category] = { __meta: { categoryImage }, products: [] };
    }

    console.log('Excel row data:', row);

    if (productName) {
      data[category].products.push({
        id: row.id,
        image: row.image,
        name: row.name,
        size: row.size,
        uom: row.unit,
        description: row.description,
        spec1Title: row.spec1Title,
        spec1: row.spec1,
        spec2Title: row.spec2Title,
        spec2: row.spec2,
        spec3Title: row.spec3Title,
        spec3: row.spec3,
        spec4Title: row.spec4Title,
        spec4: row.spec4,
        spec5Title: row.spec5Title,
        spec5: row.spec5,
        related: row.related ? row.related.split(';').map(r => r.trim()) : []
      });
    }
  });

  return data;
}

// Main observer logic
const observer = new MutationObserver(() => {
  observer.disconnect();

  loadExcelData().then(loadedData => {
    const rootData = loadedData;  // <-- now rootData is available

    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    const navStack = JSON.parse(localStorage.getItem('navStack')) || [];

    if (!product) {
      console.error('No product data found in localStorage');
      return;
    }
    console.log(product);
    let history = document.querySelector('.history');
    let pageContent = document.querySelector('.productPageDetails');
    let pageSpecs = document.querySelector('.productPageSpecs');
    let relatedProducts = document.querySelector('.relatedProducts');

    // Build breadcrumb
    let breadcrumbHTML = `
      <span class="text-gray-600">
        <a href="./main.html" class="text-mainblue hover:underline">
          <i class="fa-solid fa-house"></i>
        </a>
        <span class="mx-2">/</span>
        <a class="text-mainblue hover:underline cursor-pointer" 
          onclick="location.href='./products.html'">
          Products
        </a>
      </span>`;

    if (navStack.length > 0) {
      navStack.forEach((node, index) => {
        breadcrumbHTML += `
          <span class="text-gray-600">
            <span class="mx-2">/</span>
            <a class="text-mainblue hover:underline cursor-pointer" 
              onclick="historyBackTo(${index})">
              ${node.title}
            </a>
          </span>`;
      });
    } else {
      const fromSearchCategory = localStorage.getItem('selectedProductCategory');
      if (fromSearchCategory) {
        breadcrumbHTML += `
          <span class="text-gray-600">
            <span class="mx-2">/</span>
            <a class="text-mainblue hover:underline cursor-pointer" 
              onclick="location.href='./products.html'">
              ${fromSearchCategory}
            </a>
          </span>`;
      }
    }

    breadcrumbHTML += `
      <span class="text-gray-600">
        <span class="mx-2">/</span>
        <span class="text-gray-600">
          ${product.name}
        </span>
      </span>`;

    history.innerHTML = breadcrumbHTML;

    pageContent.innerHTML = `
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <!-- Left Column - Title and Image -->
          <div class="flex flex-col space-y-4 md:space-y-8">
            <!-- Product Title -->
              <h1 class="text-2xl md:text-4xl font-bold text-gray-900 font-openSans">
                ${product.name}${product.size ? ` ${product.size.split(';')[0]}` : ''}${product.uom ? ` ${product.uom}` : ''}
              </h1>
            
            <!-- Product Image -->
            <div class="flex items-center justify-center bg-white p-4 md:p-8 rounded-lg">
              <img class="w-full max-w-lg object-contain hover:scale-105 transition-transform duration-300" 
                  src="${product.image}" 
                  alt="${product.name}">
            </div>
          </div>

          <!-- Right Column - Product Details -->
          <div class="flex flex-col space-y-4 md:space-y-8">
            <!-- Product ID -->
            <div class="inline-flex items-center bg-gray-100 rounded-lg px-3 md:px-4 py-2 text-gray-600">
              <span id="productIdDisplay" class="text-xs md:text-sm font-semibold">
                Cod produs: ${product.id}
              </span>
            </div>

            <!-- Product Description -->
            <div class="bg-gray-50 rounded-lg p-4 md:p-6">
              <ul class="space-y-3 md:space-y-4">
                ${product.description.split('\n').map(line => 
                  `<li class="flex items-start">
                    <span class="text-mainblue mr-2">•</span>
                    <span class="text-sm md:text-base text-gray-700">${line}</span>
                  </li>`
                ).join('')}
              </ul>
            </div>

            <!-- Size Selector if available -->
            ${product.size ? `
              <div class="bg-gray-50 rounded-lg p-4 md:p-6">
                <label class="block text-sm md:text-base text-gray-700 font-semibold mb-2">Select Size:</label>
                <select id="sizeSelector" 
                        class="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainblue focus:border-mainblue text-sm md:text-base">
                  ${product.size.split(';').map(s => `
                    <option value="${s.trim()}">${s.trim()}${product.uom ? ` ${product.uom}` : ''}</option>
                  `).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Technical Sheet -->
            <div class="bg-gray-50 rounded-lg p-4 md:p-6 flex items-center justify-between">
              <span class="text-sm md:text-base text-gray-700 font-semibold">Technical sheet:</span>
              <a href="../data/catalog/${product.id}.pdf" 
                class="inline-flex items-center text-mainblue hover:text-secondaryblue space-x-2 text-sm md:text-base">
                <i class="fas fa-file-pdf"></i>
                <span class="underline">${product.id}.pdf</span>
              </a>
            </div>

            <!-- Add to Cart Button -->
            <button class="addCartButton w-full bg-secondaryblue text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg
                        hover:bg-mainblue transition-colors duration-300 flex items-center justify-center space-x-3 text-sm md:text-base"
                    data-name="${product.name}" 
                    data-image="${product.image}">
              <span>Add to cart</span>
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        </div>
      </div>
    `;


    pageSpecs.innerHTML = `
      <div class="specsTitle bg-mainblue text-white text-2xl md:text-3xl font-openSans w-full md:w-96 my-6 md:my-10 py-2 px-4 md:px-14"> Specification </div>

      <div class="overflow-x-auto">
        <table class="specsTable w-full md:w-11/12 md:ml-12">
          <tr class="specContainer bg-gray-200">
            <th class="specTitle text-base md:text-xl font-bold text-black font-openSans p-2 text-left">${product.spec1Title}</th>
            <td class="spec text-base md:text-xl text-black font-openSans p-2">${product.spec1}</td>
          </tr>
          <tr class="specContainer ">
            <th class="specTitle text-base md:text-xl font-bold text-black font-openSans p-2 text-left">${product.spec2Title}</th>
            <td class="spec text-base md:text-xl text-black font-openSans p-2">${product.spec2}</td>
          </tr>
          <tr class="specContainer bg-gray-200">
            <th class="specTitle text-base md:text-xl font-bold text-black font-openSans p-2 text-left">${product.spec3Title}</th>
            <td class="spec text-base md:text-xl text-black font-openSans p-2">${product.spec3}</td>
          </tr>
          <tr class="specContainer ">
            <th class="specTitle text-base md:text-xl font-bold text-black font-openSans p-2 text-left">${product.spec4Title}</th>
            <td class="spec text-base md:text-xl text-black font-openSans p-2">${product.spec4}</td>
          </tr>
          <tr class="specContainer bg-gray-200">
            <th class="specTitle text-base md:text-xl font-bold text-black font-openSans p-2 text-left">${product.spec5Title}</th>
            <td class="spec text-base md:text-xl text-black font-openSans p-2">${product.spec5}</td>
          </tr>
          
        </table>
      </div>
    `;

    // related products section
    if (Array.isArray(product.related)) {
      const relatedNames = typeof product.related === 'string'
        ? product.related.split(';').map(name => name.trim()).filter(name => name)
        : product.related;

      relatedNames.forEach((relatedName) => {
        let relatedProduct = null;
        for (const category in rootData) {
          relatedProduct = rootData[category].products.find(p => p.name === relatedName);
          if (relatedProduct) break;
        }

        if (relatedProduct) {
          const imageToShow = relatedProduct.image || 'https://via.placeholder.com/100x100?text=related';
          // Get size range for related product
          const sizes = relatedProduct.size ? relatedProduct.size.split(';').map(s => s.trim()) : [];
          const sizeRange = sizes.length ? 
            `Sizes: ${Math.min(...sizes)} - ${Math.max(...sizes)}` : 
            'Size not available';

          relatedProducts.innerHTML += `
            <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px] md:min-w-0" onclick='viewrelatedProduct(${JSON.stringify(relatedProduct)})'>
              <div class="p-7 flex items-center justify-center">
                <img src="${imageToShow}" alt="${relatedProduct.name}" class="max-h-full w-auto object-contain">
              </div>
              <div class="mt-auto p-3 border-t border-gray-200">
                <div class="text-gray-500 text-[11px]">${sizeRange}</div>
                <div class="text-lg font-medium text-gray-800 truncate">${relatedProduct.name}</div>
                <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
              </div>
            </div>
          `;
        }
      });
    }

    // Helper function to view related product
    window.viewrelatedProduct = function (productObj) {
      localStorage.setItem('selectedProduct', JSON.stringify(productObj));
      localStorage.setItem('navStack', JSON.stringify(navStack));
      window.location.href = './productPage.html';
    }

    //size drop-down

    if (product.size) {
      // Find the right column div that contains product details
      const rightColumn = document.querySelector('.grid-cols-1.lg\\:grid-cols-2 > div:last-child');
      
      // Get the title element
      const productTitle = document.querySelector('.text-2xl.md\\:text-4xl.font-bold');
      
      // The size selector is already being created in the main HTML template
      const sizeSelector = document.getElementById('sizeSelector');
      
      if (sizeSelector) {
        sizeSelector.addEventListener('change', function () {
          const selectedIndex = String(this.selectedIndex + 1).padStart(2, '0');
          const selectedSize = this.value;
          
          // Update product ID
          const productIdDisplay = document.getElementById('productIdDisplay');
          if (productIdDisplay) {
            productIdDisplay.textContent = `Cod produs: ${product.id}${selectedIndex}`;
          }

          // Update product title with size and UOM
          if (productTitle) {
            const uomText = product.uom ? ` ${product.uom}` : '';
            productTitle.textContent = `${product.name} ${selectedSize}${uomText}`;
          }
        });
        
        // Trigger initial update immediately after setting up the listener
        const event = new Event('change');
        sizeSelector.dispatchEvent(event);
      }
    }

    // Cart button logic
    const button = document.querySelector('.addCartButton');
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      let cart = JSON.parse(localStorage.getItem('cart')) || [];

      const name = button.dataset.name;
      const image = button.dataset.image;
      const selectedSize = document.getElementById('sizeSelector').value;

      const existingItem = cart.find(item => item.name === name && item.selectedSize === selectedSize);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, image, quantity: 1, selectedSize});
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();

      // Store original content
      const originalContent = button.innerHTML;
      
      // Update button appearance
      button.innerHTML = '<span>Added to Cart!</span><i class="fas fa-check ml-2"></i>';
      button.disabled = true;
      button.classList.remove('bg-secondaryblue', 'hover:bg-mainblue');
      button.classList.add('bg-green-500');

      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalContent;
        button.classList.remove('bg-green-500');
        button.classList.add('bg-secondaryblue', 'hover:bg-mainblue');
      }, 1000);
    });

    

    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
      const cartQuantity = document.querySelector('.cartQuantity');
      if (cartQuantity) {
        cartQuantity.textContent = totalQuantity;
      }
    }

    // Helper to go back to category from breadcrumb
    window.historyBackTo = function (index) {
      const navStack = JSON.parse(localStorage.getItem('navStack')) || [];
      const newStack = navStack.slice(0, index + 1);
      localStorage.setItem('navStack', JSON.stringify(newStack));
      localStorage.setItem('resumeFromNavStack', 'true');
      location.href = './products.html';
    };
  });
});

observer.observe(document.body, { childList: true, subtree: true });
