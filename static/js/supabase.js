/**
 * Supabase Client Configuration
 */

const SUPABASE_URL = 'https://wqvwlyezekvahpfnspxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxdndseWV6ZWt2YWhwZm5zcHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTg1ODYsImV4cCI6MjA4MjAzNDU4Nn0._HAfasYbQAlKDuK4a2xVXMo1kJLesr4gxWAMg9MBsTY';

// Initialize Supabase Client
// Note: The script tag for @supabase/supabase-js must be included in the HTML before this file
const supabaseForClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SupabaseAuth = {
    // Login with Email
    async login(email, password) {
        const { data, error } = await supabaseForClient.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Register with Email
    async register(email, password, userData) {
        const { data, error } = await supabaseForClient.auth.signUp({
            email,
            password,
            options: {
                data: userData // saves name, phone etc to user_metadata
            }
        });
        return { data, error };
    },

    // Logout
    async logout() {
        const { error } = await supabaseForClient.auth.signOut();
        // Clear local storage legacy items if any
        localStorage.removeItem('agape_user');
        return { error };
    },

    // Get Current User
    async getUser() {
        const { data: { user } } = await supabaseForClient.auth.getUser();
        return user;
    },

    // Listen for Auth Changes
    onAuthStateChange(callback) {
        supabaseForClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};
