/**
 * Checkout Step Highlighting System
 * Highlights the active step as user progresses through checkout
 */

const CheckoutSteps = {
    currentStep: 1,

    init() {
        this.setupStepNavigation();
        this.setupFormObservers();
        this.setActiveStep(1);
    },

    setupStepNavigation() {
        const stepItems = document.querySelectorAll('.step-item');

        stepItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const step = parseInt(item.getAttribute('data-step'));
                this.setActiveStep(step);
                this.scrollToSection(step);
            });
        });
    },

    setupFormObservers() {
        // Monitor course selection
        const courseOptions = document.querySelectorAll('input[name="course"]');
        courseOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (this.currentStep === 1) {
                    setTimeout(() => {
                        this.setActiveStep(2);
                        this.scrollToSection(2);
                    }, 500);
                }
            });
        });

        // Monitor personal data form
        const personalDataInputs = document.querySelectorAll('#personal-data-form input, #personal-data-form select');
        let filledCount = 0;

        personalDataInputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim() !== '') {
                    filledCount++;

                    // Move to payment when 70% of fields are filled
                    if (filledCount >= personalDataInputs.length * 0.7 && this.currentStep === 2) {
                        setTimeout(() => {
                            this.setActiveStep(3);
                            this.scrollToSection(3);
                        }, 500);
                    }
                }
            });
        });
    },

    setActiveStep(step) {
        this.currentStep = step;
        const stepItems = document.querySelectorAll('.step-item');

        stepItems.forEach((item, index) => {
            const stepNumber = index + 1;
            const circle = item.querySelector('.step-circle');
            const label = item.querySelector('.step-label');

            if (stepNumber < step) {
                // Completed steps
                item.classList.remove('text-text-secondary');
                item.classList.add('text-primary');
                circle.classList.remove('border-border-color', 'bg-transparent', 'border-primary', 'bg-primary');
                circle.classList.add('border-primary', 'bg-primary', 'text-white');
                circle.innerHTML = '<span class="material-symbols-outlined text-sm">check</span>';
            } else if (stepNumber === step) {
                // Active step
                item.classList.remove('text-text-secondary');
                item.classList.add('text-primary', 'font-bold');
                circle.classList.remove('border-border-color', 'bg-transparent');
                circle.classList.add('border-primary', 'bg-primary', 'text-white', 'scale-110');
                circle.textContent = stepNumber;
            } else {
                // Future steps
                item.classList.remove('text-primary', 'font-bold');
                item.classList.add('text-text-secondary');
                circle.classList.remove('border-primary', 'bg-primary', 'text-white', 'scale-110');
                circle.classList.add('border-border-color', 'bg-transparent');
                circle.textContent = stepNumber;
            }
        });

        // Show/hide sections
        this.updateSectionVisibility(step);
    },

    updateSectionVisibility(step) {
        // Optional: Add smooth transitions between sections
        const sections = {
            1: document.querySelector('[data-section="courses"]'),
            2: document.querySelector('[data-section="personal-data"]'),
            3: document.querySelector('[data-section="payment"]')
        };

        Object.keys(sections).forEach(key => {
            const section = sections[key];
            if (section) {
                if (parseInt(key) === step) {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                } else {
                    section.style.opacity = '0.5';
                }
            }
        });
    },

    scrollToSection(step) {
        const sections = {
            1: document.querySelector('[data-section="courses"]'),
            2: document.querySelector('[data-section="personal-data"]'),
            3: document.querySelector('[data-section="payment"]')
        };

        const section = sections[step];
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CheckoutSteps.init());
} else {
    CheckoutSteps.init();
}
