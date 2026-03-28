// ============================================
// AUTHENTICATION MODULE
// ============================================

// Hardcoded admin credentials (in production, use Supabase Auth)
const ADMIN_CREDENTIALS = {
    username: 'PrimaGul',
    password: 'itsprimagul2026'
};

// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('primaGulLoggedIn') === 'true';
    const loginPage = document.getElementById('loginPage');
    const dashboardApp = document.getElementById('dashboardApp');
    
    if (isLoggedIn) {
        loginPage.style.display = 'none';
        dashboardApp.style.display = 'block';
        return true;
    } else {
        loginPage.style.display = 'flex';
        dashboardApp.style.display = 'none';
        return false;
    }
}

// Handle login
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('primaGulLoggedIn', 'true');
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboardApp').style.display = 'block';
        
        // Initialize dashboard
        if (typeof initializeDashboard === 'function') {
            await initializeDashboard();
        }
        
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('primaGulLoggedIn');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardApp').style.display = 'none';
    showNotification('Logged out successfully', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        
        // Add animation styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set colors based on type
    const colors = {
        success: '#28c76f',
        error: '#ea5455',
        info: '#00cfe8',
        warning: '#ff9f43'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = '';
        }, 300);
    }, 3000);
}

// Initialize auth
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    // Add event listeners
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Enter key support
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
});