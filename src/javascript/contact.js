document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const submitButton = document.getElementById('submitButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  form.addEventListener('submit', async (e) => {
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

      // Submit the form
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Show success message
      alert('Mensaje enviado exitosamente. Gracias por contactarnos.');
      form.reset();

    } catch (error) {
      console.error('Error:', error);
      alert('Lo sentimos, hubo un error al enviar el mensaje. Por favor intente nuevamente.');
    } finally {
      // Reset button state
      submitButton.disabled = false;
      loadingSpinner.classList.add('hidden');
      submitButton.querySelector('span').textContent = 'Enviar Mensaje';
    }
  });
});