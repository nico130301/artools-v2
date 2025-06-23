document.addEventListener('DOMContentLoaded', async function() {

   //slideshow
  const slides = document.getElementById("slides");
  const dots = document.querySelectorAll(".dot");
  const totalSlides = dots.length;
  let index = 0;
  let interval = setInterval(nextSlide, 7000);

  function showSlide(i) {
    index = (i + totalSlides) % totalSlides;
    slides.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle("opacity-100", idx === index);
      dot.classList.toggle("opacity-50", idx !== index);
    });
  }

  function nextSlide() {
    showSlide(index + 1);
  }

  function prevSlide() {
    showSlide(index - 1);
  }

  document.getElementById("next").addEventListener("click", () => {
    nextSlide();
    resetInterval();
  });

  document.getElementById("prev").addEventListener("click", () => {
    prevSlide();
    resetInterval();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      resetInterval();
    });
  });

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 7000);
  }

  // Initialize
  showSlide(index);

  
  // Configuration
  const CONFIG = {
    autoplayDelay: 7000,
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
        <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer min-w-[220px] md:min-w-0" 
             data-category="${product.Category}" 
             data-id="${product.id}">
          <div class="product-image-container relative p-4 md:p-7 flex items-center justify-center group">
            <img class="productImage max-h-[150px] md:max-h-[200px] w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                 src="./src${product.image.substring(2)}" 
                 alt="${product.name}"
                 loading="lazy">
            ${product['New Product'] === 'x' ? 
              `<div class="absolute top-2 right-2 md:top-4 md:right-4 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full">NUEVO</div>` 
              : ''}
          </div>
          <div class="mt-auto p-3 md:p-4 border-t border-gray-200">
            <div class="productSize text-gray-500 text-[10px] md:text-[11px] truncate mb-1">${this.formatSizeRange(product)}</div>
            <div class="productName text-base md:text-lg font-medium text-gray-800 truncate mb-2 md:mb-3">${product.name}</div>
            <button class="w-full py-1.5 md:py-2 px-3 md:px-4 bg-secondaryblue text-white text-sm md:text-base rounded-lg hover:bg-mainblue transition-colors duration-300 transform hover:scale-[1.02]">
              Más Detalles
              <i class="fas fa-arrow-right ml-2 text-xs md:text-sm"></i>
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