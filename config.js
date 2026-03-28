// ============================================
// SUPABASE CONFIGURATION
// ============================================

// Your Supabase Project URL
const SUPABASE_URL = 'https://oktfdaheerpamjbirlyn.supabase.co';

// Your Supabase Anon Key (Public key - safe to use in frontend)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGZkYWhlZXJwYW1qYmlybHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzEyMTQsImV4cCI6MjA4ODkwNzIxNH0.WPf_ub0MCazqPDf77SemD-k_-Rn0PXAo3dkFwR-jtAQ';

// Initialize Supabase client
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Entity keys for expense categories
const ENTITY_KEYS = [
    'factory', 'bikeFuel', 'carFuel', 'hasnain', 'shahzad', 'guestFood', 'food',
    'salaries', 'advance', 'bills', 'extra', 'charity', 'maintenance', 'onlineAds'
];

// Database table name
const TABLE_NAME = 'transactions';

console.log('Supabase initialized successfully');