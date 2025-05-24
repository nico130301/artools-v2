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

  // Breadcrumb navigation
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'text-4xl font-bold mb-8';
  let breadcrumbHTML = `<a class="cursor-pointer hover:underline transition-all duration-200" onclick="resetToRoot()">Products</a>`;
  stack.forEach((node, index) => {
    breadcrumbHTML += ` / <a class="cursor-pointer hover:underline transition-all duration-200" onclick="goToLevel(${index})">${node.title}</a>`;
  });
  breadcrumb.innerHTML = breadcrumbHTML;
  app.appendChild(breadcrumb);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-3 gap-8';

  // Root level: show categories
  if (!stack.length) {
    for (let category in currentData) {
      const { __meta } = currentData[category];
      const categoryImage = __meta.categoryImage;
      const imageToShow = categoryImage || 'https://via.placeholder.com/100x100?text=Category';

      const card = document.createElement('div');
      card.className = 'border border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center space-y-4';
      card.innerHTML = `
        <div class="flex-1 h-full mb-4 flex justify-center items-center">
          <img src="${imageToShow}" alt="${category}" class="object-contain w-24 h-24">
        </div>
        <div class="font-bold">${category} ></div>
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
      const card = document.createElement('div');
      card.className = 'border border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center space-y-4';
      card.innerHTML = `
        <div class="flex-1 h-full mb-4 flex justify-center items-center">
          <img src="${imageToShow}" alt="${product.name}" class="object-contain w-24 h-24">
        </div>
        <div class="font-bold">${product.name}</div>
      `;

      card.onclick = () => {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        localStorage.setItem('navStack', JSON.stringify(stack));
        window.location.href = '/src/html/productPage.html';
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

  if (resumeFlag === 'true' && Array.isArray(savedNavStack) && savedNavStack.length > 0) {
    stack = savedNavStack;
    let currentNode = rootData;
    stack.forEach(node => {
      currentNode = currentNode[node.title];
    });
    localStorage.removeItem('resumeFromNavStack');
    render(currentNode, stack[stack.length - 1].title);
  } else {
    render(rootData, 'Product Categories');
  }
});
