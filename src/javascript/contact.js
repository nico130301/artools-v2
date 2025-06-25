document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const submitButton = document.getElementById('submitButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      // Show loading state
      submitButton.disabled = true;
      loadingSpinner.classList.remove('hidden');
      submitButton.querySelector('span').textContent = 'Enviando...';

      // Submit form normally
      form.submit();

    } catch (error) {
      console.error('Error:', error);
      alert('Lo sentimos, hubo un error al enviar el mensaje. Por favor intente nuevamente.');
      
      // Reset button state
      submitButton.disabled = false;
      loadingSpinner.classList.add('hidden');
      submitButton.querySelector('span').textContent = 'Enviar Mensaje';
    }
  });
});