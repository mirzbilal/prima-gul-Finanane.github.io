// ============================================
// DASHBOARD UI MODULE
// ============================================

// Format currency in PKR
function formatPKR(amount) {
    return 'Rs ' + amount.toLocaleString('en-PK');
}

// Render the entire dashboard
function renderDashboard() {
    renderTable();
    calculateKPIs();
    renderChart();
}

// Render transactions table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (transactionsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="19" style="text-align: center; padding: 40px;">No transactions yet. Add your first transaction above!</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    transactionsData.forEach(transaction => {
        const row = document.createElement('tr');
        const formattedDate = new Date(transaction.date).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.debit ? formatPKR(transaction.debit) : '-'}</td>
            <td>${transaction.credit ? formatPKR(transaction.credit) : '-'}</td>
            <td>${transaction.factory ? formatPKR(transaction.factory) : '-'}</td>
            <td>${transaction.bikeFuel ? formatPKR(transaction.bikeFuel) : '-'}</td>
            <td>${transaction.carFuel ? formatPKR(transaction.carFuel) : '-'}</td>
            <td>${transaction.hasnain ? formatPKR(transaction.hasnain) : '-'}</td>
            <td>${transaction.shahzad ? formatPKR(transaction.shahzad) : '-'}</td>
            <td>${transaction.guestFood ? formatPKR(transaction.guestFood) : '-'}</td>
            <td>${transaction.food ? formatPKR(transaction.food) : '-'}</td>
            <td>${transaction.salaries ? formatPKR(transaction.salaries) : '-'}</td>
            <td>${transaction.advance ? formatPKR(transaction.advance) : '-'}</td>
            <td>${transaction.bills ? formatPKR(transaction.bills) : '-'}</td>
            <td>${transaction.extra ? formatPKR(transaction.extra) : '-'}</td>
            <td>${transaction.charity ? formatPKR(transaction.charity) : '-'}</td>
            <td>${transaction.maintenance ? formatPKR(transaction.maintenance) : '-'}</td>
            <td>${transaction.onlineAds ? formatPKR(transaction.onlineAds) : '-'}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${transaction.notes || ''}">
                ${transaction.notes ? '<i class="far fa-sticky-note"></i> ' + transaction.notes.substring(0, 30) + (transaction.notes.length > 30 ? '...' : '') : '-'}
            </td>
            <td>
                <button class="action-btn delete" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Calculate and update KPI cards
function calculateKPIs() {
    let totalDebit = 0;
    let totalCredit = 0;
    let totalExpenses = 0;
    
    transactionsData.forEach(t => {
        totalDebit += t.debit || 0;
        totalCredit += t.credit || 0;
        
        ENTITY_KEYS.forEach(key => {
            totalExpenses += t[key] || 0;
        });
    });
    
    const balance = totalCredit - totalDebit - totalExpenses;
    
    document.getElementById('totalDebit').innerText = formatPKR(totalDebit);
    document.getElementById('totalCredit').innerText = formatPKR(totalCredit);
    document.getElementById('totalExpenses').innerText = formatPKR(totalExpenses);
    document.getElementById('balance').innerText = formatPKR(balance);
}

