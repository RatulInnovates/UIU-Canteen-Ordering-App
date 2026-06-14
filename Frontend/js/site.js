// Frontend/js/site.js
(function () {
    'use strict';

    // --- TOAST NOTIFICATION SYSTEM ---
    function ensureRoot() {
        var el = document.getElementById('ui-toast-root');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ui-toast-root';
            el.className = 'ui-toast-root';
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }
        return el;
    }

    function showToast(message, options) {
        if (!message) return;
        options = options || {};
        var duration = typeof options.duration === 'number' ? options.duration : 2800;
        var root = ensureRoot();
        var t = document.createElement('div');
        t.className = 'ui-toast';
        t.setAttribute('role', 'status');
        t.textContent = message;
        root.appendChild(t);
        requestAnimationFrame(function () {
            t.classList.add('ui-toast--show');
        });
        var timer = setTimeout(remove, duration);
        function remove() {
            clearTimeout(timer);
            t.classList.remove('ui-toast--show');
            setTimeout(function () {
                if (t.parentNode) t.parentNode.removeChild(t);
            }, 240);
        }
        t.addEventListener('click', remove);
    }

    // Make it globally available so your other JS files can use it!
    window.UIToast = { show: showToast };

    // --- GLOBAL EVENT LISTENERS ---
    document.addEventListener('click', async function (e) {
        
        // 1. Handle actual Backend Logout
        var logout = e.target.closest('a.logout-btn-link, a.logout-item');
        if (logout) {
            e.preventDefault();
            
            try {
                // Call the real PHP logout endpoint
                await fetch('/UIU-Canteen-Ordering-App/backend/auth/logout.php'); 
            } catch (err) {
                console.error("Logout fetch failed", err);
            }

            var url = logout.getAttribute('href') || '../../index.html';
            showToast('Signed out. Redirecting…');
            setTimeout(function () {
                window.location.href = url;
            }, 550);
            return;
        }

        // 2. Generic UI popups via data attributes
        var pop = e.target.closest('[data-popup-message]');
        if (pop) {
            var msg = pop.getAttribute('data-popup-message');
            if (msg) {
                if (pop.hasAttribute('data-popup-stop')) e.preventDefault();
                showToast(msg);
            }
        }

        // 3. Generic Notification Bell Mock
        var notif = e.target.closest('.icon-btn[aria-label="Notifications"], .icon-btn[title="Notifications"]');
        if (notif) {
            e.preventDefault();
            showToast('No new notifications right now.');
            return;
        }
    });

    // --- LIVE DATE SETTER ---
    document.addEventListener("DOMContentLoaded", () => {
        const dateEl = document.getElementById("liveDate");
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString(undefined, options);
        }
    });
})();