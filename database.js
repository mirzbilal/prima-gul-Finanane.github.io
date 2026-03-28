// ============================================
// DATABASE OPERATIONS MODULE
// ============================================

let transactionsData = [];
let chartInstance = null;

// Update database status display
function updateDatabaseStatus(connected, message = '') {
    const statusEl = document.getElementById('dbStatus');
    if (!statusEl) return;
    
    if (connected) {
        statusEl.innerHTML = '<i class="fas fa-database"></i> <span>Connected to Cloud</span>';
        statusEl.className = 'db-status connected';
    } else {
        statusEl.innerHTML = `<i class="fas fa-database"></i> <span>${message || 'Offline Mode'}</span>`;
        statusEl.className = 'db-status error';
    }
}

// Load transactions from Supabase
async function loadTransactions() {
    const tbody = document.getElementById('tableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="19" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading transactions...</td></tr>';
    }
    
    try {
        const { data, error } = await window.supabaseClient
            .from(TABLE_NAME)
            .select('*')
            .order('date', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            // Convert database column names to JavaScript property names
            transactionsData = data.map(item => ({
                id: item.id,
                date: item.date,
                debit: item.debit || 0,
                credit: item.credit || 0,
                factory: item.factory || 0,
                bikeFuel: item.bike_fuel || 0,
                carFuel: item.car_fuel || 0,
                hasnain: item.hasnain || 0,
                shahzad: item.shahzad || 0,
                guestFood: item.guest_food || 0,
                food: item.food || 0,
                salaries: item.salaries || 0,
                advance: item.advance || 0,
                bills: item.bills || 0,
                extra: item.extra || 0,
                charity: item.charity || 0,
                maintenance: item.maintenance || 0,
                onlineAds: item.online_ads || 0,
                notes: item.notes || ''
            }));
            
            updateDatabaseStatus(true);
        } else {
            // No data found, create sample
            await createSampleData();
        }
        
        // Trigger render
        if (typeof renderDashboard === 'function') {
            renderDashboard();
        }
        
        return transactionsData;
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        updateDatabaseStatus(false, 'Connection Failed');
        
        // Fallback to localStorage
        const localData = localStorage.getItem('primaGulTransactions');
        if (localData) {
            transactionsData = JSON.parse(localData);
            if (typeof renderDashboard === 'function') renderDashboard();
        }
        
        return transactionsData;
    }
}

// Save transaction to Supabase
async function saveTransaction(transaction) {
    try {
        // Convert property names to database column names
        const dbTransaction = {
            date: transaction.date,
            debit: transaction.debit || 0,
            credit: transaction.credit || 0,
            factory: transaction.factory || 0,
            bike_fuel: transaction.bikeFuel || 0,
            car_fuel: transaction.carFuel || 0,
            hasnain: transaction.hasnain || 0,
            shahzad: transaction.shahzad || 0,
            guest_food: transaction.guestFood || 0,
            food: transaction.food || 0,
            salaries: transaction.salaries || 0,
            advance: transaction.advance || 0,
            bills: transaction.bills || 0,
            extra: transaction.extra || 0,
            charity: transaction.charity || 0,
            maintenance: transaction.maintenance || 0,
            online_ads: transaction.onlineAds || 0,
            notes: transaction.notes || ''
        };
        
        const { data, error } = await window.supabaseClient
            .from(TABLE_NAME)
            .insert([dbTransaction])
            .select();
        
        if (error) throw error;
        
        // Add to local data
        if (data && data[0]) {
            const newTransaction = {
                id: data[0].id,
                ...transaction
            };
            transactionsData.unshift(newTransaction);
        }
        
        // Backup to localStorage
        localStorage.setItem('primaGulTransactions', JSON.stringify(transactionsData));
        
        showNotification('Transaction saved successfully!', 'success');
        return true;
        
    } catch (error) {
        console.error('Error saving transaction:', error);
        
        // Fallback to localStorage
        transaction.id = Date.now();
        transactionsData.unshift(transaction);
        localStorage.setItem('primaGulTransactions', JSON.stringify(transactionsData));
        
        showNotification('Saved locally (offline mode)', 'warning');
        return false;
    }
}

// Delete transaction from Supabase
async function deleteTransaction(id) {
    try {
        const { error } = await window.supabaseClient
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // Remove from local data
        transactionsData = transactionsData.filter(t => t.id !== id);
        localStorage.setItem('primaGulTransactions', JSON.stringify(transactionsData));
        
        showNotification('Transaction deleted successfully!', 'success');
        return true;
        
    } catch (error) {
        console.error('Error deleting transaction:', error);
        
        // Fallback to localStorage
        transactionsData = transactionsData.filter(t => t.id !== id);
        localStorage.setItem('primaGulTransactions', JSON.stringify(transactionsData));
        
        showNotification('Deleted locally (offline mode)', 'warning');
        return false;
    }
}

// Delete by date from Supabase
async function deleteTransactionsByDate(date) {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('date', date);
        
        if (error) throw error;
        
        // Remove from local data
        transactionsData = transactionsData.filter(t => t.date !== date);
        localStorage.setItem('primaGulTransactions', JSON.stringify(transactionsData));
        
        showNotification(`All transactions from ${date} deleted!`, 'success');
        return true;
        
    } catch (error) {
        console.error('Error deleting by date:', error);
        
        // Fallback to localStorage
        transactionsData = transactionsData.filter(t => t.date !== date);
        localStorage.setItem('primaGulTransactions', JSON.stringify(transactionsData));
        
        showNotification('Deleted locally (offline mode)', 'warning');
        return false;
    }
}

// Create sample data if table is empty
async function createSampleData() {
    const today = new Date().toISOString().split('T')[0];
    const sampleTransaction = {
        date: today,
        debit: 50000,
        credit: 200000,
        factory: 42000,
        bikeFuel: 1500,
        carFuel: 5000,
        hasnain: 10000,
        shahzad: 8000,
        guestFood: 3000,
        food: 6000,
        salaries: 85000,
        advance: 5000,
        bills: 12000,
        extra: 2000,
        charity: 1000,
        maintenance: 4000,
        onlineAds: 52000,
        notes: 'Welcome to Prima Gul Financial System!'
    };
    
    await saveTransaction(sampleTransaction);
}