// Render expense distribution chart
function renderChart() {
    const totals = {};
    ENTITY_KEYS.forEach(key => totals[key] = 0);
    
    transactionsData.forEach(t => {
        ENTITY_KEYS.forEach(key => {
            totals[key] += t[key] || 0;
        });
    });
    
    const values = ENTITY_KEYS.map(key => totals[key]);
    const total = values.reduce((a, b) => a + b, 0);
    
    const colors = ['#7367f0', '#ff9f43', '#28c76f', '#ea5455', '#00cfe8', 
                   '#7367f0', '#ff9f43', '#28c76f', '#ea5455', '#00cfe8',
                   '#7367f0', '#ff9f43', '#28c76f', '#ea5455'];
    
    // Render legend
    const legend = document.getElementById('chartLegend');
    legend.innerHTML = ENTITY_KEYS.map((key, i) => `
        <div class="legend-item">
            <span class="legend-color" style="background: ${colors[i]}"></span>
            <span>${key.replace(/([A-Z])/g, ' $1').trim()}</span>
        </div>
    `).join('');
    
    // Render stats
    const stats = document.getElementById('chartStats');
    stats.innerHTML = ENTITY_KEYS.map((key, i) => {
        const val = totals[key];
        const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        return `
            <div class="stat-item">
                <strong>${key.replace(/([A-Z])/g, ' $1').trim()}</strong><br>
                ${formatPKR(val)} (${percent}%)
            </div>
        `;
    }).join('');
    
    // Render chart
    if (chartInstance) chartInstance.destroy();
    
    const ctx = document.getElementById('expenseChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ENTITY_KEYS.map(k => k.replace(/([A-Z])/g, ' $1').trim()),
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 6
            }]
        },
        options: {
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const val = context.raw;
                            const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatPKR(val)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Add new transaction
async function addTransaction() {
    const date = document.getElementById('date').value;
    if (!date) {
        showNotification('Please select a date', 'warning');
        return;
    }
    
    const transaction = {
        date: date,
        debit: parseFloat(document.getElementById('debit').value) || 0,
        credit: parseFloat(document.getElementById('credit').value) || 0,
        factory: parseFloat(document.getElementById('factory').value) || 0,
        bikeFuel: parseFloat(document.getElementById('bikeFuel').value) || 0,
        carFuel: parseFloat(document.getElementById('carFuel').value) || 0,
        hasnain: parseFloat(document.getElementById('hasnain').value) || 0,
        shahzad: parseFloat(document.getElementById('shahzad').value) || 0,
        guestFood: parseFloat(document.getElementById('guestFood').value) || 0,
        food: parseFloat(document.getElementById('food').value) || 0,
        salaries: parseFloat(document.getElementById('salaries').value) || 0,
        advance: parseFloat(document.getElementById('advance').value) || 0,
        bills: parseFloat(document.getElementById('bills').value) || 0,
        extra: parseFloat(document.getElementById('extra').value) || 0,
        charity: parseFloat(document.getElementById('charity').value) || 0,
        maintenance: parseFloat(document.getElementById('maintenance').value) || 0,
        onlineAds: parseFloat(document.getElementById('onlineAds').value) || 0,
        notes: document.getElementById('notes').value || ''
    };
    
    const success = await saveTransaction(transaction);
    
    if (success) {
        // Clear form
        document.getElementById('date').value = '';
        document.getElementById('debit').value = '0';
        document.getElementById('credit').value = '0';
        ENTITY_KEYS.forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = '0';
        });
        document.getElementById('notes').value = '';
        
        renderDashboard();
    }
}

// Delete transaction
async function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        await deleteTransaction(id);
        renderDashboard();
    }
}

// Delete by date
async function deleteByDate() {
    const date = document.getElementById('deleteDate').value;
    if (!date) {
        showNotification('Please select a date', 'warning');
        return;
    }
    
    if (confirm(`Delete all transactions from ${date}? This action cannot be undone.`)) {
        await deleteTransactionsByDate(date);
        renderDashboard();
        document.getElementById('deleteDate').value = '';
    }
}

// Search/filter table
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Export to Excel
function exportToExcel() {
    const exportData = transactionsData.map(t => ({
        Date: t.date,
        Debit: t.debit,
        Credit: t.credit,
        Factory: t.factory,
        BikeFuel: t.bikeFuel,
        CarFuel: t.carFuel,
        Hasnain: t.hasnain,
        Shahzad: t.shahzad,
        GuestFood: t.guestFood,
        Food: t.food,
        Salaries: t.salaries,
        Advance: t.advance,
        Bills: t.bills,
        Extra: t.extra,
        Charity: t.charity,
        Maintenance: t.maintenance,
        OnlineAds: t.onlineAds,
        Notes: t.notes
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PrimaGul_Transactions');
    XLSX.writeFile(wb, `PrimaGul_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showNotification('Export completed!', 'success');
}

// Sync with cloud
async function syncWithCloud() {
    await loadTransactions();
    showNotification('Synced with cloud database!', 'success');
}

// Initialize dashboard
async function initializeDashboard() {
    await loadTransactions();
    
    // Add event listeners
    const saveBtn = document.getElementById('saveBtn');
    const deleteDateBtn = document.getElementById('deleteDateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const syncBtn = document.getElementById('syncBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (saveBtn) saveBtn.addEventListener('click', addTransaction);
    if (deleteDateBtn) deleteDateBtn.addEventListener('click', deleteByDate);
    if (exportBtn) exportBtn.addEventListener('click', exportToExcel);
    if (syncBtn) syncBtn.addEventListener('click', syncWithCloud);
    if (searchInput) searchInput.addEventListener('keyup', filterTable);
    
    // Set default date to today
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// Make functions global for inline onclick
window.deleteTransaction = deleteTransaction;