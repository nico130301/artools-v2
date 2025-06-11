document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('../html/utils/footer.html');
    if (!response.ok) throw new Error('Failed to load footer');
    const footerContent = await response.text();
    document.querySelector('.footer').innerHTML = footerContent;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
});