// Frontend/js/admin/admin_dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    setInterval(fetchDashboardData, 10000); // refresh every 10 seconds

    // Search input filtering for top items
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const items = document.querySelectorAll('.top-item-card');
            items.forEach(item => {
                const name = item.querySelector('.top-item-name').textContent.toLowerCase();
                if (name.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});

function fetchDashboardData() {
    fetch('../../../backend/admin/dashboard.php')
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                const data = resData.data;

                // Update Revenue
                const revCard = document.querySelector('.stat-card:nth-child(1) .stat-value');
                if (revCard) {
                    revCard.textContent = `৳${parseFloat(data.daily_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                }

                // Update Active Orders
                const activeCard = document.querySelector('.stat-card:nth-child(2) .stat-value');
                if (activeCard) {
                    activeCard.textContent = data.active_orders;
                }
                const activeSub = document.querySelector('.stat-card:nth-child(2) .stat-sub');
                if (activeSub) {
                    activeSub.textContent = `${data.in_queue} IN QUEUE | ${data.preparing} PREP`;
                }

                // Update Capacity Percentage / Progress Bar
                const capacityCard = document.querySelector('.stat-card:nth-child(3) .stat-value');
                if (capacityCard) {
                    capacityCard.innerHTML = `${data.capacity_percentage}% <span class="capacity-label">capacity</span>`;
                }
                const progress = document.querySelector('.stat-card:nth-child(3) .progress-bar');
                if (progress) {
                    progress.style.width = `${Math.min(data.capacity_percentage, 100)}%`;
                }

                // Update Sales Share Pie Chart
                const pieChart = document.getElementById('salesPieChart');
                const pieLegend = document.getElementById('salesPieLegend');
                if (pieChart && pieLegend && data.top_items) {
                    pieLegend.innerHTML = '';
                    
                    const itemsWithSales = data.top_items.filter(item => parseInt(item.sales_count) > 0);
                    
                    if (itemsWithSales.length === 0) {
                        pieChart.style.background = 'conic-gradient(#888 0% 100%)';
                        pieLegend.innerHTML = '<div style="font-size: 12px; color: #888;">No sales data today.</div>';
                    } else {
                        const totalSales = itemsWithSales.reduce((acc, item) => acc + parseInt(item.sales_count), 0);
                        const colors = ['#f0a040', '#7c3aed', '#2563eb', '#10b981', '#ef4444'];
                        
                        let currentAngle = 0;
                        const gradientParts = [];
                        
                        itemsWithSales.forEach((item, index) => {
                            const count = parseInt(item.sales_count);
                            const pct = Math.round((count / totalSales) * 100);
                            const color = colors[index % colors.length];
                            
                            const nextAngle = currentAngle + pct;
                            gradientParts.push(`${color} ${currentAngle}% ${nextAngle}%`);
                            currentAngle = nextAngle;
                            
                            const legendRow = `
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 4px;">
                                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${color};"></span>
                                    <span>${item.name} <strong>${pct}%</strong> (${count} sold)</span>
                                </div>
                            `;
                            pieLegend.innerHTML += legendRow;
                        });
                        
                        pieChart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
                    }
                }

                // Update Top Performing Items
                const topItemsList = document.querySelector('.top-items-list');
                if (topItemsList && data.top_items) {
                    topItemsList.innerHTML = '';
                    data.top_items.forEach(item => {
                        const html = `
                            <div class="top-item-card">
                                <img src="${item.image_url}" alt="${item.name}" class="top-item-img" onerror="this.src='https://via.placeholder.com/100'" />
                                <div class="top-item-info">
                                    <span class="top-item-name">${item.name}</span>
                                    <div class="top-item-sub">${item.sales_count} Sales today</div>
                                    <div class="top-item-meta">
                                        <span class="top-item-price">৳${parseFloat(item.revenue).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        topItemsList.innerHTML += html;
                    });
                }
            }
        })
        .catch(err => console.error("Error loading dashboard data:", err));
}
