/**
 * Auth Guard for Admin Routes
 * verifies if the user is authenticated as an admin
 */

(async function checkAdminAuth() {
    // Check for Supabase session
    const { data: { session } } = await window.supabase.auth.getSession();

    // Check local marker (set in admin-login.html)
    const localAdmin = localStorage.getItem('agape_admin_user');

    if (!session || !localAdmin) {
        console.warn('Unauthorized access attempt to admin area. Redirecting...');
        // Save current URL to redirect back after login
        sessionStorage.setItem('admin_redirect_url', window.location.href);
        window.location.href = 'admin-login.html';
    } else {
        // Simple verification passed
        console.log('Admin access granted for:', session.user.email);
    }

    // Identify logout buttons and attach event
    document.addEventListener('DOMContentLoaded', () => {
        const logoutBtns = document.querySelectorAll('[data-admin-logout]');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair do painel?')) {
                    await window.supabase.auth.signOut();
                    localStorage.removeItem('agape_admin_user');
                    window.location.href = 'admin-login.html';
                }
            });
        });
    });
})();
