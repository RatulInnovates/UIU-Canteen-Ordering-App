(function () {
    'use strict';

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

    window.UIToast = { show: showToast };

    document.addEventListener('click', function (e) {
        var logout = e.target.closest('a.logout-btn-link, a.logout-item');
        if (logout) {
            e.preventDefault();
            var url = logout.getAttribute('href') || 'index.html';
            showToast('Signed out. Redirecting…');
            setTimeout(function () {
                window.location.href = url;
            }, 550);
            return;
        }

        var pop = e.target.closest('[data-popup-message]');
        if (!pop) return;
        var msg = pop.getAttribute('data-popup-message');
        if (!msg) return;
        if (pop.hasAttribute('data-popup-stop')) e.preventDefault();
        showToast(msg);
    });

    document.addEventListener('click', function (e) {
        var target = e.target.closest(
            '.place-btn, .save-btn, .run-diag-btn, .btn-archive, .btn-publish, .btn-quick-ops, .bulk-btn, .btn-add, .clear-notif-btn, .report-btn'
        );
        var notif = e.target.closest('.icon-btn[aria-label="Notifications"]');

        if (notif) {
            e.preventDefault();
            showToast('No new notifications right now.');
            return;
        }

        var addCart = e.target.closest('.btn-add-cart');
        if (addCart) {
            var tile = addCart.closest('.menu-tile');
            var h = tile && tile.querySelector('h3');
            var name = h ? h.textContent.trim() : 'Item';
            showToast(name + ' added to your tray.');
            return;
        }

        var flashAdd = e.target.closest('a.add-btn');
        if (flashAdd) {
            showToast('Flash deal added — opening your tray.');
            return;
        }

        var studentView = e.target.closest('a.student-btn');
        if (studentView) {
            e.preventDefault();
            var studentUrl = studentView.getAttribute('href') || '../student/student_dashboard.html';
            showToast('Opening student view…');
            setTimeout(function () {
                window.location.href = studentUrl;
            }, 400);
            return;
        }

        var studentViewBtn = e.target.closest('button.student-btn');
        if (studentViewBtn) {
            e.preventDefault();
            showToast('Opening student view…');
            setTimeout(function () {
                window.location.href = '../student/student_dashboard.html';
            }, 400);
            return;
        }

        if (!target) return;

        if (target.matches('.place-btn')) {
            e.preventDefault();
            showToast('Order placed! Check your tray for the token.');
            return;
        }
        if (target.matches('.save-btn')) {
            e.preventDefault();
            showToast('Settings saved.');
            return;
        }

        if (target.matches('.run-diag-btn')) {
            e.preventDefault();
            showToast('Diagnostic run started.');
            return;
        }
        if (target.matches('.btn-archive')) {
            e.preventDefault();
            showToast('Archive in progress…');
            return;
        }
        if (target.matches('.btn-publish')) {
            e.preventDefault();
            showToast('Changes published.');
            return;
        }
        if (target.matches('.btn-quick-ops')) {
            e.preventDefault();
            showToast('Quick operations panel opened.');
            return;
        }
        if (target.matches('.bulk-btn')) {
            e.preventDefault();
            showToast('Action queued: ' + (target.textContent || 'Bulk action').trim());
            return;
        }

        if (target.matches('.btn-add')) {
            e.preventDefault();
            showToast('Add dish — use the form to continue.');
            return;
        }
        if (target.matches('.clear-notif-btn')) {
            e.preventDefault();
            showToast('Notifications cleared.');
            return;
        }
        if (target.matches('.report-btn')) {
            e.preventDefault();
            showToast('Opening report summary…');
            return;
        }
    });
})();
