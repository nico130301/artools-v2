let rootData = {};
let stack = [];
const app = document.querySelector('.categories');

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

// Rendering
function render(currentData, title = 'Product Categories') {
  app.innerHTML = '';

  // Update the page title while preserving the HTML structure
  const pageTitle = document.querySelector('.pageTitle span');
  if (pageTitle) {
    pageTitle.textContent = title;
  } else {
    // If the span doesn't exist, recreate the entire title structure
    const pageTitleDiv = document.querySelector('.pageTitle');
    if (pageTitleDiv) {
      pageTitleDiv.innerHTML = `
        <div class="absolute inset-0 bg-secondaryblue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
        <span class="relative z-10">${title}</span>
      `;
    }
  }
  

  // Breadcrumb navigation
  const breadcrumb = document.querySelector('.breadcrumbs');
  let breadcrumbHTML = `
    <span class="text-gray-600">
      <a href="./main.html" class="text-mainblue hover:underline"><i class="fa-solid fa-house"></i></a>
      <span class="mx-2">/</span>
      <a class="text-mainblue hover:underline cursor-pointer" onclick="resetToRoot()">Categoría de Productos</a>
    </span>
  `;
  
  stack.forEach((node, index) => {
    breadcrumbHTML += `
      <span class="text-gray-600">
        <span class="mx-2">/</span>
        <a class="text-mainblue hover:underline cursor-pointer" onclick="goToLevel(${index})">${node.title}</a>
      </span>
    `;
  });
  
  breadcrumb.innerHTML = breadcrumbHTML;

  // Create responsive grid for products/categories
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6';



  // Root level: show categories
  if (!stack.length) {
    for (let category in currentData) {
      const { __meta } = currentData[category];
      const categoryImage = __meta.categoryImage;
      const imageToShow = categoryImage || 'https://via.placeholder.com/100x100?text=Category';

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer';
      card.innerHTML = `
        <div class="p-2 md:p-4 flex items-center justify-center h-28 md:h-60">
          <img src="${imageToShow}" alt="${category}" class="max-h-full w-auto object-contain">
        </div>
        <div class="p-2 md:p-3 border-t border-gray-200">
          <div class="text-sm md:text-base font-medium text-gray-800 truncate text-center">${category}</div>
        </div>
      `;

      card.onclick = () => {
        stack.push({ data: currentData[category], title: category });
        render(currentData[category], category);
      };
      grid.appendChild(card);
    }
  } else {
    // Inside a category → show products
    const { products } = currentData;
    products.forEach(product => {
      const imageToShow = product.image || 'https://via.placeholder.com/100x100?text=Product';
      
      // Updated size range calculation
      const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
      let sizeRange = 'Tamaño indisponible';

      if (sizes.length > 0) {
        if (sizes.length === 1) {
          // If there's only one size, show it with the unit
          sizeRange = `Tamaño: ${sizes[0]}${product.uom || ''}`;
        } else {
          // If there are multiple sizes, show the range with the unit
          const firstSize = sizes[0];
          const lastSize = sizes[sizes.length - 1];
          sizeRange = `Tamaños: ${firstSize}${product.uom || ''} - ${lastSize}${product.uom || ''}`;
        }
      }

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer';
      card.innerHTML = `
        <div class="p-2 md:p-4 flex items-center justify-center h-28 md:h-60">
          <img src="${imageToShow}" alt="${product.name}" class="max-h-full w-auto object-contain">
        </div>
        <div class="p-2 md:p-3 border-t border-gray-200">
          <div class="text-xs md:text-sm text-gray-500">${sizeRange}</div>
          <div class="text-sm md:text-base font-medium text-gray-800 truncate">${product.name}</div>
          <button class="w-full mt-2 py-1 md:py-2 px-2 md:px-4 bg-secondaryblue text-white text-xs md:text-sm rounded 
                      hover:bg-mainblue transition-colors duration-300">
            Más Detalles
          </button>
        </div>
      `;

      card.onclick = () => {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        localStorage.setItem('navStack', JSON.stringify(stack));
        window.location.href = './productPage.html';
      };
      grid.appendChild(card);
    });
  }

  app.appendChild(grid);
}

// Breadcrumb functions
window.goToLevel = function (index) {
  stack = stack.slice(0, index + 1);
  const { data, title } = stack[index];
  render(data, title);
};

window.resetToRoot = function () {
  stack = [];
  render(rootData, 'Categoría de Productos');
};

// INITIAL LOAD
loadExcelData().then(loadedData => {
  rootData = loadedData;

  const savedNavStack = JSON.parse(localStorage.getItem('navStack'));
  const resumeFlag = localStorage.getItem('resumeFromNavStack');
  const selectedCategory = localStorage.getItem('selectedCategory');

  if (resumeFlag === 'true' && Array.isArray(savedNavStack) && savedNavStack.length > 0) {
    stack = savedNavStack;
    let currentNode = rootData;
    stack.forEach(node => {
      currentNode = currentNode[node.title];
    });
    localStorage.removeItem('resumeFromNavStack');
    render(currentNode, stack[stack.length - 1].title);
  } else if (selectedCategory && rootData[selectedCategory]) {
    // Navigate directly to selected category
    stack.push({ data: rootData[selectedCategory], title: selectedCategory });
    render(rootData[selectedCategory], selectedCategory);
    localStorage.removeItem('selectedCategory');
  } else {
    render(rootData, 'Categoría de Productos');
  }
});
