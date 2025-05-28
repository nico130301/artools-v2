////////////////////////////////////////////////////////////////
/////////////////////MOBILE////////////////////////////////////



function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileSearchText = document.getElementById('mobileSearchText');
    const mobileSearchButton = document.getElementById('mobileSearchButton');

    if (!mobileMenuBtn || !closeMenuBtn || !mobileMenu) {
        // Elements not found, wait and try again
        setTimeout(initializeMobileMenu, 100);
        return;
    }

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            mobileMenu.classList.add('active');
        }, 10);
    });

    closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
    });

    // Mobile search functionality
    function handleMobileSearch() {
        const query = mobileSearchText.value.trim();
        if (query) {
            window.location.href = `./searchPage.html?query=${encodeURIComponent(query)}`;
        }
    }

    if (mobileSearchButton && mobileSearchText) {
        mobileSearchButton.addEventListener('click', handleMobileSearch);
        mobileSearchText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleMobileSearch();
        });
    }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeMobileMenu);