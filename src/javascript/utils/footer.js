document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load footer content
    const response = await fetch('/src/html/utils/footer.html');
    if (!response.ok) throw new Error('Failed to load footer');
    const footerContent = await response.text();
    document.querySelector('.footer').innerHTML = footerContent;

    // Newsletter functionality
    const form = document.getElementById('newsletterForm');
    const messageDiv = document.getElementById('newsletterMessage');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            // Show success message
            messageDiv.innerHTML = `
              <div class="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                ¡Gracias por suscribirte! Revisa tu correo para confirmar la suscripción.
              </div>
            `;
            messageDiv.classList.remove('hidden');
            form.reset();
          } else {
            throw new Error('Error en el envío');
          }
        } catch (error) {
          // Show error message
          messageDiv.innerHTML = `
            <div class="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              Hubo un error. Por favor intenta nuevamente.
            </div>
          `;
          messageDiv.classList.remove('hidden');
        }

        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add('hidden');
        }, 5000);
      });
    }

    // Add unsubscribe functionality
    const unsubscribeBtn = document.getElementById('unsubscribeBtn');
    
    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', () => {
        // Create a modal dialog
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-4">Cancelar Suscripción</h3>
            <form id="unsubscribeForm" class="space-y-4">
              <input type="email" 
                     name="email" 
                     required 
                     placeholder="Ingrese su correo electrónico"
                     class="w-full px-4 py-2 rounded border focus:ring-2 focus:ring-mainblue focus:border-mainblue">
              <div class="flex justify-end gap-3">
                <button type="button" 
                        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        onclick="this.closest('.fixed').remove()">
                  Cancelar
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        `;

        document.body.appendChild(modal);

        // Handle unsubscribe form submission
        const unsubscribeForm = document.getElementById('unsubscribeForm');
        unsubscribeForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = unsubscribeForm.email.value;

          try {
            const response = await fetch('https://formsubmit.co/ajax/nicroraza@gmail.com', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                email: email,
                _subject: 'Solicitud de cancelación de suscripción',
                unsubscribe: true
              })
            });

            if (response.ok) {
              alert('Se ha procesado su solicitud de cancelación.');
              modal.remove();
            } else {
              throw new Error('Error en el envío');
            }
          } catch (error) {
            alert('Hubo un error al procesar su solicitud. Por favor intente nuevamente.');
          }
        });
      });
    }
  } catch (error) {
    console.error('Error loading footer:', error);
  }
});