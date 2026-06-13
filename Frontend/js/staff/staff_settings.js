document.addEventListener("DOMContentLoaded", () => {
    fetchSettings();

    // Toggle logic for UI
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            if (toggle.classList.contains('toggle-on')) {
                toggle.classList.remove('toggle-on');
                toggle.classList.add('toggle-off');
            } else {
                toggle.classList.remove('toggle-off');
                toggle.classList.add('toggle-on');
            }
        });
    });

    const updateBtn = document.querySelector(".update-btn");
    updateBtn.addEventListener("click", () => {
        const name = document.getElementById("staffName").value;
        const staffId = document.getElementById("staffId").value;
        const email = document.getElementById("staffEmail").value;

        // Gather settings
        const settings = {
            notif_orders: document.getElementById("notif-orders").classList.contains("toggle-on"),
            notif_stock: document.getElementById("notif-stock").classList.contains("toggle-on"),
            notif_sys: document.getElementById("notif-sys").classList.contains("toggle-on"),
            notif_sound: document.getElementById("notif-sound").classList.contains("toggle-on")
        };

        fetch('../../../backend/staff/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, staff_id: staffId, email: email, settings: settings })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.data);
                fetchSettings();
            } else {
                alert('Error updating settings: ' + data.message);
            }
        });
    });

    const discardBtn = document.querySelector(".discard-btn");
    discardBtn.addEventListener("click", (e) => {
        e.preventDefault();
        fetchSettings();
    });
});

function fetchSettings() {
    fetch('../../../backend/staff/settings.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById("staffName").value = data.data.name;
                document.getElementById("staffId").value = data.data.staff_id;
                document.getElementById("staffEmail").value = data.data.email;
                
                // Update top header visually
                document.querySelector(".header-user-name").innerText = data.data.name;

                // Update toggles
                const s = data.data.settings;
                if (s) {
                    setToggle("notif-orders", s.notif_orders);
                    setToggle("notif-stock", s.notif_stock);
                    setToggle("notif-sys", s.notif_sys);
                    setToggle("notif-sound", s.notif_sound);
                }
            }
        });
}

function setToggle(id, isOn) {
    const el = document.getElementById(id);
    if (isOn) {
        el.classList.remove("toggle-off");
        el.classList.add("toggle-on");
    } else {
        el.classList.remove("toggle-on");
        el.classList.add("toggle-off");
    }
}
