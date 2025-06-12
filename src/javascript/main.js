document.addEventListener('DOMContentLoaded', async function() {
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
      if (sizes.length === 0) return 'Size not available';
      if (sizes.length === 1) return `Size: ${sizes[0]}${product.unit || ''}`;
      
      return `Sizes: ${sizes[0]}${product.unit || ''} - ${sizes[sizes.length - 1]}${product.unit || ''}`;
    }

    generateProductCard(product) {
      return `
        <div class="product bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer min-w-[280px] md:min-w-0" 
             data-category="${product.Category}" 
             data-id="${product.id}">
          <div class="product-image-container relative p-7 flex items-center justify-center group">
            <img class="productImage max-h-[${CONFIG.productImageHeight}px] w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                 src="${product.image}" 
                 alt="${product.name}"
                 loading="lazy">
            ${product['New Product'] === 'x' ? 
              `<div class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</div>` 
              : ''}
          </div>
          <div class="mt-auto p-4 border-t border-gray-200">
            <div class="productSize text-gray-500 text-[11px] mb-1">${this.formatSizeRange(product)}</div>
            <div class="productName text-lg font-medium text-gray-800 truncate mb-3">${product.name}</div>
            <button class="w-full py-2 px-4 bg-secondaryblue text-white rounded-lg hover:bg-mainblue transition-colors duration-300 transform hover:scale-[1.02]">
              More Details
              <i class="fas fa-arrow-right ml-2 text-sm"></i>
            </button>
          </div>
        </div>
      `;
    }
  }

  // Slideshow Controller
  class SlideshowController {
    constructor() {
      this.slideshow = document.querySelector('.slideshow');
      this.slidesWrapper = document.querySelector('.slides-wrapper');
      this.slides = document.querySelectorAll('.slide-container');
      this.dots = document.querySelectorAll('.slide-dots button');
      this.prevButton = document.querySelector('.prev-arrow');
      this.nextButton = document.querySelector('.next-arrow');
      
      this.currentSlide = 1;
      this.isTransitioning = false;
      this.autoplayInterval = null;
      
      this.init();
    }

    init() {
      this.setupInitialState();
      this.setupEventListeners();
      this.startAutoplay();
    }

    setupInitialState() {
      this.slidesWrapper.style.transform = `translateX(-100%)`;
      this.dots[0].classList.add('opacity-100');
    }

    setupEventListeners() {
      this.setupNavigationListeners();
      this.setupTouchListeners();
      this.setupTransitionListener();
    }

    setupNavigationListeners() {
      this.prevButton.addEventListener('click', () => this.navigate('prev'));
      this.nextButton.addEventListener('click', () => this.navigate('next'));
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index + 1));
      });
    }

    setupTouchListeners() {
      let touchStartX = 0;
      this.slidesWrapper.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        this.stopAutoplay();
      });

      this.slidesWrapper.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > CONFIG.touchThreshold) {
          this.navigate(diff > 0 ? 'next' : 'prev');
        }
        this.startAutoplay();
      });
    }

    setupTransitionListener() {
      this.slidesWrapper.addEventListener('transitionend', () => {
        this.slidesWrapper.style.transition = `transform ${CONFIG.transitionDuration}ms`;
      });
    }

    navigate(direction) {
      this.goToSlide(direction === 'next' ? this.currentSlide + 1 : this.currentSlide - 1);
      this.resetAutoplay();
    }

    goToSlide(index, instant = false) {
      if (this.isTransitioning && !instant) return;
      this.isTransitioning = true;

      const totalSlides = this.slides.length;
      const actualIndex = ((index % (totalSlides - 2)) + (totalSlides - 2)) % (totalSlides - 2);
      
      this.updateDots(actualIndex);
      this.moveSlides(index, instant);
    }

    updateDots(activeIndex) {
      this.dots.forEach(dot => dot.classList.remove('opacity-100'));
      this.dots[activeIndex].classList.add('opacity-100');
    }

    moveSlides(index, instant) {
      if (instant) this.slidesWrapper.style.transition = 'none';
      this.slidesWrapper.style.transform = `translateX(-${index * 100}%)`;

      setTimeout(() => {
        this.handleInfiniteScroll(index);
      }, instant ? 0 : CONFIG.transitionDuration);
    }

    handleInfiniteScroll(index) {
      const totalSlides = this.slides.length;
      
      if (index === 0 || index === totalSlides - 1) {
        this.slidesWrapper.style.transition = 'none';
        this.currentSlide = index === 0 ? totalSlides - 2 : 1;
        this.slidesWrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
      } else {
        this.currentSlide = index;
      }

      setTimeout(() => {
        this.slidesWrapper.style.transition = `transform ${CONFIG.transitionDuration}ms`;
        this.isTransitioning = false;
      }, 10);
    }

    startAutoplay() {
      this.autoplayInterval = setInterval(() => this.navigate('next'), CONFIG.autoplayDelay);
    }

    stopAutoplay() {
      clearInterval(this.autoplayInterval);
    }

    resetAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }

  // Initialize Application
  try {
    // Load Excel data
    const response = await fetch('../data/data.xlsx');
    const blob = await response.blob();
    const workbook = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(XLSX.read(new Uint8Array(e.target.result), { type: 'array' }));
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Initialize Product Manager
    const productManager = new ProductManager(
      XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
    );

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
          
          window.location.href = '../html/productPage.html';
        }
      });
    });

    // Initialize Slideshow
    new SlideshowController();

  } catch (error) {
    console.error('Application initialization failed:', error);
    // Here you could add user-friendly error handling
  }
});