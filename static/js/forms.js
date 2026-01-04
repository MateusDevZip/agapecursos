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

        // Supabase Login
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        try {
            const { data, error } = await SupabaseAuth.login(email, password);

            if (data?.user) {
                Notifications.success('Login realizado com sucesso!');
                setTimeout(() => {
                    window.location.href = 'progresso.html';
                }, 1000);
            } else if (error) {
                Notifications.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
        } catch (error) {
            console.error('Erro:', error);
            Notifications.error('Erro de conexão com o servidor');
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    });
}

// ============================================
// REGISTER FORM
// ============================================

function initRegisterForm() {
    const registerForm = document.querySelector('#registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');

        if (!name || !email || !password) {
            Notifications.error('Preencha todos os campos obrigatórios');
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        try {
            const { data, error } = await SupabaseAuth.register(email, password, {
                full_name: name,
                phone: phone
            });

            if (data?.user) {
                if (data.session) {
                    Notifications.success('Cadastro realizado com sucesso! Redirecionando...');
                    setTimeout(() => {
                        window.location.href = 'progresso.html';
                    }, 1500);
                } else {
                    // User created but needs confirmation
                    Notifications.success('Cadastro realizado! Verifique seu email para confirmar sua conta.');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                }
            } else if (error) {
                Notifications.error(error.message || 'Erro ao cadastrar.');
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
        } catch (error) {
            console.error(error);
            Notifications.error('Erro de conexão');
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
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
    checkoutForm.addEventListener('submit', async (e) => {
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

            const selectedCourse = document.querySelector('input[name="course"]:checked').value;
            const user = Auth.getUser();

            if (!user) {
                Notifications.error('Faça login para continuar');
                window.location.href = 'login.html';
                return;
            }

            try {
                const response = await fetch('/api/checkout.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        course_id: selectedCourse,
                        amount: selectedCourse === 'combo' ? 497.00 : 297.00,
                        payment_method: document.querySelector('input[name="payment_method"]:checked').id,
                        customer: {
                            name: document.querySelector('input[name="name"]')?.value || user.user_metadata.full_name,
                            email: document.querySelector('input[name="email"]')?.value || user.email,
                            cpf: document.querySelector('input[name="cpf"]')?.value,
                            phone: document.querySelector('input[name="phone"]')?.value
                        },
                        card: (document.querySelector('input[name="payment_method"]:checked').id === 'pay_cc') ? {
                            number: document.querySelector('input[name="card_number"]')?.value,
                            holder_name: document.querySelector('input[name="card_holder"]')?.value,
                            expiry_month: document.querySelector('input[name="card_expiry"]')?.value?.split('/')[0],
                            expiry_year: document.querySelector('input[name="card_expiry"]')?.value?.split('/')[1],
                            ccv: document.querySelector('input[name="card_ccv"]')?.value
                        } : null
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    Notifications.success('Pedido criado com sucesso!');

                    // Handle specific payment methods
                    if (data.payment && data.payment.billingType === 'PIX') {
                        // Show Pix Modal or Redirect
                        // For now, let's just log or alert
                        console.log('Pix Payload:', data.payment.pix_qrcode);
                        // TODO: Implement a specific Pix Modal in HTML to show the QR Code
                        alert('Pagamento PIX gerado! Copie o código no console (implementação visual pendente).');
                    } else if (data.payment && data.payment.billingType === 'BOLETO') {
                        window.open(data.payment.bankSlipUrl, '_blank');
                    }

                    setTimeout(() => {
                        window.location.href = '#success-modal';
                    }, 1500);
                } else {
                    Notifications.error(data.error || 'Erro ao processar compra');
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-loading');
                }
            } catch (error) {
                console.error(error);
                Notifications.error('Erro na conexão');
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
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

function initGoogleLogin() {
    const googleButtons = document.querySelectorAll('.google-login-btn');

    googleButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            btn.classList.add('btn-loading');
            btn.disabled = true;

            try {
                const { error } = await SupabaseAuth.loginWithGoogle();
                if (error) throw error;
                // Redirect happens automatically
            } catch (error) {
                console.error(error);
                Notifications.error('Erro ao conectar com Google');
                btn.classList.remove('btn-loading');
                btn.disabled = false;
            }
        });
    });
}

// ============================================
// INIT ALL FORMS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initRegisterForm();
    initContactForm();
    initNewsletterForms();
    initCheckoutForm();
    initGoogleLogin();
});
