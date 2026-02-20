document.addEventListener('DOMContentLoaded', () => {
    // If we're already logged in, redirect to dashboard
    if (window.Auth && window.Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            loginError.classList.add('hidden');

            // UI State loading
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Signing In...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                const result = await window.Auth.login(email, password);
                console.log('Login success:', result);

                // Show success UI briefly before redirect
                submitBtn.innerText = 'Success!';
                submitBtn.classList.remove('bg-primary');
                submitBtn.classList.add('bg-accent');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            } catch (err) {
                loginError.classList.remove('hidden');
                loginError.innerText = err.message || 'Invalid credentials. Please try again.';

                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }
});
