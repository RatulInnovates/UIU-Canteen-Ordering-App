// Frontend/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-signup');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Gather form data
            const formData = new FormData(loginForm);
            
            try {
                const res = await fetch('../backend/auth/login.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                
                if (result.status === 'success') {
                    if (window.UIToast) window.UIToast.show('Login successful!');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        if (result.data.user.role === 'staff' || result.data.user.role === 'admin') {
                            window.location.href = 'pages/staff/staff_dashboard.html';
                        } else {
                            window.location.href = 'pages/student/student_dashboard.html';
                        }
                    }, 1000);
                } else {
                    alert(result.message); // e.g. "Invalid email or password"
                }
            } catch (err) {
                console.error("Login request failed", err);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            
            try {
                // Add temporary debug flag so server returns diagnostics
                formData.append('_debug', '1');

                const res = await fetch('../backend/auth/register.php', {
                    method: 'POST',
                    body: formData
                });

                let result;
                try {
                    result = await res.json();
                } catch (parseErr) {
                    const text = await res.text();
                    console.error('Registration response not valid JSON', res.status, text);
                    alert('Registration failed: invalid server response. See console for details.');
                    return;
                }

                if (result.status === 'success') {
                    alert('Account created! You can now log in.');
                    window.location.reload();
                } else {
                    alert(result.message || 'Registration failed');
                }
            } catch (err) {
                console.error('Registration request failed', err);
                alert('Registration request failed. Check console for details.');
            }
        });
    }
});