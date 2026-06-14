let currentCategoryFilter = 'all';

document.addEventListener("DOMContentLoaded", () => {
    fetchMenu();

    // Filter Controls
    const pillBtns = document.querySelectorAll('.pill-btn');
    pillBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            pillBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            e.target.classList.add('active');
            
            // Set filter and refresh
            currentCategoryFilter = e.target.getAttribute('data-category');
            fetchMenu();
        });
    });

    // Modal controls
    const addBtn = document.querySelector(".btn-add");
    const modal = document.getElementById("addModal");
    const closeBtn = document.getElementById("closeModalBtn");
    const addForm = document.getElementById("addDishForm");

    addBtn.addEventListener("click", () => {
        modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });

    // Form submission
    addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById("dishName").value,
            description: document.getElementById("dishDesc").value,
            price: document.getElementById("dishPrice").value,
            category: document.getElementById("dishCategory").value,
            image_url: document.getElementById("dishImage").value
        };

        fetch('../../../backend/staff/menu_manage.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                modal.style.display = "none";
                addForm.reset();
                fetchMenu(); // Refresh list
            } else {
                alert("Error adding dish: " + resData.message);
            }
        });
    });
});

function fetchMenu() {
    fetch('../../../backend/staff/menu_manage.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                // Update stats
                document.getElementById('activeCount').innerText = data.data.stats.active;
                document.getElementById('soldOutCount').innerText = data.data.stats.sold_out;

                const menuList = document.getElementById("menuList");
                menuList.innerHTML = ""; // Clear list
                
                let items = data.data.items;
                if (currentCategoryFilter !== 'all') {
                    items = items.filter(item => item.category === currentCategoryFilter);
                }

                items.forEach(item => {
                    const priceFormatted = parseFloat(item.price).toFixed(2);
                    const availabilityClass = item.available == 1 ? 'active-text' : 'sold-out';
                    const availabilityText = item.available == 1 ? 'AVAILABLE' : 'SOLD OUT';
                    const switchClass = item.available == 1 ? 'active' : '';

                    const itemHTML = `
                    <div class="menu-item">
                        <div class="item-info">
                            <img src="${item.image_url || 'https://via.placeholder.com/100'}" class="item-img" alt="Dish">
                            <div class="item-details">
                                <div class="item-title">${item.name}</div>
                                <div class="item-desc">${item.description}</div>
                            </div>
                        </div>
                        <div class="item-category">
                            <div class="col-label">CATEGORY</div>
                            <div class="cat-pill" style="text-transform:capitalize;">${item.category}</div>
                        </div>
                        <div class="item-price">
                            <div class="col-label">PRICE</div>
                            <div class="price-value"><span class="currency">৳</span> ${priceFormatted}</div>
                        </div>
                        <div class="item-availability">
                            <div class="col-label">AVAILABILITY</div>
                            <div class="toggle-switch ${switchClass}" onclick="toggleAvailability(${item.id})" style="cursor:pointer;">
                                <div class="toggle-circle"></div>
                            </div>
                            <div class="avail-status ${availabilityClass}">${availabilityText}</div>
                        </div>
                        <div class="item-actions">
                            <span class="action-icon delete" onclick="deleteDish(${item.id})" style="cursor:pointer; color:#ff4757;">🗑️</span>
                        </div>
                    </div>
                    `;
                    menuList.innerHTML += itemHTML;
                });
            }
        });
}

function toggleAvailability(id) {
    fetch('../../../backend/staff/menu_manage.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') fetchMenu();
    });
}

function deleteDish(id) {
    if (confirm("Are you sure you want to delete this dish?")) {
        fetch('../../../backend/staff/menu_manage.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') fetchMenu();
        });
    }
}
