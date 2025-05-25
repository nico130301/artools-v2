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
        name: row.name,
        size: row.size,
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
        related: row.related ? row.related.split(',').map(r => r.trim()) : []
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

    let history = document.querySelector('.history');
    let pageContent = document.querySelector('.productPageDetails');
    let pageSpecs = document.querySelector('.productPageSpecs');
    let relatedProducts = document.querySelector('.relatedProducts');

    // Build breadcrumb
    let breadcrumbHTML = `<a class="historyStep" onclick="location.href='/src/html/products.html'">Products</a>`;

    if (navStack.length > 0) {
      navStack.forEach((node, index) => {
        breadcrumbHTML += ` > <a class="historyStep" onclick="historyBackTo(${index})">${node.title}</a>`;
      });
    } else {
      const fromSearchCategory = localStorage.getItem('selectedProductCategory');
      if (fromSearchCategory) {
        breadcrumbHTML += ` > <a class="historyStep" onclick="location.href='/src/html/products.html'">${fromSearchCategory}</a>`;
      }
    }

    breadcrumbHTML += ` > <a class="historyProduct">${product.name}</a>`;

    history.innerHTML = breadcrumbHTML;
    pageContent.innerHTML = `
      <div class="productName text-4xl font-bold text-black font-openSans my-2">${product.name}</div>
      <div class="productPageMainDetails flex flex-row">
        <div class="productImageContainer flex-1 flex justify-center items-center">
          <img class="productImage w-3/5 object-cover" src="${product.image}">
        </div>
        <div class="productInfoContainer flex-1 flex flex-col justify-between pl-8">
          <div class="productId flex justify-end text-xl text-black font-openSans my-2">
            <span id="productIdDisplay">Cod produs: ${product.id}</span>
          </div>
          <div class="productDescription text-xl font-bold text-black font-openSans">${product.description}</div>
          <div class="addToCartContainerProduct flex flex-row w-4/5 font-openSans">
            <div class="addtoCartButtonContainer flex justify-start flex-1">
              <button class="addCartButton w-full p-2 bg-transparent border border-black hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-300" data-name="${product.name}" data-image="${product.image}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    pageSpecs.innerHTML = `
      <div class="specsTitle flex bg-mainblue text-white text-3xl font-openSans w-96 my-10 px-14 py-2">Specification</div>
      <table class="specsTable w-11/12 ml-12">
        <tr class="specContainer bg-gray-200">
          <th class="specTitle text-xl font-bold text-black font-openSans p-2 text-left">${product.spec1Title}</th>
          <td class="spec text-xl text-black font-openSans p-2">${product.spec1}</td>
        </tr>
        <tr class="specContainer">
          <th class="specTitle text-xl font-bold text-black font-openSans p-2 text-left">${product.spec2Title}</th>
          <td class="spec text-xl text-black font-openSans p-2">${product.spec2}</td>
        </tr> 
        <tr class="specContainer bg-gray-200">
          <th class="specTitle text-xl font-bold text-black font-openSans p-2 text-left">${product.spec3Title}</th>
          <td class="spec text-xl text-black font-openSans p-2">${product.spec3}</td>
        </tr>
        <tr class="specContainer">
          <th class="specTitle text-xl font-bold text-black font-openSans p-2 text-left">${product.spec4Title}</th>
          <td class="spec text-xl text-black font-openSans p-2">${product.spec4}</td>
        </tr>
        <tr class="specContainer bg-gray-200">
          <th class="specTitle text-xl font-bold text-black font-openSans p-2 text-left">${product.spec5Title}</th>
          <td class="spec text-xl text-black font-openSans p-2">${product.spec5}</td>
        </tr>
      </table>
    `;

    // Related products section
    if (Array.isArray(product.related)) {
      const relatedNames = typeof product.related === 'string'
        ? product.related.split(',').map(name => name.trim()).filter(name => name)
        : product.related;

      relatedNames.forEach((relatedName) => {
        let relatedProduct = null;
        for (const category in rootData) {
          relatedProduct = rootData[category].products.find(p => p.name === relatedName);
          if (relatedProduct) break;
        }

        if (relatedProduct) {
          const imageToShow = relatedProduct.image || 'https://via.placeholder.com/100x100?text=Related';
          relatedProducts.innerHTML += `
            <div class="bg-white rounded-lg m-4 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onclick='viewRelatedProduct(${JSON.stringify(relatedProduct)})'>
              <div class="p-4 h-64 flex items-center justify-center">
                <img src="${imageToShow}" alt="${relatedProduct.name}" class="max-h-full w-auto object-contain">
              </div>
              <div class="mt-auto p-3 border-t border-gray-200">
                <div class="text-gray-500 text-[11px]">${relatedProduct.id}</div>
                <div class="text-lg font-medium text-gray-800 truncate">${relatedProduct.name}</div>
              </div>
            </div>
          `;
        }
      });
    }

    // Helper function to view related product
    window.viewRelatedProduct = function (productObj) {
      localStorage.setItem('selectedProduct', JSON.stringify(productObj));
      localStorage.setItem('navStack', JSON.stringify(navStack));
      window.location.href = '/src/htlm/productPage.html';
    }

    //size drop-down

    if (product.size) {
      const sizes = product.size.split(',').map(s => s.trim());
      const sizeDropdown = document.createElement('select');
      sizeDropdown.id = 'sizeSelector';
    
      sizes.forEach((sizeValue, index) => {
        const option = document.createElement('option');
        option.value = sizeValue; // Use actual size for value
        option.dataset.index = String(index + 1).padStart(2, '0'); // Optional: store padded index separately
        option.textContent = sizeValue;
        sizeDropdown.appendChild(option);
      });
    
      sizeDropdown.addEventListener('change', function () {
        const selectedOption = sizeDropdown.options[sizeDropdown.selectedIndex];
        const paddedIndex = selectedOption.dataset.index;
        document.getElementById('productIdDisplay').textContent = `Cod produs: ${product.id}${paddedIndex}`;
      });
      
            // Trigger the first display on load
      setTimeout(() => {
        const event = new Event('change');
        sizeDropdown.dispatchEvent(event);
      }, 0);
    
      const container = document.createElement('div');
      container.className = 'sizeSelectorContainer';
      container.innerHTML = '<label for="sizeSelector"><strong>Select Size:</strong></label>';
      container.appendChild(sizeDropdown);
    
      const infoContainer = document.querySelector('.productInfoContainer');
      infoContainer.insertBefore(container, infoContainer.querySelector('.addToCartContainerProduct'));

      const technicalSheet = document.createElement('div');
      technicalSheet.className = 'technicalSheetContainer my-8 py-4 px-6';
      technicalSheet.innerHTML = `
        <span class="text-black font-openSans text-xl">Technical sheet: </span>
        <a href="../data/catalog/${product.id}.pdf" class="text-blue-600 hover:text-blue-800 underline font-openSans text-xl">
          ${product.id}.pdf
        </a>
      `;
      
      infoContainer.insertBefore(technicalSheet, infoContainer.querySelector('.addToCartContainerProduct'));
      
    }

    // Cart button logic
    const buttons = document.querySelectorAll('.addCartButton');
    buttons.forEach(button => {
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

        console.log(cart);

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();

        button.textContent = 'Added to Cart!';
        button.disabled = true;
        button.classList.add('bg-green-500', 'text-white', 'border-none');

        setTimeout(() => {
          button.disabled = false;
          button.classList.remove('bg-green-500', 'text-white', 'border-none')
          button.textContent = 'Add to Cart';
        }, 1000);
      });
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
      location.href = '/src/html/products.html';
    };
  });
});

observer.observe(document.body, { childList: true, subtree: true });
