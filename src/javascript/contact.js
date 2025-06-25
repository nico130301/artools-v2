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

      // Collect form data
      const formData = new FormData(form);

      // Submit to Formspark
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });

      if (response.ok) {
        // Success message
        alert('Mensaje enviado exitosamente');
        form.reset();
        window.location.href = formData.get('_redirect');
      } else {
        throw new Error('Error en el envío');
      }
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