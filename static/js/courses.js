/**
 * Public Courses Logic
 * Handles fetching and displaying courses on the public page
 */

const Courses = {
    courses: [],
    filters: {
        pilar: 'all',
        level: 'all',
        max_price: null
    },

    async init() {
        this.setupEventListeners();
        await this.loadCourses();
    },

    setupEventListeners() {
        // Filter: Pilar
        const pilarInputs = document.querySelectorAll('input[name="pilar"]');
        pilarInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.pilar = e.target.value;
                this.filterAndRender();
            });
        });

        // Filter: Level (if exists)
        const levelInputs = document.querySelectorAll('input[name="level"]');
        levelInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.filterAndRender();
            });
        });

        // Filter: Price Range
        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        if (priceRange && priceValue) {
            priceRange.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                priceValue.textContent = `R$ ${value}`;
                this.filters.max_price = value;
                // Debounce rendering for slider
                this.debouncedFilterAndRender();
            });
            // Initial call to set debounce
            this.debouncedFilterAndRender = Utils.debounce(() => this.filterAndRender(), 300);
        }
    },

    async loadCourses() {
        try {
            this.showLoading();

            // Fetch only active courses
            const response = await fetch('/api/courses.php?status=active');
            const result = await response.json();

            if (result.success) {
                this.courses = result.data;
                this.filterAndRender();
            } else {
                throw new Error(result.error || 'Failed to load courses');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showError('Não foi possível carregar os cursos. Tente novamente mais tarde.');
        }
    },

    filterAndRender() {
        let filtered = this.courses;

        // Filter by Pilar
        if (this.filters.pilar !== 'all') {
            filtered = filtered.filter(course => course.pilar === this.filters.pilar);
        }

        // Filter by Level
        if (this.filters.level !== 'all') {
            filtered = filtered.filter(course => course.level === this.filters.level);
        }

        // Filter by Price
        if (this.filters.max_price !== null) {
            filtered = filtered.filter(course => parseFloat(course.price) <= this.filters.max_price);
        }

        this.renderCourses(filtered);
    },

    renderCourses(coursesToRender) {
        const grid = document.getElementById('courses-grid');
        if (!grid) return;

        if (coursesToRender.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <span class="material-symbols-outlined text-6xl text-text-muted/30 mb-4">search_off</span>
                    <h3 class="text-xl font-bold text-text-main mb-2">Nenhum curso encontrado</h3>
                    <p class="text-text-muted">Tente ajustar seus filtros de busca.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = coursesToRender.map(course => this.createCourseCard(course)).join('');
    },

    createCourseCard(course) {
        const pilarColors = {
            'terapia-capilar': 'bg-pink-100 text-pink-800',
            'massagem': 'bg-orange-100 text-orange-800',
            'psicanalise': 'bg-purple-100 text-purple-800',
            'gestao': 'bg-blue-100 text-blue-800'
        };

        const pilarNames = {
            'terapia-capilar': 'Terapia Capilar',
            'massagem': 'Massagem',
            'psicanalise': 'Psicanálise',
            'gestao': 'Gestão'
        };

        return `
            <div class="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#f3e7eb] flex flex-col h-full">
                <!-- Image -->
                <div class="relative h-48 rounded-xl overflow-hidden mb-4 shrink-0">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                         style="background-image: url('${course.image_url || '/static/img/placeholder-course.jpg'}');">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    
                    <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-text-main shadow-sm">
                        ${pilarNames[course.pilar] || course.pilar}
                    </span>
                </div>

                <!-- Content -->
                <div class="flex-1 flex flex-col">
                    <h3 class="text-xl font-bold text-text-main mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        ${course.title}
                    </h3>
                    
                    <p class="text-text-muted text-sm mb-4 line-clamp-3 flex-1">
                        ${course.description || ''}
                    </p>

                    <!-- Meta -->
                    <div class="flex items-center gap-4 text-xs text-text-muted mb-4 pt-4 border-t border-[#f3e7eb]/50">
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">schedule</span>
                            ${course.duration_hours}h
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">school</span>
                            Certificado
                        </div>
                        <div class="flex items-center gap-1.5 ml-auto">
                            <span class="material-symbols-outlined text-[16px] text-yellow-500 fill-1">star</span>
                            5.0
                        </div>
                    </div>

                    <!-- Price & Action -->
                    <div class="flex items-center justify-between gap-3 mt-auto">
                        <div class="flex flex-col">
                            <span class="text-xs text-text-muted line-through">${course.original_price ? Utils.formatCurrency(course.original_price) : ''}</span>
                            <span class="text-2xl font-bold text-primary">${Utils.formatCurrency(course.price)}</span>
                        </div>
                        <a href="checkout.html?course_id=${course.id}" 
                           class="px-6 py-2.5 bg-text-main text-white rounded-xl font-medium hover:bg-primary transition-colors shadow-lg shadow-text-main/10 flex items-center gap-2 group/btn">
                            Matricular
                            <span class="material-symbols-outlined text-[18px] group-hover/btn:translate-x-0.5 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    showLoading() {
        const grid = document.getElementById('courses-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20">
                    <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                    <p class="text-text-muted">Carregando cursos incríveis...</p>
                </div>
            `;
        }
    },

    showError(message) {
        const grid = document.getElementById('courses-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <span class="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                    <p class="text-text-muted">${message}</p>
                    <button onclick="Courses.loadCourses()" class="mt-4 text-primary hover:underline">Tentar novamente</button>
                </div>
            `;
        }
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Courses.init());
} else {
    Courses.init();
}
