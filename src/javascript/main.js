document.addEventListener('DOMContentLoaded',async function() {
  const slides = document.getElementById('slides');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const totalSlides = document.querySelectorAll('#slides > a:not(:first-child):not(:last-child)').length;
  let currentIndex = 1; // Start at 1 because of the cloned slide
  let isTransitioning = false;

  function updateSlidePosition(animate = true) {
    if (animate) {
      slides.style.transition = 'transform 0.5s ease-out';
    } else {
      slides.style.transition = 'none';
    }
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function handleSlideTransitionEnd() {
    // Check if we need to jump to the other end
    if (currentIndex === 0) {
      // If we're at the cloned last slide, jump to the real last slide
      slides.style.transition = 'none';
      currentIndex = totalSlides;
      updateSlidePosition(false);
    } else if (currentIndex === totalSlides + 1) {
      // If we're at the cloned first slide, jump to the real first slide
      slides.style.transition = 'none';
      currentIndex = 1;
      updateSlidePosition(false);
    }
    isTransitioning = false;
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateSlidePosition();
  }

  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateSlidePosition();
  }

  // Event Listeners
  slides.addEventListener('transitionend', handleSlideTransitionEnd);
  prevButton.addEventListener('click', prevSlide);
  nextButton.addEventListener('click', nextSlide);

  // Touch handling
  let touchStartX = 0;
  let touchEndX = 0;
  let initialTranslate = 0;

  slides.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    initialTranslate = -currentIndex * 100;
    slides.style.transition = 'none';
  }, { passive: true });

  slides.addEventListener('touchmove', (e) => {
    if (isTransitioning) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    const movePercent = (diff / window.innerWidth) * 100;
    slides.style.transform = `translateX(${initialTranslate + movePercent}%)`;
  }, { passive: true });

  slides.addEventListener('touchend', (e) => {
    const movePercent = touchEndX - touchStartX;
    if (Math.abs(movePercent) > 50) {
      if (movePercent > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      updateSlidePosition(); // Snap back
    }
  });

  // Initialize position
  updateSlidePosition(false);

  // Auto-sliding for desktop only
  if (window.matchMedia('(min-width: 768px)').matches) {
    setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 5000);
  }

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
    const excelPath = '/src/data/data.xlsx';
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
              
              window.location.href = '/src/html/productPage.html';
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