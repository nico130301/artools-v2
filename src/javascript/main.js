document.addEventListener('DOMContentLoaded', async function() {
  // Load Excel data first
  const response = await fetch('../data/data.xlsx');
  const blob = await response.blob();
  
  const workbook = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      resolve(workbook);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  // Parse Excel data
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const products = XLSX.utils.sheet_to_json(sheet);

  // Filter new products and recommended products
    const newProducts = products.filter(product => product['New Product'] === 'x').map(product => ({
      ...product,
      related: product.related ? 
        (typeof product.related === 'string' ? 
          product.related.split(';').map(r => r.trim()) : 
          product.related) : 
        []
    }));

    const recommendedProducts = products.filter(product => product['Recommended Product'] === 'x').map(product => ({
      ...product,
      related: product.related ? 
        (typeof product.related === 'string' ? 
          product.related.split(';').map(r => r.trim()) : 
          product.related) : 
        []
    }));
// Updated column name

  // Generate HTML for new products
  let newProductsHTML = '';
  newProducts.forEach((product) => {
    // Get size range
    const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
    let sizeRange = 'Size not available';

    if (sizes.length > 0) {
      if (sizes.length === 1) {
        // If there's only one size, show it with the unit
        sizeRange = `Size: ${sizes[0]}${product.unit || ''}`;
      } else {
        // If there are multiple sizes, show the range with the unit
        const firstSize = sizes[0];
        const lastSize = sizes[sizes.length - 1];
        sizeRange = `Sizes: ${firstSize}${product.unit || ''} - ${lastSize}${product.unit || ''}`;
      }
    }

    newProductsHTML += `
      <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px] md:min-w-0" data-category="${product.Category}" data-id="${product.id}">
        <div class="product-image-container p-7 flex items-center justify-center">
          <img class="productImage max-h-full w-auto object-contain" src="${product.image}">
        </div>
        <div class="mt-auto p-3 border-t border-gray-200">
          <div class="productSize text-gray-500 text-[11px]">${sizeRange}</div>
          <div class="productName text-lg font-medium text-gray-800 truncate">${product.name}</div>
          <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
        </div>
      </div>
    `;
  });

  // Generate HTML for recommended products
  let recommendedProductsHTML = '';
  recommendedProducts.forEach((product) => {
    // Get size range
  const sizes = product.size ? product.size.split(';').map(s => s.trim()) : [];
  let sizeRange = 'Size not available';

  if (sizes.length > 0) {
    if (sizes.length === 1) {
      // If there's only one size, show it with the unit
      sizeRange = `Size: ${sizes[0]}${product.unit || ''}`;
    } else {
      // If there are multiple sizes, show the range with the unit
      const firstSize = sizes[0];
      const lastSize = sizes[sizes.length - 1];
      sizeRange = `Sizes: ${firstSize}${product.unit || ''} - ${lastSize}${product.unit || ''}`;
    }
  }

    recommendedProductsHTML += `
      <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px] md:min-w-0" data-category="${product.Category}" data-id="${product.id}">
        <div class="product-image-container p-7 flex items-center justify-center">
          <img class="productImage max-h-full w-auto object-contain" src="${product.image}">
        </div>
        <div class="mt-auto p-3 border-t border-gray-200">
          <div class="productSize text-gray-500 text-[11px]">${sizeRange}</div>
          <div class="productName text-lg font-medium text-gray-800 truncate">${product.name}</div>
          <button class="w-full mt-3 py-2 px-4 bg-secondaryblue text-white rounded hover:bg-mainblue transition-colors duration-300">More Details</button>
        </div>
      </div>
    `;
  });

  // Update the DOM
  document.querySelector('.newProductsGrid').innerHTML = newProductsHTML;
  document.querySelector('.recommendedProductsGrid').innerHTML = recommendedProductsHTML;

  // Add click handlers
  ['newProductsGrid', 'recommendedProductsGrid'].forEach(gridClass => {
    document.querySelector('.' + gridClass).addEventListener('click', (event) => {
      const productElement = event.target.closest('.product');
      if (productElement) {
        const category = productElement.dataset.category;
        const productId = productElement.dataset.id;
        
        // Find the clicked product data 
        const clickedProduct = [...newProducts, ...recommendedProducts].find(p => p.id === productId);

        if (clickedProduct) {
          // Add the unit to the product data before storing
          const productWithUnit = {
            ...clickedProduct,
            // If size contains unit, keep it, otherwise append the unit from product
            size: clickedProduct.size ? clickedProduct.size.split(';').map(s => 
              s.trim() + (s.includes(clickedProduct.unit) ? '' : (clickedProduct.unit || ''))
            ).join(';') : '',
            unit: clickedProduct.unit || '' // Ensure unit is included
          };
          
          // Store the enhanced product data
          localStorage.setItem('selectedProduct', JSON.stringify(productWithUnit));
          localStorage.setItem('navStack', JSON.stringify([
            { title: category, data: null }
          ]));
          
          // Navigate to product page
          window.location.href = '../html/productPage.html';
        }
      }
    });
  });

  //// SLIDESHOW /////
  const slideshow = document.querySelector('.slideshow');
  const slidesWrapper = document.querySelector('.slides-wrapper');
  const slides = document.querySelectorAll('.slide-container');
  const dots = document.querySelectorAll('.slide-dots button');
  const prevButton = document.querySelector('.prev-arrow');
  const nextButton = document.querySelector('.next-arrow');

  let currentSlide = 1; // Start at first real slide (index 1)
  let isTransitioning = false;
  let autoplayInterval;

  // Initialize position
  slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

  function goToSlide(index, instant = false) {
    if (isTransitioning && !instant) return;
    isTransitioning = true;

    const totalSlides = slides.length;
    const actualIndex = ((index % (totalSlides - 2)) + (totalSlides - 2)) % (totalSlides - 2); // Adjust for actual slides (excluding clones)
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('opacity-100'));
    dots[actualIndex].classList.add('opacity-100');

    // Move slides
    if (instant) {
      slidesWrapper.style.transition = 'none';
    }
    
    slidesWrapper.style.transform = `translateX(-${index * 100}%)`;

    // Handle infinite scroll
    setTimeout(() => {
      if (index === 0) { // If we're at the clone of the last slide
        slidesWrapper.style.transition = 'none';
        currentSlide = totalSlides - 2; // Jump to the real last slide
        slidesWrapper.style.transform = `translateX(-${(totalSlides - 2) * 100}%)`;
      } else if (index === totalSlides - 1) { // If we're at the clone of the first slide
        slidesWrapper.style.transition = 'none';
        currentSlide = 1; // Jump to the real first slide
        slidesWrapper.style.transform = `translateX(-100%)`;
      } else {
        currentSlide = index;
      }
      
      // Reset transition
      setTimeout(() => {
        slidesWrapper.style.transition = 'transform 500ms';
        isTransitioning = false;
      }, 10);
    }, instant ? 0 : 500);
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // Event listeners
  prevButton.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });

  nextButton.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index + 1); // Add 1 to account for clone slide at start
      resetAutoplay();
    });
  });

  // Handle transition end
  slidesWrapper.addEventListener('transitionend', () => {
    slidesWrapper.style.transition = 'transform 500ms';
  });

  // Autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 4000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;

  slidesWrapper.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slidesWrapper.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      nextSlide();
      resetAutoplay();
    } else if (touchEndX - touchStartX > 50) {
      prevSlide();
      resetAutoplay();
    }
  });

  // Initialize
  dots[0].classList.add('opacity-100');
  startAutoplay();
});
