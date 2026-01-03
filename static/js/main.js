/**
 * Ágape Cursos - Main JavaScript
 * Sistema de navegação, menu mobile e funcionalidades core
 */

// ============================================
// NAVIGATION SYSTEM
// ============================================

const Navigation = {
  init() {
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupActiveNavLinks();
    this.updateAuthButtons();
    Auth.init(); // Initialize Auth Listeners
  },

  // Mobile Menu Toggle
  setupMobileMenu() {
    const mobileMenuButtons = document.querySelectorAll('[data-mobile-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const mobileOverlay = document.querySelector('[data-mobile-overlay]');

    if (!mobileMenuButtons.length) {
      // Create mobile menu elements if they don't exist
      this.createMobileMenu();
    }

    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-mobile-menu-toggle]');

      if (toggleBtn) {
        e.preventDefault();
        const menu = document.querySelector('[data-mobile-menu]');
        const overlay = document.querySelector('[data-mobile-overlay]');

        if (menu && overlay) {
          const isOpen = menu.classList.contains('active');

          if (isOpen) {
            this.closeMobileMenu();
          } else {
            this.openMobileMenu();
          }
        }
      }

      // Close menu when clicking overlay
      if (e.target.hasAttribute('data-mobile-overlay')) {
        this.closeMobileMenu();
      }

      // Close menu when clicking a link
      if (e.target.closest('[data-mobile-menu] a')) {
        this.closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });
  },

  createMobileMenu() {
    // Find all mobile menu buttons (usually hamburger icons)
    const hamburgerButtons = document.querySelectorAll('.md\\:hidden button');

    hamburgerButtons.forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon && icon.textContent.includes('menu')) {
        btn.setAttribute('data-mobile-menu-toggle', '');
      }
    });

    // Create mobile menu if it doesn't exist
    const header = document.querySelector('header');
    if (header && !document.querySelector('[data-mobile-menu]')) {
      const nav = header.querySelector('nav');
      if (nav) {
        const mobileMenuHTML = `
          <div data-mobile-overlay class="fixed inset-0 bg-black/50 z-40 opacity-0 invisible transition-all duration-300"></div>
          <div data-mobile-menu class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-background-dark shadow-2xl z-50 transform translate-x-full transition-transform duration-300 overflow-y-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-2 text-primary">
                  <span class="material-symbols-outlined text-3xl">spa</span>
                  <span class="text-xl font-bold text-secondary dark:text-white">Ágape Cursos</span>
                </div>
                <button data-mobile-menu-toggle class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                  <span class="material-symbols-outlined text-secondary dark:text-white">close</span>
                </button>
              </div>
              <nav class="flex flex-col gap-2">
                ${this.getMobileMenuLinks()}
              </nav>
            </div>
          </div>
        `;
        header.insertAdjacentHTML('afterend', mobileMenuHTML);
      }
    }
  },

  getMobileMenuLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const links = [
      { href: 'index.html', label: 'Início', icon: 'home' },
      { href: 'pilares.html', label: 'Pilares', icon: 'spa' },
      { href: 'cursos.html', label: 'Cursos', icon: 'school' },
      { href: 'sobre.html', label: 'Sobre', icon: 'info' },
      { href: 'contato.html', label: 'Contato', icon: 'mail' },
      { href: 'biblioteca.html', label: 'Biblioteca', icon: 'local_library' },
      { href: 'progresso.html', label: 'Meu Progresso', icon: 'trending_up' },
    ];

    return links.map(link => {
      const isActive = currentPage === link.href;
      return `
        <a href="${link.href}" class="flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary text-white' : 'text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'} transition-colors">
          <span class="material-symbols-outlined">${link.icon}</span>
          <span class="font-medium">${link.label}</span>
        </a>
      `;
    }).join('');
  },

  openMobileMenu() {
    const menu = document.querySelector('[data-mobile-menu]');
    const overlay = document.querySelector('[data-mobile-overlay]');

    if (menu && overlay) {
      menu.classList.add('active');
      overlay.classList.add('active');
      menu.style.transform = 'translateX(0)';
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      document.body.style.overflow = 'hidden';
    }
  },

  closeMobileMenu() {
    const menu = document.querySelector('[data-mobile-menu]');
    const overlay = document.querySelector('[data-mobile-overlay]');

    if (menu && overlay) {
      menu.classList.remove('active');
      overlay.classList.remove('active');
      menu.style.transform = 'translateX(100%)';
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }
  },

  // Smooth Scroll for anchor links
  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');

      if (link && link.getAttribute('href') !== '#') {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  },

  // Highlight active navigation links
  setupActiveNavLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav a, aside nav a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || href === `./${currentPage}`) {
        link.classList.add('active-nav-link');
        link.style.color = 'var(--primary, #D9808E)';
      }
    });
  },

  // Update auth buttons based on login state
  updateAuthButtons() {
    const isLoggedIn = Auth.isLoggedIn();
    const authButtons = document.querySelectorAll('[data-auth-button]');

    authButtons.forEach(button => {
      if (isLoggedIn) {
        button.textContent = 'Área do Aluno';
        button.onclick = () => window.location.href = 'progresso.html';
      } else {
        button.textContent = 'Entrar';
        button.onclick = () => window.location.href = 'login.html';
      }
    });
  }
};

// ============================================
// AUTHENTICATION SYSTEM (Simulated)
// ============================================

const Auth = {
  async isLoggedIn() {
    const user = await SupabaseAuth.getUser();
    return !!user;
  },

  async login(email, password) {
    const { data, error } = await SupabaseAuth.login(email, password);
    if (error) throw error;
    return data.user;
  },

  async logout() {
    await SupabaseAuth.logout();
    window.location.href = 'index.html';
  },

  async getUser() {
    return await SupabaseAuth.getUser();
  },

  async requireAuth() {
    const user = await this.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  // Initialize Auth State Listener
  init() {
    SupabaseAuth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('Usuário logado:', session.user.email);
        Navigation.updateAuthButtons(true);
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário deslogado');
        Navigation.updateAuthButtons(false);
      }
    });
  }
};

// ============================================
// NOTIFICATION SYSTEM
// ============================================

const Notifications = {
  show(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existing = document.querySelector('.agape-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `agape-notification agape-notification-${type}`;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    notification.innerHTML = `
      <span class="material-symbols-outlined">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    return notification;
  },

  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
};

// ============================================
// MODAL SYSTEM
// ============================================

const Modal = {
  open(modalId) {
    const modal = document.querySelector(`[data-modal="${modalId}"]`);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus trap
      const focusableElements = modal.querySelectorAll('button, a, input, textarea, select');
      if (focusableElements.length) {
        focusableElements[0].focus();
      }
    }
  },

  close(modalId) {
    const modal = modalId
      ? document.querySelector(`[data-modal="${modalId}"]`)
      : document.querySelector('[data-modal].active');

    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  init() {
    // Close modal on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-modal-overlay')) {
        this.close();
      }

      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        this.close();
      }
    });

    // Close modal on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }
};

// ============================================
// UTILITIES
// ============================================

const Utils = {
  // Debounce function for search/filter
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Validate email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Format currency
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  Modal.init();

  console.log('✅ Ágape Cursos - Sistema inicializado');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Navigation, Auth, Notifications, Modal, Utils };
}
