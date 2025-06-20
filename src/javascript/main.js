document.addEventListener('DOMContentLoaded', async function() {

   // Slideshow Controller
  
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("hidden", i !== index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("bg-blue-500", i === index);
      dot.classList.toggle("bg-gray-300", i !== index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  document.getElementById("next").addEventListener("click", nextSlide);
  document.getElementById("prev").addEventListener("click", prevSlide);
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      currentSlide = i;
      showSlide(currentSlide);
    });
  });

  showSlide(currentSlide);

  
  // Configuration
  const CONFIG = {
    autoplayDelay: 4000,
    transitionDuration: 500,
    touchThreshold: 50,
    productImageHeight: 200
  };

  // Data Management
  class ProductManager {
    constructor(products) {
      this.products = products;
      this.newProducts = this.filterProducts('New Product');
      this.recommendedProducts = this.filterProducts('Recommended Product');
    }

    filterProducts(filterType) {
      return this.products
        .filter(product => product[filterType] === 'x')
        .map(product => ({
          ...product,
          related: this.parseRelated(product.related)
        }));
    }

    parseRelated(related) {
      if (!related) return [];
      return typeof related === 'string' ? 
        related.split(';').map(r => r.trim()) : 
        related;
    }

    formatSizeRange(product) {
      const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
      if (sizes.length === 0) return 'Tamaño no es available';
      if (sizes.length === 1) return `Tamaño: ${sizes[0]}${product.unit || ''}`;
      
      return `Tamaños: ${sizes[0]}${product.unit || ''} - ${sizes[sizes.length - 1]}${product.unit || ''}`;
    }

    generateProductCard(product) {
      return `
        <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer min-w-[280px] md:min-w-0" 
             data-category="${product.Category}" 
             data-id="${product.id}">
          <div class="product-image-container relative p-7 flex items-center justify-center group">
            <img class="productImage max-h-[${CONFIG.productImageHeight}px] w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                 src="./src${product.image.substring(2)}" 
                 alt="${product.name}"
                 loading="lazy">
            ${product['New Product'] === 'x' ? 
              `<div class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NUEVO</div>` 
              : ''}
          </div>
          <div class="mt-auto p-4 border-t border-gray-200">
            <div class="productSize text-gray-500 text-[11px] mb-1">${this.formatSizeRange(product)}</div>
            <div class="productName text-lg font-medium text-gray-800 truncate mb-3">${product.name}</div>
            <button class="w-full py-2 px-4 bg-secondaryblue text-white rounded-lg hover:bg-mainblue transition-colors duration-300 transform hover:scale-[1.02]">
              Más Detalles
              <i class="fas fa-arrow-right ml-2 text-sm"></i>
            </button>
          </div>
        </div>
      `;
    }
  }

 
  // Initialize Application
  try {
    // Load Excel data
    const excelPath = '/artools-v2/src/data/data.xlsx';
    const response = await fetch(excelPath);
    if (!response.ok) {
      throw new Error(`Failed to load Excel file: ${response.status}`);
    }
    const blob = await response.blob();
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Add error checking for sheet existence
        if (!workbook.SheetNames.length) {
          throw new Error('Excel file contains no sheets');
        }
        
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
          throw new Error('First sheet is empty');
        }
        
        const json = XLSX.utils.sheet_to_json(sheet);

        // Initialize Product Manager
        const productManager = new ProductManager(json);

        // Render Products
        document.querySelector('.newProductsGrid').innerHTML = 
          productManager.newProducts.map(p => productManager.generateProductCard(p)).join('');
        document.querySelector('.recommendedProductsGrid').innerHTML = 
          productManager.recommendedProducts.map(p => productManager.generateProductCard(p)).join('');

        // Setup Product Click Handlers
        ['newProductsGrid', 'recommendedProductsGrid'].forEach(gridClass => {
          document.querySelector('.' + gridClass).addEventListener('click', (event) => {
            const productElement = event.target.closest('.product');
            if (!productElement) return;

            const { category, id } = productElement.dataset;
            const product = [...productManager.newProducts, ...productManager.recommendedProducts]
              .find(p => p.id === id);

            if (product) {
              localStorage.setItem('selectedProduct', JSON.stringify({
                ...product,
                size: product.size ? product.size.split(';')
                  .map(s => s.trim() + (s.includes(product.unit) ? '' : (product.unit || '')))
                  .join(';') : '',
                unit: product.unit || ''
              }));
              
              localStorage.setItem('navStack', JSON.stringify([
                { title: category, data: null }
              ]));
              
              window.location.href = '/artools-v2/src/html/productPage.html';
            }
          });
        });
      } catch (error) {
        console.error('Error processing Excel data:', error);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsArrayBuffer(blob);
    
  } catch (error) {
    console.error('Error fetching Excel file:', error);
  }
});