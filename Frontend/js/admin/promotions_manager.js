// Frontend/js/admin/promotions_manager.js
document.addEventListener("DOMContentLoaded", () => {
    fetchPromotions();

    // Handle new promotion creation
    const newPromoForm = document.getElementById("newPromoForm");
    if (newPromoForm) {
        newPromoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const formData = new FormData(newPromoForm);
            
            fetch('../../../backend/admin/promotions.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Promotion created successfully!');
                    newPromoForm.reset();
                    fetchPromotions();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(err => {
                console.error('Error creating promotion:', err);
                alert('An error occurred. Please check console.');
            });
        });
    }
});

function fetchPromotions() {
    const promoList = document.getElementById("promoList");
    if (!promoList) return;

    fetch('../../../backend/admin/promotions.php')
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                const promotions = resData.data;
                
                if (promotions.length === 0) {
                    promoList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No promotions found. Create one on the right!</div>';
                    return;
                }

                promoList.innerHTML = '';
                promotions.forEach(promo => {
                    const statusClass = `status-${promo.status}`;
                    const targetText = promo.target_role === 'all' ? 'Everyone' : (promo.target_role === 'student' ? 'Students' : 'Staff');

                    const html = `
                        <div class="promo-item-card" data-id="${promo.id}">
                            <img src="${promo.image_url}" alt="${promo.title}" class="promo-img" onerror="this.src='https://via.placeholder.com/150'" />
                            <div class="promo-info">
                                <div class="promo-title-row">
                                    <span class="promo-name">${promo.title}</span>
                                    <span class="promo-code-badge">${promo.discount_code.toUpperCase()}</span>
                                </div>
                                <div class="promo-meta">
                                    <span>🎯 Target: <strong>${targetText}</strong></span>
                                    <span>📅 Days: <strong>${promo.active_days}</strong></span>
                                </div>
                            </div>
                            <div class="promo-actions">
                                <span class="status-badge ${statusClass}">${promo.status.toUpperCase()}</span>
                                <div style="display: flex; gap: 5px; margin-top: 5px;">
                                    <select class="status-select btn-sm" onchange="toggleStatus(${promo.id}, this.value)">
                                        <option value="active" ${promo.status === 'active' ? 'selected' : ''}>Active</option>
                                        <option value="queued" ${promo.status === 'queued' ? 'selected' : ''}>Queued</option>
                                        <option value="archived" ${promo.status === 'archived' ? 'selected' : ''}>Archived</option>
                                    </select>
                                    <button class="btn-sm btn-delete" onclick="deletePromotion(${promo.id})">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
                    promoList.innerHTML += html;
                });
            } else {
                promoList.innerHTML = `<div style="text-align: center; color: red; padding: 20px;">Failed to load promotions: ${resData.message}</div>`;
            }
        })
        .catch(err => {
            console.error('Error fetching promotions:', err);
            promoList.innerHTML = '<div style="text-align: center; color: red; padding: 20px;">Error connecting to the server.</div>';
        });
}

function toggleStatus(id, newStatus) {
    const formData = new FormData();
    formData.append('action', 'toggle');
    formData.append('id', id);
    formData.append('status', newStatus);

    fetch('../../../backend/admin/promotions.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            fetchPromotions();
        } else {
            alert('Failed to update status: ' + data.message);
        }
    })
    .catch(err => console.error('Error toggling status:', err));
}

function deletePromotion(id) {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    fetch('../../../backend/admin/promotions.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            fetchPromotions();
        } else {
            alert('Failed to delete promotion: ' + data.message);
        }
    })
    .catch(err => console.error('Error deleting promotion:', err));
}
