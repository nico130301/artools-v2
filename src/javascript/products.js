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

// Rendering
function render(currentData, title = 'Product Categories') {
  app.innerHTML = '';

  // Update the page title
  const pageTitle = document.querySelector('.pageTitle');
  pageTitle.textContent = title;

  // Breadcrumb navigation
  const breadcrumb = document.querySelector('.breadcrumbs');
  let breadcrumbHTML = `
    <span class="text-gray-600">
      <a href="./main.html" class="text-mainblue hover:underline"><i class="fa-solid fa-house"></i></a>
      <span class="mx-2">/</span>
      <a class="text-mainblue hover:underline cursor-pointer" onclick="resetToRoot()">Products categories</a>
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

  // Create grid for products/categories
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-4 gap-8';

  // Root level: show categories
    if (!stack.length) {
    for (let category in currentData) {
      const { __meta } = currentData[category];
      const categoryImage = __meta.categoryImage;
      const imageToShow = categoryImage || 'https://via.placeholder.com/100x100?text=Category';

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer';
      card.innerHTML = `
        <div class="p-7 flex items-center justify-center">
          <img src="${imageToShow}" alt="${category}" class="max-h-full w-auto object-contain">
        </div>
        <div class="mt-auto p-3 border-t border-gray-200">
          <div class="text-lg font-medium text-gray-800 truncate">${category}</div>
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
      
      // Get size range
      const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
      const sizeRange = sizes.length ? 
        `Sizes: ${Math.min(...sizes)} - ${Math.max(...sizes)}` : 
        'Size not available';

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer';
      card.innerHTML = `
        <div class="p-7 flex items-center justify-center">
          <img src="${imageToShow}" alt="${product.name}" class="max-h-full w-auto object-contain">
        </div>
        <div class="mt-auto p-3 border-t border-gray-200">
          <div class="text-gray-500 text-[11px]">${sizeRange}</div>
          <div class="text-lg font-medium text-gray-800 truncate">${product.name}</div>
          <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
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
  render(rootData, 'Product Categories');
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
    render(rootData, 'Product Categories');
  }
});
