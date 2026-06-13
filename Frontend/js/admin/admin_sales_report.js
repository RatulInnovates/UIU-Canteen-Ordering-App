// Frontend/js/admin/admin_sales_report.js
document.addEventListener("DOMContentLoaded", () => {
    fetchSalesReportData();
    
    // Wire up Download CSV button/link
    const csvLink = document.querySelector('.csv-link');
    if (csvLink) {
        csvLink.setAttribute('href', '../../../backend/admin/sales_report.php?action=download_csv');
    }

    // Search input filtering for transactions
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll('.tx-table tbody tr');
            rows.forEach(row => {
                const txId = row.querySelector('.tx-id').textContent.toLowerCase();
                const customer = row.querySelector('.customer-link').textContent.toLowerCase();
                const items = row.cells[2].textContent.toLowerCase();
                if (txId.includes(query) || customer.includes(query) || items.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});

function fetchSalesReportData() {
    fetch('../../../backend/admin/sales_report.php')
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                const data = resData.data;

                // Update Stats
                const revCard = document.querySelector('.stat-card:nth-child(1) .stat-value');
                if (revCard) {
                    revCard.textContent = `৳${parseFloat(data.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                }

                const countCard = document.querySelector('.stat-card:nth-child(2) .stat-value');
                if (countCard) {
                    countCard.textContent = data.total_orders;
                }

                // Update Recent Transactions Table
                const tbody = document.querySelector('.tx-table tbody');
                if (tbody && data.transactions) {
                    tbody.innerHTML = '';
                    data.transactions.forEach(tx => {
                        const statusClass = tx.status === 'ready' || tx.status === 'collected' 
                            ? 'status-ready' 
                            : (tx.status === 'cancelled' ? 'status-archive' : 'status-queue');
                        
                        const initials = tx.customer_name ? tx.customer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';
                        
                        // Pick avatar colors
                        const colors = ['av-blue', 'av-green', 'av-red'];
                        const colorClass = colors[tx.id % colors.length];

                        const dateObj = new Date(tx.created_at);
                        const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        const html = `
                            <tr>
                                <td class="tx-id">#TRX-${tx.id}</td>
                                <td>
                                    <div class="customer-cell">
                                        <div class="customer-avatar ${colorClass}">${initials}</div>
                                        <span class="customer-link">${tx.customer_name}</span>
                                    </div>
                                </td>
                                <td>${tx.items || 'No items'}</td>
                                <td><span class="status-badge ${statusClass}">${tx.status.toUpperCase()}</span></td>
                                <td class="amount">৳${parseFloat(tx.total).toLocaleString()}</td>
                                <td class="time">${timeString}</td>
                            </tr>
                        `;
                        tbody.innerHTML += html;
                    });
                }

                // Update Crowd Favorites
                const crowdGrid = document.querySelector('.crowd-grid');
                if (crowdGrid && data.favorites) {
                    crowdGrid.innerHTML = '';
                    data.favorites.forEach(item => {
                        const html = `
                            <div class="food-card">
                                <img src="${item.image_url}" alt="${item.name}" class="food-img" onerror="this.src='https://via.placeholder.com/100'" />
                                <div class="food-info">
                                    <div class="food-name-row">
                                        <span class="food-name-link">${item.name}</span>
                                        <span class="food-price">৳${parseFloat(item.price).toLocaleString()}</span>
                                    </div>
                                    <p class="food-desc">${item.description || ''}</p>
                                    <div class="food-meta">
                                        <span class="rating">⭐ ${item.rating}</span>
                                        <span class="sales">↗ ${item.sales_count} SALES</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        crowdGrid.innerHTML += html;
                    });
                }
            }
        })
        .catch(err => console.error("Error loading sales report data:", err));
}
