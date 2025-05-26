

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
    const card = document.createElement('div');
    card.className = 'border border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center space-y-4';
    const image = product.image || defaultProductImg;

    card.innerHTML = `
      <div class="flex-1 h-full mb-4 flex justify-center items-center">
        <img src="${image}" alt="${product.name}" class="object-contain w-24 h-24">
      </div>
      <div class="font-bold">${product.name}</div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `/src/html/productPage.html?id=${product.id}`;
    });

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
    recommended: row.recommended ? row.recommended.split(',').map(r => r.trim()) : []
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
