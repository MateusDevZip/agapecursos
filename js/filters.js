/**
 * Filtering and Search System for Courses and Library
 */

const FilterSystem = {
    // Initialize filters for courses page
    initCourseFilters() {
        const filterButtons = document.querySelectorAll('[data-filter]');
        const searchInput = document.querySelector('[data-search]');
        const courseCards = document.querySelectorAll('[data-course]');

        let activeFilters = {
            pilar: 'all',
            category: 'all',
            level: 'all',
            searchTerm: ''
        };

        // Filter button clicks
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterType = button.dataset.filterType;
                const filterValue = button.dataset.filter;

                // Update active filter
                activeFilters[filterType] = filterValue;

                // Update button styles
                document.querySelectorAll(`[data-filter-type="${filterType}"]`).forEach(btn => {
                    btn.classList.remove('active', 'bg-primary', 'text-white');
                    btn.classList.add('text-text-main', 'hover:bg-gray-100');
                });

                button.classList.add('active', 'bg-primary', 'text-white');
                button.classList.remove('text-text-main', 'hover:bg-gray-100');

                // Apply filters
                this.filterCourses(courseCards, activeFilters);
            });
        });

        // Search input
        if (searchInput) {
            const debouncedSearch = Utils.debounce((searchTerm) => {
                activeFilters.searchTerm = searchTerm.toLowerCase();
                this.filterCourses(courseCards, activeFilters);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    },

    filterCourses(courseCards, filters) {
        let visibleCount = 0;

        courseCards.forEach(card => {
            const pilar = card.dataset.pilar || '';
            const category = card.dataset.category || '';
            const level = card.dataset.level || '';
            const title = (card.dataset.title || '').toLowerCase();
            const description = (card.dataset.description || '').toLowerCase();

            const matchesPilar = filters.pilar === 'all' || pilar === filters.pilar;
            const matchesCategory = filters.category === 'all' || category === filters.category;
            const matchesLevel = filters.level === 'all' || level === filters.level;
            const matchesSearch = !filters.searchTerm ||
                title.includes(filters.searchTerm) ||
                description.includes(filters.searchTerm);

            if (matchesPilar && matchesCategory && matchesLevel && matchesSearch) {
                card.style.display = '';
                card.classList.add('fade-in');
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show no results message
        this.updateNoResults(visibleCount);
    },

    updateNoResults(count) {
        let noResultsEl = document.querySelector('[data-no-results]');

        if (count === 0) {
            if (!noResultsEl) {
                const container = document.querySelector('[data-courses-container]');
                if (container) {
                    noResultsEl = document.createElement('div');
                    noResultsEl.setAttribute('data-no-results', '');
                    noResultsEl.className = 'col-span-full text-center py-16';
                    noResultsEl.innerHTML = `
            <div class="flex flex-col items-center gap-4 text-gray-400">
              <span class="material-symbols-outlined text-6xl">search_off</span>
              <p class="text-xl font-medium">Nenhum curso encontrado</p>
              <p class="text-sm">Tente ajustar os filtros ou busca</p>
            </div>
          `;
                    container.appendChild(noResultsEl);
                }
            } else {
                noResultsEl.style.display = '';
            }
        } else if (noResultsEl) {
            noResultsEl.style.display = 'none';
        }
    },

    // Initialize filters for  library page
    initLibraryFilters() {
        const filterButtons = document.querySelectorAll('[data-library-filter]');
        const searchInput = document.querySelector('[data-library-search]');
        const libraryItems = document.querySelectorAll('[data-library-item]');

        let activeCategory = 'all';
        let searchTerm = '';

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                activeCategory = button.dataset.libraryFilter;

                // Update button styles
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-primary', 'text-white');
                });
                button.classList.add('active', 'bg-primary', 'text-white');

                this.filterLibraryItems(libraryItems, activeCategory, searchTerm);
            });
        });

        // Search
        if (searchInput) {
            const debouncedSearch = Utils.debounce((value) => {
                searchTerm = value.toLowerCase();
                this.filterLibraryItems(libraryItems, activeCategory, searchTerm);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Favorite toggle
        this.initFavorites();
    },

    filterLibraryItems(items, category, search) {
        let visibleCount = 0;

        items.forEach(item => {
            const itemCategory = item.dataset.category || '';
            const title = (item.dataset.title || '').toLowerCase();
            const author = (item.dataset.author || '').toLowerCase();

            const matchesCategory = category === 'all' || itemCategory === category;
            const matchesSearch = !search || title.includes(search) || author.includes(search);

            if (matchesCategory && matchesSearch) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        this.updateNoResults(visibleCount);
    },

    // Favorites system
    initFavorites() {
        const favoriteButtons = document.querySelectorAll('[data-favorite-toggle]');

        favoriteButtons.forEach(button => {
            const itemId = button.dataset.favoriteToggle;

            // Load favorite state from localStorage
            const favorites = this.getFavorites();
            if (favorites.includes(itemId)) {
                button.classList.add('active');
                const icon = button.querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            }

            // Toggle favorite
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const favorites = this.getFavorites();
                const index = favorites.indexOf(itemId);
                const icon = button.querySelector('.material-symbols-outlined');

                if (index > -1) {
                    // Remove from favorites
                    favorites.splice(index, 1);
                    button.classList.remove('active');
                    if (icon) icon.style.fontVariationSettings = "'FILL' 0";
                    Notifications.info('Removido dos favoritos');
                } else {
                    // Add to favorites
                    favorites.push(itemId);
                    button.classList.add('active');
                    if (icon) icon.style.fontVariationSettings = "'FILL' 1";
                    Notifications.success('Adicionado aos favoritos');
                }

                localStorage.setItem('agape_favorites', JSON.stringify(favorites));
            });
        });
    },

    getFavorites() {
        const favoritesStr = localStorage.getItem('agape_favorites');
        return favoritesStr ? JSON.parse(favoritesStr) : [];
    }
};

// ============================================
// SORTING SYSTEM
// ============================================

const SortSystem = {
    init() {
        const sortSelect = document.querySelector('[data-sort]');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const container = document.querySelector('[data-courses-container]');
            if (!container) return;

            const courses = Array.from(container.querySelectorAll('[data-course]'));

            courses.sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc':
                        return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                    case 'price-desc':
                        return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                    case 'title':
                        return a.dataset.title.localeCompare(b.dataset.title);
                    case 'recent':
                        return new Date(b.dataset.date) - new Date(a.dataset.date);
                    default:
                        return 0;
                }
            });

            // Reorder DOM
            courses.forEach(course => container.appendChild(course));

            // Add animation
            courses.forEach((course, index) => {
                course.style.animation = 'none';
                setTimeout(() => {
                    course.style.animation = `fadeIn 0.4s ease-out ${index * 0.05}s both`;
                }, 10);
            });
        });
    }
};

// ============================================
// VIEW TOGGLE (Grid/List)
// ============================================

const ViewToggle = {
    init() {
        const toggleButtons = document.querySelectorAll('[data-view-toggle]');
        const container = document.querySelector('[data-courses-container]');

        if (!toggleButtons.length || !container) return;

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.viewToggle;

                // Update button states
                toggleButtons.forEach(btn => btn.classList.remove('active', 'bg-primary', 'text-white'));
                button.classList.add('active', 'bg-primary', 'text-white');

                // Update container view
                if (view === 'grid') {
                    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
                } else {
                    container.className = 'flex flex-col gap-4';
                }

                // Save preference
                localStorage.setItem('agape_view_preference', view);
            });
        });

        // Load saved preference
        const savedView = localStorage.getItem('agape_view_preference');
        if (savedView) {
            const button = document.querySelector(`[data-view-toggle="${savedView}"]`);
            if (button) button.click();
        }
    }
};

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'cursos.html') {
        FilterSystem.initCourseFilters();
        SortSystem.init();
        ViewToggle.init();
    }

    if (currentPage === 'biblioteca.html') {
        FilterSystem.initLibraryFilters();
    }
});
