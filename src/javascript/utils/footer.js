async function loadFooter() {
  const footerDiv = document.querySelector('.footer');
  try {
    // Try to get cached footer
    const cachedFooter = localStorage.getItem('footerCache');
    if (cachedFooter) {
      footerDiv.innerHTML = cachedFooter;
      return;
    }
    
    const response = await fetch('../html/utils/footer.html');
    const data = await response.text();
    
    // Cache the footer
    localStorage.setItem('footerCache', data);
    footerDiv.innerHTML = data;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

loadFooter();