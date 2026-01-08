/**
 * Admin Courses Management
 * Handles CRUD operations for courses in the admin panel
 */

const AdminCourses = {
    courses: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalCourses: 0,
    filters: {
        pilar: null,
        search: '',
        status: 'all'
    },

    async init() {
        this.setupEventListeners();
        await this.loadCourses();
        this.setupModal();
    },

    setupEventListeners() {
        // Add new course button
        const addBtn = document.querySelector('[data-add-course]');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Search input
        const searchInput = document.querySelector('[data-search-courses]');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filters.search = e.target.value;
                this.loadCourses();
            }, 500));
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('[data-filter-pilar]');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pilar = e.target.dataset.filterPilar;
                this.filters.pilar = pilar === 'all' ? null : pilar;

                // Update active state
                filterBtns.forEach(b => b.classList.remove('bg-primary', 'text-white'));
                e.target.classList.add('bg-primary', 'text-white');

                this.loadCourses();
            });
        });
    },

    async loadCourses() {
        try {
            this.showLoading();

            // Build query parameters
            const params = new URLSearchParams();
            params.append('status', 'all'); // Admin sees all statuses

            if (this.filters.pilar) {
                params.append('pilar', this.filters.pilar);
            }

            if (this.filters.search) {
                params.append('search', this.filters.search);
            }

            params.append('limit', this.itemsPerPage);
            params.append('offset', (this.currentPage - 1) * this.itemsPerPage);

            const response = await fetch(`/api/courses.php?${params}`);
            const result = await response.json();

            if (result.success) {
                this.courses = result.data;
                this.renderCourses();
            } else {
                throw new Error(result.error || 'Failed to load courses');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            Notifications.error('Erro ao carregar cursos: ' + error.message);
        } finally {
            this.hideLoading();
        }
    },

    renderCourses() {
        const tbody = document.querySelector('[data-courses-table] tbody');
        if (!tbody) return;

        if (this.courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-text-muted">
                        <span class="material-symbols-outlined text-4xl mb-2 block">school</span>
                        <p>Nenhum curso encontrado</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.courses.map(course => this.renderCourseRow(course)).join('');

        // Attach event listeners to action buttons
        this.attachRowEventListeners();
    },

    renderCourseRow(course) {
        const pilarColors = {
            'terapia-capilar': 'bg-pink-100 text-pink-800',
            'massagem': 'bg-orange-100 text-orange-800',
            'psicanalise': 'bg-purple-100 text-purple-800',
            'gestao': 'bg-blue-100 text-blue-800'
        };

        const pilarLabels = {
            'terapia-capilar': 'Terapia Capilar',
            'massagem': 'Massagem',
            'psicanalise': 'Psicanálise',
            'gestao': 'Gestão'
        };

        const statusColor = course.status === 'active' ? 'bg-green-500' : 'bg-gray-400';

        return `
            <tr class="group hover:bg-[#fffcfd] transition-colors" data-course-id="${course.id}">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-lg bg-cover bg-center shrink-0 border border-secondary"
                             style="background-image: url('${course.image_url || '/static/img/placeholder-course.jpg'}');">
                        </div>
                        <div>
                            <p class="font-semibold text-text-main">${course.title}</p>
                            <p class="text-xs text-text-muted">ID: ${course.id.substring(0, 8)}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${pilarColors[course.pilar] || 'bg-gray-100 text-gray-800'}">
                        ${pilarLabels[course.pilar] || course.pilar}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-text-main">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-text-muted text-[18px]">schedule</span>
                        ${course.duration_hours || 0} Horas
                    </div>
                </td>
                <td class="px-6 py-4">
                    <p class="font-bold text-text-main">${Utils.formatCurrency(course.price)}</p>
                    ${course.original_price ? `<p class="text-xs text-text-muted line-through">${Utils.formatCurrency(course.original_price)}</p>` : ''}
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex size-2.5 rounded-full ${statusColor} ring-2 ring-${statusColor === 'bg-green-500' ? 'green' : 'gray'}-100"></span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                        <button class="size-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-primary hover:text-white transition-colors"
                                data-edit-course="${course.id}" title="Editar">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button class="size-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                                data-delete-course="${course.id}" title="Excluir">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    attachRowEventListeners() {
        // Edit buttons
        document.querySelectorAll('[data-edit-course]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = e.currentTarget.dataset.editCourse;
                const course = this.courses.find(c => c.id === courseId);
                if (course) this.openModal(course);
            });
        });

        // Delete buttons
        document.querySelectorAll('[data-delete-course]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = e.currentTarget.dataset.deleteCourse;
                this.confirmDelete(courseId);
            });
        });
    },

    setupModal() {
        const modal = document.querySelector('[data-modal="course-form"]');
        if (!modal) this.createModal();

        // Close modal handlers
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-close-modal')) {
                this.closeModal();
            }
        });
    },

    createModal() {
        const modalHTML = `
            <div data-modal="course-form" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm items-center justify-center p-4 hidden">
                <div class="bg-white dark:bg-[#2a1d17] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white dark:bg-[#2a1d17] border-b border-border-color px-6 py-4 flex items-center justify-between">
                        <h3 class="text-xl font-bold text-text-main dark:text-white" data-modal-title>Novo Curso</h3>
                        <button data-close-modal class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                            <span class="material-symbols-outlined text-text-main dark:text-white">close</span>
                        </button>
                    </div>
                    
                    <form data-course-form class="p-6 space-y-4">
                        <input type="hidden" name="id" />
                        
                        <div>
                            <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                Título do Curso *
                            </label>
                            <input type="text" name="title" required
                                   class="form-input w-full rounded-lg border-border-color focus:border-primary focus:ring-primary"
                                   placeholder="Ex: Master em Tricologia" />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                Descrição
                            </label>
                            <textarea name="description" rows="3"
                                      class="form-input w-full rounded-lg border-border-color focus:border-primary focus:ring-primary"
                                      placeholder="Descreva o curso..."></textarea>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                    Pilar *
                                </label>
                                <select name="pilar" required
                                        class="form-select w-full rounded-lg border-border-color focus:border-primary focus:ring-primary">
                                    <option value="">Selecione...</option>
                                    <option value="terapia-capilar">Terapia Capilar</option>
                                    <option value="massagem">Massagem</option>
                                    <option value="psicanalise">Psicanálise</option>
                                    <option value="gestao">Gestão</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                    Nível
                                </label>
                                <select name="level"
                                        class="form-select w-full rounded-lg border-border-color focus:border-primary focus:ring-primary">
                                    <option value="">Selecione...</option>
                                    <option value="iniciante">Iniciante</option>
                                    <option value="avancado">Avançado</option>
                                    <option value="profissionalizante">Profissionalizante</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                    Duração (horas)
                                </label>
                                <input type="number" name="duration_hours" min="0"
                                       class="form-input w-full rounded-lg border-border-color focus:border-primary focus:ring-primary"
                                       placeholder="40" />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                    Preço (R$) *
                                </label>
                                <input type="number" name="price" step="0.01" min="0" required
                                       class="form-input w-full rounded-lg border-border-color focus:border-primary focus:ring-primary"
                                       placeholder="297.00" />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                    Preço Original (R$)
                                </label>
                                <input type="number" name="original_price" step="0.01" min="0"
                                       class="form-input w-full rounded-lg border-border-color focus:border-primary focus:ring-primary"
                                       placeholder="397.00" />
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                URL da Imagem
                            </label>
                            <input type="url" name="image_url"
                                   class="form-input w-full rounded-lg border-border-color focus:border-primary focus:ring-primary"
                                   placeholder="https://..." />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-main dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select name="status"
                                    class="form-select w-full rounded-lg border-border-color focus:border-primary focus:ring-primary">
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                                <option value="draft">Rascunho</option>
                            </select>
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="submit"
                                    class="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                Salvar Curso
                            </button>
                            <button type="button" data-close-modal
                                    class="px-6 py-3 rounded-lg border border-border-color text-text-main hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submission
        const form = document.querySelector('[data-course-form]');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourse(new FormData(form));
        });
    },

    openModal(course = null) {
        const modal = document.querySelector('[data-modal="course-form"]');
        const form = document.querySelector('[data-course-form]');
        const title = document.querySelector('[data-modal-title]');

        if (course) {
            title.textContent = 'Editar Curso';
            // Populate form
            Object.keys(course).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = course[key] || '';
            });
        } else {
            title.textContent = 'Novo Curso';
            form.reset();
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeModal() {
        const modal = document.querySelector('[data-modal="course-form"]');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    async saveCourse(formData) {
        try {
            const courseData = {};
            for (let [key, value] of formData.entries()) {
                if (value && key !== 'id') {
                    courseData[key] = value;
                }
            }

            const courseId = formData.get('id');
            const isEdit = courseId && courseId !== '';

            const url = isEdit ? `/api/courses.php?id=${courseId}` : '/api/courses.php';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });

            const result = await response.json();

            if (result.success) {
                Notifications.success(isEdit ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
                this.closeModal();
                await this.loadCourses();
            } else {
                throw new Error(result.error || 'Erro ao salvar curso');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            Notifications.error('Erro ao salvar curso: ' + error.message);
        }
    },

    confirmDelete(courseId) {
        if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
            this.deleteCourse(courseId);
        }
    },

    async deleteCourse(courseId) {
        try {
            const response = await fetch(`/api/courses.php?id=${courseId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                Notifications.success('Curso excluído com sucesso!');
                await this.loadCourses();
            } else {
                throw new Error(result.error || 'Erro ao excluir curso');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            Notifications.error('Erro ao excluir curso: ' + error.message);
        }
    },

    showLoading() {
        const tbody = document.querySelector('[data-courses-table] tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                        <div class="flex items-center justify-center gap-2 text-primary">
                            <span class="material-symbols-outlined animate-spin">progress_activity</span>
                            <span>Carregando cursos...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    },

    hideLoading() {
        // Loading is replaced by actual content in renderCourses
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminCourses.init());
} else {
    AdminCourses.init();
}
