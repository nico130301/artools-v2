document.addEventListener('DOMContentLoaded', function() {
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
});