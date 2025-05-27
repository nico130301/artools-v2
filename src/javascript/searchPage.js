

const app = document.querySelector('.categories');

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
      resolve(json);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function render(products, searchTerm) {
  app.innerHTML = '';

  const title = document.querySelector('.resultsTitle');
  title.textContent = `Search results for "${searchTerm}" (${products.length} found)`;

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-4 gap-8';

  const defaultProductImg = 'https://via.placeholder.com/100x100?text=Product';

  products.forEach(product => {
    // Get size range
    const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
    const sizeRange = sizes.length ? 
      `Sizes: ${Math.min(...sizes)} - ${Math.max(...sizes)}` : 
      'Size not available';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer';
    
    card.innerHTML = `
      <div class="p-7 flex items-center justify-center">
        <img src="${product.image || defaultProductImg}" alt="${product.name}" class="max-h-full w-auto object-contain">
      </div>
      <div class="mt-auto p-3 border-t border-gray-200">
        <div class="text-gray-500 text-[11px]">${sizeRange}</div>
        <div class="text-lg font-medium text-gray-800 truncate">${product.name}</div>
        <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
      </div>
    `;

    card.onclick = () => {
      localStorage.setItem('selectedProduct', JSON.stringify(product));
      window.location.href = './productPage.html';
    };

    grid.appendChild(card);
  });

  app.appendChild(grid);
}

// Flatten the Excel data to a list of products
function extractProducts(rows) {
  return rows.map(row => ({
    category: row.Category,
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
  }));
}

const searchTerm = getQueryParam('query')?.toLowerCase() || '';

loadExcelData().then(rows => {
  const allProducts = extractProducts(rows);
  const matchingProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm)
  );
  render(matchingProducts, searchTerm);
});
