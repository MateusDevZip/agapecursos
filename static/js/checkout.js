/**
 * Checkout Logic
 * Handles dynamic course loading, progress steps, and Asaas payment integration
 */

const Checkout = {
    selectedCourse: null,
    currentStep: 1,

    async init() {
        this.loadUrlParams();
        await this.loadCourses();
        this.setupEventListeners();
        this.setupFormObservers();
        this.setupPaymentListener();

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // Optional: Store current URL to redirect back after login
            // window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        } else {
            // Pre-fill user data if available (could be fetched from Supabase profiles table)
        }
    },

    loadUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const courseId = params.get('course_id');
        if (courseId) {
            this.selectedCourseId = courseId;
        }
    },

    async loadCourses() {
        try {
            const container = document.getElementById('course-selection-container');
            if (!container) return;

            const response = await fetch('/api/courses.php?status=active');
            const result = await response.json();

            if (result.success) {
                this.renderCourseOptions(result.data, container);
            } else {
                throw new Error('Failed to load courses');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            Notifications.error('Erro ao carregar opções de cursos.');
        }
    },

    renderCourseOptions(courses, container) {
        if (courses.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Nenhum curso disponível no momento.</p>';
            return;
        }

        container.innerHTML = courses.map(course => `
            <label class="relative cursor-pointer group">
                <input type="radio" name="course" value="${course.id}" class="peer sr-only" 
                       ${this.selectedCourseId === course.id ? 'checked' : ''}>
                <div class="p-6 rounded-2xl border-2 border-[#f3e7eb] bg-white hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            ${course.pilar.replace('-', ' ').toUpperCase()}
                        </span>
                        <div class="w-6 h-6 rounded-full border-2 border-[#f3e7eb] peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                            <div class="w-2.5 h-2.5 bg-white rounded-full hidden peer-checked:block"></div>
                        </div>
                    </div>
                    <h3 class="font-bold text-text-main mb-2">${course.title}</h3>
                    <p class="text-sm text-text-muted mb-4 flex-1 line-clamp-2">${course.description || ''}</p>
                    <div class="flex items-end gap-2 mt-auto">
                        <span class="text-2xl font-bold text-primary">${Utils.formatCurrency(course.price)}</span>
                        ${course.original_price ? `<span class="text-sm text-gray-400 line-through mb-1">${Utils.formatCurrency(course.original_price)}</span>` : ''}
                    </div>
                </div>
            </label>
        `).join('');

        // Provide immediate feedback if a course was pre-selected from URL
        if (this.selectedCourseId) {
            const selectedCourse = courses.find(c => c.id === this.selectedCourseId);
            if (selectedCourse) {
                this.updateSummary(selectedCourse);
                this.enableNextStep();

                // If pre-selected, maybe auto-scroll to form or just update UI
            }
        }
    },

    setupEventListeners() {
        // Step Navigation
        document.querySelectorAll('[data-next-step]').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        document.querySelectorAll('.step-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const step = parseInt(e.currentTarget.dataset.step);
                // Only allow going back or to current step (unless next step is enabled)
                if (step < this.currentStep) {
                    this.goToStep(step);
                }
            });
        });

        // Course Selection Change
        const container = document.getElementById('course-selection-container');
        if (container) {
            container.addEventListener('change', (e) => {
                if (e.target.name === 'course') {
                    this.handleCourseSelection(e.target.value);
                }
            });
        }
    },

    setupFormObservers() {
        // Enable step 2 next button when form is valid
        const form = document.getElementById('personal-data-form');
        if (form) {
            form.addEventListener('input', () => {
                const isValid = form.checkValidity();
                const nextBtn = document.querySelector('[data-step-content="2"] [data-next-step]');
                if (nextBtn) nextBtn.disabled = !isValid;
            });
        }
    },

    async handleCourseSelection(courseId) {
        try {
            // Fetch clean course data to ensure price security
            const response = await fetch(`/api/courses.php?id=${courseId}`);
            const result = await response.json();

            if (result.success) {
                this.selectedCourse = result.data;
                document.getElementById('selected-course-id').value = courseId;
                this.updateSummary(this.selectedCourse);
                this.enableNextStep();

                // Auto advance after short delay for better UX
                setTimeout(() => this.nextStep(), 500);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
        }
    },

    updateSummary(course) {
        document.getElementById('summary-course-title').textContent = course.title;
        document.getElementById('summary-original-price').textContent = course.original_price ? Utils.formatCurrency(course.original_price) : Utils.formatCurrency(course.price);

        const original = parseFloat(course.original_price || course.price);
        const price = parseFloat(course.price);
        const discount = original - price;

        document.getElementById('summary-discount').textContent = discount > 0 ? `- ${Utils.formatCurrency(discount)}` : '- R$ 0,00';
        document.getElementById('summary-total').textContent = Utils.formatCurrency(price);

        const img = document.getElementById('summary-course-image');
        if (img && course.image_url) {
            img.style.backgroundImage = `url('${course.image_url}')`;
        }
    },

    enableNextStep() {
        const currentNextBtn = document.querySelector(`[data-step-content="${this.currentStep}"] [data-next-step]`);
        if (currentNextBtn) {
            currentNextBtn.disabled = false;
        }
    },

    nextStep() {
        if (this.currentStep < 3) {
            this.goToStep(this.currentStep + 1);
        }
    },


    async submitOrder() {
        try {
            const submitBtn = document.getElementById('btn-finish-payment');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Processando...';
            }

            // Collect Data
            const courseId = document.getElementById('selected-course-id').value;
            const personalData = this.collectFormData('personal-data-form'); // Assumes this function exists or we create it

            // Payment Data
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked').id.replace('pay_', '');
            let paymentData = { method: paymentMethod };

            if (paymentMethod === 'cc') {
                paymentData = {
                    ...paymentData,
                    holderName: document.querySelector('input[name="card_holder"]').value,
                    number: document.querySelector('input[name="card_number"]').value,
                    expiry: document.querySelector('input[name="card_expiry"]').value,
                    cvv: document.querySelector('input[name="card_cvv"]').value
                };
            }

            // Create Payload
            const payload = {
                course_id: courseId,
                customer: personalData,
                payment: paymentData
            };

            const response = await fetch('/api/checkout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                // Redirect to success or show modal logic from old code?
                // The old code had #success-modal. We can redirect to a thank you page or show that modal.
                // For now, let's redirect to a success page or update UI.
                if (result.paymentUrl) {
                    window.location.href = result.paymentUrl; // For Boleto/Pix sometimes redirect is better
                } else {
                    Notifications.success('Pagamento realizado com sucesso!');
                    // Show success modal
                    window.location.hash = 'success-modal';
                }
            } else {
                throw new Error(result.error || 'Falha no processamento');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            Notifications.error(error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Finalizar Compra <span class="material-symbols-outlined ml-2">arrow_forward</span>';
            }
        }
    },

    collectFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    },

    setupPaymentListener() {
        const finishBtn = document.getElementById('btn-finish-payment');
        if (finishBtn) {
            finishBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }
    },

    goToStep(step) {
        // Visual updates
        document.querySelectorAll('.step-trigger').forEach(trigger => {
            const s = parseInt(trigger.dataset.step);
            const circle = trigger.querySelector('.step-circle');
            const Line = trigger.querySelector('.step-line'); // Ensure you have lines to color if applicable for design

            if (s === step) {
                trigger.classList.add('active'); // Current step
                circle.classList.add('bg-primary', 'text-white', 'border-primary');
                circle.classList.remove('bg-white', 'text-gray-400', 'border-[#f3e7eb]', 'bg-green-500');
                circle.innerHTML = s;
            } else if (s < step) {
                trigger.classList.remove('active'); // Completed step
                circle.classList.add('bg-green-500', 'text-white', 'border-green-500');
                circle.classList.remove('bg-primary', 'border-primary', 'bg-white', 'text-gray-400');
                circle.innerHTML = '<span class="material-symbols-outlined text-sm">check</span>';
            } else {
                trigger.classList.remove('active'); // Future step
                circle.classList.add('bg-white', 'text-gray-400', 'border-[#f3e7eb]');
                circle.classList.remove('bg-primary', 'text-white', 'border-primary', 'bg-green-500', 'border-green-500');
                circle.innerHTML = s;
            }
        });

        // Content visibility
        document.querySelectorAll('[data-step-content]').forEach(content => {
            if (parseInt(content.dataset.stepContent) === step) {
                content.classList.remove('hidden');
                content.classList.add('block', 'animate-fade-in'); // Add animation class if available
            } else {
                content.classList.add('hidden');
                content.classList.remove('block');
            }
        });

        this.currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Checkout.init());
} else {
    Checkout.init();
}
