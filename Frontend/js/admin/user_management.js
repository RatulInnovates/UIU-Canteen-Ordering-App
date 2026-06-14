// Frontend/js/admin/user_management.js
document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();

    // Setup real-time search
    const userSearch = document.getElementById("userSearch");
    if (userSearch) {
        userSearch.addEventListener("input", () => {
            const query = userSearch.value.toLowerCase();
            const rows = document.querySelectorAll("#userListBody tr");
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    }
});

function fetchUsers() {
    const tbody = document.getElementById("userListBody");
    if (!tbody) return;

    fetch("../../../backend/admin/users.php")
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                const data = resData.data;
                const users = data.users;
                const counts = data.counts;

                // Update Stats
                document.getElementById("countTotal").textContent = counts.total;
                document.getElementById("countStudent").textContent = counts.student;
                document.getElementById("countStaff").textContent = counts.staff;

                // Render Table
                if (users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">No users registered in database.</td></tr>';
                    return;
                }

                tbody.innerHTML = '';
                users.forEach(user => {
                    const studentIdVal = user.student_id ? user.student_id : 'N/A';
                    const roleBadgeClass = `badge-${user.role}`;
                    
                    const html = `
                        <tr data-id="${user.id}">
                            <td>#USR-${user.id}</td>
                            <td class="user-name-cell">${user.name}</td>
                            <td class="user-email-cell">${user.email}</td>
                            <td>${studentIdVal}</td>
                            <td><span class="badge ${roleBadgeClass}">${user.role.toUpperCase()}</span></td>
                            <td>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <select class="select-role" onchange="changeUserRole(${user.id}, this.value)">
                                        <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                    <button class="btn-sm btn-delete" onclick="deleteUser(${user.id})">Remove</button>
                                </div>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += html;
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Failed to load users: ${resData.message}</td></tr>`;
            }
        })
        .catch(err => {
            console.error('Error fetching users:', err);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Server connection error.</td></tr>';
        });
}

function changeUserRole(id, newRole) {
    const formData = new FormData();
    formData.append('action', 'change_role');
    formData.append('id', id);
    formData.append('role', newRole);

    fetch("../../../backend/admin/users.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            fetchUsers();
        } else {
            alert('Failed to update role: ' + data.message);
        }
    })
    .catch(err => console.error('Error changing role:', err));
}

function deleteUser(id) {
    if (!confirm('Are you sure you want to remove this user from the system?')) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    fetch("../../../backend/admin/users.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            fetchUsers();
        } else {
            alert('Failed to delete user: ' + data.message);
        }
    })
    .catch(err => console.error('Error deleting user:', err));
}
