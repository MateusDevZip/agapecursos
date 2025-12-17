/**
 * Form Validation and Handling
 */

const FormValidator = {
    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate required field
    validateRequired(value) {
        return value.trim().length > 0;
    },

    // Validate min length
    validateMinLength(value, minLength) {
        return value.length >= minLength;
    },

    // Validate phone
    validatePhone(phone) {
        const re = /^[\d\s\-\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    // Show error
    showError(input, message) {
        const formGroup = input.closest('.form-group') || input.parentElement;

        // Remove existing error
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) existingError.remove();

        // Add error class
        input.classList.add('error');
        input.classList.remove('success');

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 16px;">error</span>
      <span>${message}</span>
    `;
        formGroup.appendChild(errorDiv);
    },

    // Show success
    showSuccess(input) {
        const formGroup = input.closest('.form-group') || input.parentElement;

        // Remove existing error
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) existingError.remove();

        // Add success class
        input.classList.remove('error');
        input.classList.add('success');
    },

    // Clear validation
    clearValidation(input) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) existingError.remove();
        input.classList.remove('error', 'success');
    }
};

// ============================================
// LOGIN FORM
// ============================================

function initLoginForm() {
    const loginForm = document.querySelector('#loginForm');
    if (!loginForm) return;

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const togglePasswordBtn = document.querySelector('#togglePassword');

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = togglePasswordBtn.querySelector('.material-symbols-outlined');
            icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    }

    // Real-time validation
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (!emailInput.value) {
                FormValidator.showError(emailInput, 'Email é obrigatório');
            } else if (!FormValidator.validateEmail(emailInput.value)) {
                FormValidator.showError(emailInput, 'Email inválido');
            } else {
                FormValidator.showSuccess(emailInput);
            }
        });

        emailInput.addEventListener('input', () => {
            if (emailInput.classList.contains('error')) {
                FormValidator.clearValidation(emailInput);
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
            if (!passwordInput.value) {
                FormValidator.showError(passwordInput, 'Senha é obrigatória');
            } else if (passwordInput.value.length < 6) {
                FormValidator.showError(passwordInput, 'Senha deve ter no mínimo 6 caracteres');
            } else {
                FormValidator.showSuccess(passwordInput);
            }
        });
    }

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        let isValid = true;

        // Validate email
        if (!email) {
            FormValidator.showError(emailInput, 'Email é obrigatório');
            isValid = false;
        } else if (!FormValidator.validateEmail(email)) {
            FormValidator.showError(emailInput, 'Email inválido');
            isValid = false;
        }

        // Validate password
        if (!password) {
            FormValidator.showError(passwordInput, 'Senha é obrigatória');
            isValid = false;
        } else if (password.length < 6) {
            FormValidator.showError(passwordInput, 'Senha deve ter no mínimo 6 caracteres');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            Auth.login(email, password);
            Notifications.success('Login realizado com sucesso!');

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'progresso.html';
            }, 1000);
        }, 1000);
    });
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const contactForm = document.querySelector('#contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        let isValid = true;

        // Validate all fields
        Object.keys(data).forEach(key => {
            const input = contactForm.querySelector(`[name="${key}"]`);

            if (!data[key]) {
                FormValidator.showError(input, 'Este campo é obrigatório');
                isValid = false;
            } else if (key === 'email' && !FormValidator.validateEmail(data[key])) {
                FormValidator.showError(input, 'Email inválido');
                isValid = false;
            } else if (key === 'phone' && !FormValidator.validatePhone(data[key])) {
                FormValidator.showError(input, 'Telefone inválido');
                isValid = false;
            } else {
                FormValidator.showSuccess(input);
            }
        });

        if (!isValid) return;

        // Show loading
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            Notifications.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            contactForm.reset();
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;

            // Clear all validations
            contactForm.querySelectorAll('input, textarea, select').forEach(input => {
                FormValidator.clearValidation(input);
            });
        }, 1500);
    });
}

// ============================================
// NEWSLETTER FORM
// ============================================

function initNewsletterForms() {
    const newsletterForms = document.querySelectorAll('[data-newsletter-form]');

    newsletterForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (!email) {
                Notifications.error('Por favor, insira seu email');
                return;
            }

            if (!FormValidator.validateEmail(email)) {
                Notifications.error('Por favor, insira um email válido');
                return;
            }

            // Show loading
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                Notifications.success('Obrigado por se inscrever! Você receberá novidades em breve.');
                emailInput.value = '';
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }, 1000);
        });
    });
}

// ============================================
// CHECKOUT FORM
// ============================================

function initCheckoutForm() {
    const checkoutForm = document.querySelector('#checkoutForm');
    if (!checkoutForm) return;

    // Coupon application
    const couponInput = document.querySelector('#couponCode');
    const applyCouponBtn = document.querySelector('#applyCoupon');

    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim();

            if (!code) {
                Notifications.error('Digite um cupom válido');
                return;
            }

            // Simulate coupon validation
            const validCoupons = {
                'AGAPE10': 0.10,
                'AGAPE20': 0.20,
                'BEMVINDO': 0.15
            };

            if (validCoupons[code.toUpperCase()]) {
                const discount = validCoupons[code.toUpperCase()];
                Notifications.success(`Cupom aplicado! ${discount * 100}% de desconto`);

                // Update price display
                updateCheckoutPrice(discount);
            } else {
                Notifications.error('Cupom inválido ou expirado');
            }
        });
    }

    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            // Show/hide payment specific fields
            document.querySelectorAll('[data-payment-method]').forEach(section => {
                section.style.display = 'none';
            });

            const selectedMethod = document.querySelector(`[data-payment-method="${e.target.value}"]`);
            if (selectedMethod) {
                selectedMethod.style.display = 'block';
            }
        });
    });

    // Form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        const requiredFields = checkoutForm.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value) {
                FormValidator.showError(field, 'Este campo é obrigatório');
                isValid = false;
            } else {
                FormValidator.showSuccess(field);
            }
        });

        if (!isValid) {
            Notifications.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Show confirmation modal
        if (confirm('Confirmar compra?')) {
            const submitBtn = checkoutForm.querySelector('button[type="submit"]');
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                Notifications.success('Compra realizada com sucesso! Você receberá um email de confirmação.');

                setTimeout(() => {
                    window.location.href = 'progresso.html';
                }, 2000);
            }, 1500);
        }
    });
}

function updateCheckoutPrice(discount) {
    const priceElements = document.querySelectorAll('[data-price]');
    priceElements.forEach(el => {
        const originalPrice = parseFloat(el.dataset.originalPrice || el.dataset.price);
        const newPrice = originalPrice * (1 - discount);
        el.textContent = Utils.formatCurrency(newPrice);

        if (!el.dataset.originalPrice) {
            el.dataset.originalPrice = originalPrice;
        }
    });
}

// ============================================
// INIT ALL FORMS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initContactForm();
    initNewsletterForms();
    initCheckoutForm();
});
