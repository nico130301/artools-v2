// Add this helper function at the top of your file
function formatSizeRange(product) {
  const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
  if (sizes.length === 0) return 'Tamaño indisponible';
  if (sizes.length === 1) return `Tamaño: ${sizes[0]}${product.uom || ''}`;
  return `Tamaños: ${sizes[0]}${product.uom || ''} - ${sizes[sizes.length - 1]}${product.uom || ''}`;
}

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

    if (productName) {
      data[category].products.push({
        id: row.id,
        image: row.image,
        image2: row.image2, // Add new image fields
        image3: row.image3,
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
    const rootData = loadedData;

    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    const navStack = JSON.parse(localStorage.getItem('navStack')) || [];

    if (!product) {
      console.error('No product data found in localStorage');
      return;
    }

    let history = document.querySelector('.history');
    let pageContent = document.querySelector('.productPageDetails');
    let pageSpecs = document.querySelector('.productPageSpecs');
    let relatedProducts = document.querySelector('.relatedProducts');


    // Build breadcrumb
    let breadcrumbHTML = `
      <span class="text-gray-600">
        <a href="/" class="text-mainblue hover:underline">
          <i class="fa-solid fa-house"></i>
        </a>
        <span class="mx-2">/</span>
        <a class="text-mainblue hover:underline cursor-pointer" 
          onclick="location.href='./products.html'">
          Categoría de Productos
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


    // Helper to render the product page content, with a parameter for the technical sheet section
    function renderProductPageContent(technicalSheetHTML) {
      pageContent.innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
            <!-- Left Column - Image Gallery -->
            <div class="flex flex-col space-y-4 md:space-y-8">
              <!-- Main Product Image -->
              <div class="flex items-center justify-center bg-white p-4 md:p-8 rounded-lg h-[500px]">
                <img id="mainProductImage"
                    class="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    src="${product.image}"
                    alt="${product.name}">
              </div>

              ${(() => {
                const validImages = [product.image, product.image2, product.image3]
                  .filter(img => img && img.trim() !== '' && img !== 'undefined' && img !== undefined);
              
                return validImages.length > 1 ? 
                  `<!-- Thumbnail Navigation -->
                  <div class="flex justify-center gap-4 mt-4">
                    ${validImages.map((img, index) => `
                      <div class="w-20 h-20 cursor-pointer border-2 ${index === 0 ? 'border-mainblue' : 'border-transparent'} 
                          rounded-lg overflow-hidden hover:border-secondaryblue transition-colors">
                        <img src="${img}" 
                            alt="${product.name} view ${index + 1}"
                            class="w-full h-full object-cover thumbnail-img"
                            onclick="changeMainImage('${img}', this)">
                      </div>
                    `).join('')}
                  </div>` 
                  : '';
              })()}
            </div>

            <!-- Right Column - Product Details -->
            <div class="flex flex-col space-y-4 md:space-y-8">
              <!-- Product Title - Moved from left to right column -->
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 font-openSans">
                ${product.name}${product.size ? ` ${product.size.split(';')[0]}` : ''}${product.uom ? ` ${product.uom}` : ''}
              </h1>
              
              <!-- Product ID -->
              <div class="inline-flex items-center bg-gray-100 rounded-lg px-3 md:px-4 py-2 text-gray-600">
                <span id="productIdDisplay" class="text-xs md:text-sm font-semibold">
                  Código de Producto: ${product.id}
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
                  <label class="block text-sm md:text-base text-gray-700 font-semibold mb-2">Seleccione el Tamaño:</label>
                  <select id="sizeSelector" 
                          class="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainblue focus:border-mainblue text-sm md:text-base">
                    ${product.size.split(';').map(s => `
                      <option value="${s.trim()}">${s.trim()}${product.uom ? ` ${product.uom}` : ''}</option>
                    `).join('')}
                  </select>
                </div>
              ` : ''}

              <!-- Technical Sheet -->
              ${technicalSheetHTML}

              <!-- Add to Cart Button -->
              <button class="addCartButton w-full bg-secondaryblue text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg
                          hover:bg-mainblue transition-colors duration-300 flex items-center justify-center space-x-3 text-sm md:text-base"
                      data-name="${product.name}" 
                      data-image="${product.image}">
                <span>Agregue al Cesto</span>
                <i class="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Check if the PDF exists before rendering the technical sheet section
    const pdfUrl = `../data/catalog/${product.id}.pdf`;
    fetch(pdfUrl, { method: 'HEAD' })
      .then(response => {
        let technicalSheetHTML = '';
        if (response.ok) {
          technicalSheetHTML = `
            <div class="bg-gray-50 rounded-lg p-4 md:p-6 flex items-center justify-between">
              <span class="text-sm md:text-base text-gray-700 font-semibold">Ficha Técnica:</span>
              <a href="${pdfUrl}" 
                class="inline-flex items-center text-mainblue hover:text-secondaryblue space-x-2 text-sm md:text-base" target="_blank" rel="noopener">
                <i class="fas fa-file-pdf"></i>
                <span class="underline">${product.id}.pdf</span>
              </a>
            </div>
          `;
        } else {
          technicalSheetHTML = `
            <div class="bg-gray-50 rounded-lg p-4 md:p-6 flex items-center justify-between">
              <span class="text-sm md:text-base text-gray-700 font-semibold">Ficha Técnica:</span>
              <span class="text-gray-400">No disponible</span>
            </div>
          `;
        }
        renderProductPageContent(technicalSheetHTML);
        afterProductPageContentRender();
      })
      .catch(() => {
        // On error, treat as not available
        const technicalSheetHTML = `
          <div class="bg-gray-50 rounded-lg p-4 md:p-6 flex items-center justify-between">
            <span class="text-sm md:text-base text-gray-700 font-semibold">Ficha Técnica:</span>
            <span class="text-gray-400">No disponible</span>
          </div>
        `;
        renderProductPageContent(technicalSheetHTML);
        afterProductPageContentRender();
      });

    // All logic that depends on the product page content being rendered
    function afterProductPageContentRender() {
      window.changeMainImage = function(newSrc, thumbnailElement) {
        // Update main image
        document.getElementById('mainProductImage').src = newSrc;
        
        // Update thumbnail borders
        document.querySelectorAll('.thumbnail-img').forEach(thumb => {
          thumb.parentElement.classList.remove('border-mainblue');
          thumb.parentElement.classList.add('border-transparent');
        });
        thumbnailElement.parentElement.classList.add('border-mainblue');
        thumbnailElement.parentElement.classList.remove('border-transparent');
      };

      //size drop-down
      if (product.size) {
        // Find the right column div that contains product details
        const rightColumn = document.querySelector('.grid-cols-1.lg\\:grid-cols-2 > div:last-child');
        // Get the title element
        const productTitle = document.querySelector('.text-2xl.md\\:text-3xl.font-bold');
        // The size selector is already being created in the main HTML template
        const sizeSelector = document.getElementById('sizeSelector');
        if (sizeSelector) {
          sizeSelector.addEventListener('change', function () {
            const selectedIndex = String(this.selectedIndex + 1).padStart(2, '0');
            const selectedSize = this.value;
            // Update product ID
            const productIdDisplay = document.getElementById('productIdDisplay');
            if (productIdDisplay) {
              productIdDisplay.textContent = `Código de Producto: ${product.id}${selectedIndex}`;
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
        const selectedSize = document.getElementById('sizeSelector') ? document.getElementById('sizeSelector').value : undefined;
        const uom = product.uom || ''; // Get UOM from product data

        const existingItem = cart.find(item => item.name === name && item.selectedSize === selectedSize);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ 
            name, 
            image, 
            quantity: 1, 
            selectedSize,
            uom // Add UOM to cart item
          });
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
    }

    window.changeMainImage = function(newSrc, thumbnailElement) {
      // Update main image
      document.getElementById('mainProductImage').src = newSrc;
      
      // Update thumbnail borders
      document.querySelectorAll('.thumbnail-img').forEach(thumb => {
        thumb.parentElement.classList.remove('border-mainblue');
        thumb.parentElement.classList.add('border-transparent');
      });
      thumbnailElement.parentElement.classList.add('border-mainblue');
      thumbnailElement.parentElement.classList.remove('border-transparent');
    };


    pageSpecs.innerHTML = `
      <!-- Specifications Title with same style as Related Products -->
      <div class="relative my-12">
        <div class="bg-mainblue text-white text-xl md:text-2xl font-bold py-3 md:py-4 px-4 md:px-8 w-fit
                    relative overflow-hidden group cursor-pointer
                    shadow-lg rounded-r-lg transform transition-all duration-300 hover:scale-[1.02]
                    border-l-8 border-secondaryblue">
          <div class="absolute inset-0 bg-secondaryblue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <span class="relative z-10">ESPECIFICACIONES</span>
        </div>
      </div>

      <!-- Specifications Table with updated styling -->
      <div class="overflow-x-auto mt-8">
        <table class="specsTable w-full border-collapse">
          ${[
            { title: product.spec1Title, value: product.spec1 },
            { title: product.spec2Title, value: product.spec2 },
            { title: product.spec3Title, value: product.spec3 },
            { title: product.spec4Title, value: product.spec4 },
            { title: product.spec5Title, value: product.spec5 }
          ].filter(spec => spec.title && spec.value).map((spec, index) => `
            <tr class="specContainer ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors">
              <th class="specTitle text-base md:text-lg font-semibold text-gray-800 p-4 text-left border-b border-gray-200">
                ${spec.title}
              </th>
              <td class="spec text-base md:text-lg text-gray-600 p-4 border-b border-gray-200">
                ${spec.value}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;

    // Update the related products title with the same style
    const relatedProductsTitle = document.querySelector('.relatedProductsTitle');
    relatedProductsTitle.outerHTML = `
      <div class="relative my-12">
        <div class="bg-mainblue text-white text-xl md:text-2xl font-bold py-3 md:py-4 px-4 md:px-8 w-fit
                    relative overflow-hidden group cursor-pointer
                    shadow-lg rounded-r-lg transform transition-all duration-300 hover:scale-[1.02]
                    border-l-8 border-secondaryblue">
          <div class="absolute inset-0 bg-secondaryblue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <span class="relative z-10">PRODUCTOS RELACIONADOS</span>
        </div>
      </div>
    `;

    // Update the related products section to only show clean product cards
    if (Array.isArray(product.related)) {
      const relatedNames = product.related;
      relatedProducts.innerHTML = '';

      relatedNames.forEach((relatedName) => {
        let relatedProduct = null;
        // Search for the related product in all categories
        for (const category in rootData) {
          const found = rootData[category].products.find(p => p.name === relatedName);
          if (found) {
            relatedProduct = found;
            break;
          }
        }

        if (relatedProduct) {
          const imageToShow = relatedProduct.image || '../images/placeholder.png';
          const sizeRange = formatSizeRange(relatedProduct);
          
          relatedProducts.innerHTML += `
            <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px] md:min-w-0 flex flex-col" 
                 onclick="viewrelatedProduct('${relatedProduct.name}')">
              <div class="p-7 flex items-center justify-center h-48">
                <img src="${imageToShow}" 
                     alt="${relatedProduct.name}" 
                     class="max-h-full w-auto object-contain hover:scale-105 transition-transform duration-300">
              </div>
              <div class="p-3 border-t border-gray-200 mt-auto">
                <div class="text-[11px] text-gray-500 mb-1">${sizeRange}</div>
                <h3 class="text-lg font-medium text-gray-800 truncate">
                  ${relatedProduct.name}
                </h3>
                <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">
                  Más Detalles
                </button>
              </div>
            </div>
          `;
        }
      });
    }


    // Update the viewrelatedProduct function
    window.viewrelatedProduct = function (productName) {
        // Find the product in rootData
        let foundProduct = null;
        let foundCategory = null;
        
        for (const category in rootData) {
            const product = rootData[category].products.find(p => p.name === productName);
            if (product) {
                foundProduct = product;
                foundCategory = category;
                break;
            }
        }

        if (foundProduct) {
            // Update navigation stack - only include category
            const navStack = [
                {
                    title: foundCategory,
                    name: foundCategory
                }
            ];
            
            // Store the updated navigation and product data
            localStorage.setItem('navStack', JSON.stringify(navStack));
            localStorage.setItem('selectedProductCategory', foundCategory);
            localStorage.setItem('selectedProduct', JSON.stringify({
                ...foundProduct,
                category: foundCategory
            }));
            
            window.location.href = './productPage.html';
        }
    };

    //size drop-down

    if (product.size) {
      // Find the right column div that contains product details
      const rightColumn = document.querySelector('.grid-cols-1.lg\\:grid-cols-2 > div:last-child');
      
      // Get the title element
      const productTitle = document.querySelector('.text-2xl.md\\:text-3xl.font-bold');
      
      // The size selector is already being created in the main HTML template
      const sizeSelector = document.getElementById('sizeSelector');
      
      if (sizeSelector) {
        sizeSelector.addEventListener('change', function () {
          const selectedIndex = String(this.selectedIndex + 1).padStart(2, '0');
          const selectedSize = this.value;
          
          // Update product ID
          const productIdDisplay = document.getElementById('productIdDisplay');
          if (productIdDisplay) {
            productIdDisplay.textContent = `Código de Producto: ${product.id}${selectedIndex}`;
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
      const uom = product.uom || ''; // Get UOM from product data

      const existingItem = cart.find(item => item.name === name && item.selectedSize === selectedSize);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ 
          name, 
          image, 
          quantity: 1, 
          selectedSize,
          uom // Add UOM to cart item
        });
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
