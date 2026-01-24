document.addEventListener('DOMContentLoaded', () => {
    
    // Force scroll to top on load
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ==========================================
    // 1. THEME TOGGLE LOGIC (REMOVED)
    // ==========================================
    // Forced Light Theme
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');

    /* Theme Toggle Button Removed from UI */

    // ==========================================
    // 4. ADVANCED BUTTON EFFECTS
    // ==========================================
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            const diameter = Math.max(button.clientWidth, button.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - (button.getBoundingClientRect().left + window.scrollX) - radius}px`;
            circle.style.top = `${e.clientY - (button.getBoundingClientRect().top + window.scrollY) - radius}px`;
            circle.classList.add('ripple');

            const existingRipple = button.getElementsByClassName('ripple')[0];
            if (existingRipple) {
                existingRipple.remove();
            }

            button.appendChild(circle);
        });

        // Magnetic Effect
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate distance from center
            const deltaX = (x - centerX) / 8;
            const deltaY = (y - centerY) / 8;

            button.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0) scale(1)';
        });
    });

    // ==========================================
    // 2. UI INTERACTIONS (Mobile Menu, Scroll)
    // ==========================================
    
    // Mobile Menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if(mobileBtn) mobileBtn.textContent = '☰';
        });
    });

    // Scroll Header Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'none';
        }
    });



    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Scroll Animations (Intersection Observer)
    // Note: Elements with .fade-in-up class will animate on load.
    // Use .scroll-reveal class for elements that should animate on scroll.
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));


    // ==========================================
    // 3. E-COMMERCE LOGIC
    // ==========================================
    // ⚠️ IMPORTANTE: Pega aquí la URL de tu Web App de Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6vPLrzQkLa_h-whzdRtRnh4SzdlS8g3dAkMjcBzzyEBdxCKZZwOjbKzpu_fsrk0VH/exec'; 

    let products = [];
    let cart = [];
    const WHATSAPP_NUMBER = "573004761078";

    // DOM Elements
    const productGrid = document.getElementById('product-grid');
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Init
    initStore();

    async function initStore() {
        try {
            let fetchUrl = 'products.json'; // Por defecto usamos el local
            
            // Si el usuario ya configuró la URL de Google Script, usamos esa
            if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith('https://')) {
                fetchUrl = GOOGLE_SCRIPT_URL;
            } else {
                console.log('Modo Demo: Usando products.json local. Configura GOOGLE_SCRIPT_URL para usar Google Sheets.');
            }

            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const rawData = await response.json();
            
            // Normalizamos los datos por si vienen con mayúsculas/minúsculas distintas desde el Sheet
            products = rawData.map(item => ({
                id: item.id || item.ID || `PROD_${Math.random().toString(36).substr(2, 9)}`,
                title: item.title || item.Title || 'Producto sin nombre',
                description: item.description || item.Description || '',
                availability: (item.availability || item.Availability || 'out of stock').toLowerCase(),
                price: String(item.price || item.Price || '0 COP'),
                image_link: item.image_link || item.Image_link || 'https://via.placeholder.com/300?text=No+Image',
                brand: item.brand || item.Brand || 'Generico'
            }));

            renderProducts(products);
        } catch (error) {
            console.error('Error cargando tienda:', error);
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>No se pudieron cargar los productos.</p>
                    <p style="font-size: 0.8em; color: var(--text-muted);">Verifica la consola o la configuración del Script.</p>
                </div>`;
        }

        loadCartFromStorage();
    }

    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        
        productsToRender.forEach((product, index) => {
            const card = document.createElement('article');
            card.className = 'card';
            // Stagger animation delay
            card.style.animationDelay = `${index * 100}ms`;
            card.classList.add('fade-in-up'); 
            
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image_link}" alt="${product.title}" class="product-image" loading="lazy">
                </div>
                <div class="product-details">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">${product.price}</div>
                    <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${product.description}
                    </p>
                    <button class="btn btn-primary add-to-cart-btn" style="width: 100%;" data-id="${product.id}">
                        ${product.availability === 'in stock' ? 'Añadir al Carrito' : 'Agotado'}
                    </button>
                </div>
            `;

            const btn = card.querySelector('.add-to-cart-btn');
            if (product.availability !== 'in stock') {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.addEventListener('click', () => addToCart(product));
            }

            productGrid.appendChild(card);
        });
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        const priceValue = parseInt(product.price.replace(/[^0-9]/g, ''));

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                priceValue: priceValue,
                image: product.image_link,
                quantity: 1
            });
        }

        updateCartUI();
        saveCartToStorage();
        openCartPanel();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
        saveCartToStorage();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        cartItemsContainer.innerHTML = '';
        let totalValue = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                    <p>Tu carrito está vacío</p>
                    <button id="startShoppingBtn" class="btn btn-outline" style="margin-top: 1rem; color: var(--color-primary-500); border-color: var(--color-primary-500);">Ir a la Tienda</button>
                </div>
            `;
            const startShoppingBtn = document.getElementById('startShoppingBtn');
            if(startShoppingBtn) {
                startShoppingBtn.addEventListener('click', () => {
                    closeCartPanel();
                    document.getElementById('tienda').scrollIntoView({behavior: 'smooth'});
                });
            }
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            
            cart.forEach(item => {
                totalValue += item.priceValue * item.quantity;

                const itemEl = document.createElement('div');
                itemEl.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);';
                
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md);">
                    <div style="flex-grow: 1;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${item.title}</h4>
                        <div style="color: var(--color-primary-600); font-weight: 600; margin-bottom: 0.5rem;">
                            ${item.quantity} x ${formatCurrency(item.priceValue)}
                        </div>
                        <button class="remove-btn" style="color: var(--color-error); font-size: 0.875rem; text-decoration: underline;">Eliminar</button>
                    </div>
                `;

                itemEl.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.id));
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalElement.textContent = formatCurrency(totalValue);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
    }

    function saveCartToStorage() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function loadCartFromStorage() {
        const storedCart = localStorage.getItem('shoppingCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            updateCartUI();
        }
    }

    // Cart Panel Logic
    function openCartPanel() {
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCartPanel() {
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCartPanel();
    });

    closeCart.addEventListener('click', closeCartPanel);

    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            closeCartPanel();
        }
    });

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        let message = `Hola *Peludos y vanidosos*, me gustaría realizar el siguiente pedido:\n\n`;
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.priceValue * item.quantity;
            total += itemTotal;
            message += `- ${item.quantity}x ${item.title} (${formatCurrency(itemTotal)})\n`;
        });

        message += `\n*Total: ${formatCurrency(total)}*\n\n`;
        message += `Quedo atento para coordinar el pago y la entrega. ¡Gracias! 🐾`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    });

    // ==========================================
    // 5. ADVANCED BOOKING SYSTEM
    // ==========================================
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingBtn = document.getElementById('closeBooking');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');

    let currentStep = 1;
    let bookingData = {
        service: '',
        professional: '',
        date: '',
        time: ''
    };

    // Mock Data for Professionals
    const professionalsData = {
        'Servicio Veterinario': [
            { name: 'Dr. Juan Pérez', avatar: '👨‍⚕️' },
            { name: 'Dra. María Gómez', avatar: '👩‍⚕️' }
        ],
        'Drenaje de Energía y Corrección de Conducta': [
            { name: 'Entrenador Carlos', avatar: '⚡' }
        ],
        'Baño y Peluquería Canina y Felina': [
            { name: 'Pedro Estilista', avatar: '✂️' },
            { name: 'Ana Cortés', avatar: '🐩' },
            { name: 'Equipo de Baño', avatar: '🛁' }
        ]
    };

    // Load Draft from Storage
    const savedDraft = localStorage.getItem('bookingDraft');
    if (savedDraft) {
        // Optional: We could restore the session here, but for now we just clear it on new booking
        // bookingData = JSON.parse(savedDraft);
    }

    // Open Modal
    document.querySelectorAll('.schedule-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceName = this.getAttribute('data-service');
            openBookingModal(serviceName);
        });
    });

    // Unified Service Selector Logic
    const serviceTabs = document.querySelectorAll('.service-tab');
    const serviceContents = document.querySelectorAll('.service-content');

    serviceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            serviceTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all content
            serviceContents.forEach(c => c.classList.remove('active'));
            
            // Show corresponding content
            const serviceId = tab.getAttribute('data-service');
            document.getElementById(`content-${serviceId}`).classList.add('active');
        });
    });

    function openBookingModal(serviceName) {
        // Updated: Removed 'professional' field from init, we skip that step now
        bookingData = { service: serviceName, professional: 'Asignado por Peludos', date: '', time: '' };
        
        // Start at Step 1 (which is now effectively Step 2 of old flow)
        currentStep = 1; 
        
        document.getElementById('selectedServiceName').textContent = serviceName;
        
        // Skip professional selection render, go straight to Date
        updateModalUI(); 
        
        bookingModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Close Modal
    closeBookingBtn.addEventListener('click', closeBookingModal);
    function closeBookingModal() {
        bookingModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Navigation
    nextStepBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) { // Reduced max steps
                currentStep++;
                updateModalUI();
            } else {
                finishBooking();
            }
        }
    });

    prevStepBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateModalUI();
        }
    });

    function updateModalUI() {
        // Adjust step logic for UI since we removed one step
        // Internal Step 1 -> UI Step 1 (Date)
        // Internal Step 2 -> UI Step 2 (Time)
        // Internal Step 3 -> UI Step 3 (Summary)
        
        // Hide all steps first
        document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
        
        // Map internal logic to DOM elements
        // We are reusing the existing DOM structure but hiding the Professional step
        // Step 1 (Date) uses DOM ID bookingStep2
        // Step 2 (Time) uses DOM ID bookingStep3
        // Step 3 (Summary) uses DOM ID bookingStep4
        
        let domStepId = '';
        if(currentStep === 1) domStepId = 'bookingStep2'; // Date
        if(currentStep === 2) domStepId = 'bookingStep3'; // Time
        if(currentStep === 3) domStepId = 'bookingStep4'; // Summary
        
        document.getElementById(domStepId).classList.add('active');

        // Update Progress Bar (3 Steps total now)
        // We need to visually update the progress bar which might still have 4 dots in HTML
        // For simplicity, we'll map 1->1, 2->2, 3->3 and hide the 4th if necessary or just treat 1 as 2
        
        // Let's hide the first progress step in CSS or just re-map indices visually
        const uiStepIndex = currentStep; // 1, 2, 3
        
        progressSteps.forEach((step, idx) => {
            // We only care about visual steps 1, 2, 3
            if (idx < 3) {
                 if (idx + 1 < uiStepIndex) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else if (idx + 1 === uiStepIndex) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            }
        });
        
        // Hack: Hide the 4th bubble if it exists in HTML
        if(progressSteps[3]) progressSteps[3].style.display = 'none';
        if(progressLines[3]) progressLines[3].style.display = 'none'; // logic check

        // Update Buttons
        prevStepBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        nextStepBtn.textContent = currentStep === 3 ? 'Confirmar y Enviar' : 'Siguiente';
        
        // Disable Next button until selection is made
        validateButtonState();

        // Render specific step content
        if (currentStep === 1) renderCalendar();
        if (currentStep === 2) renderTimeSlots();
        if (currentStep === 3) updateSummary();
        
        // Save Draft
        localStorage.setItem('bookingDraft', JSON.stringify(bookingData));
    }

    function validateButtonState() {
        let isValid = false;
        // Step 1 is Date
        if (currentStep === 1 && bookingData.date) isValid = true;
        // Step 2 is Time
        if (currentStep === 2 && bookingData.time) isValid = true;
        // Step 3 is Summary
        if (currentStep === 3) isValid = true;
        
        nextStepBtn.disabled = !isValid;
    }

    function validateStep(step) {
        if (step === 1 && !bookingData.date) return false;
        if (step === 2 && !bookingData.time) return false;
        return true;
    }

    // --- Step 1: Professionals (SKIPPED) ---
    // function renderProfessionals... removed

    // --- Step 2: Calendar ---
    let currentDate = new Date();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        grid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        // Headers
        ['D', 'L', 'M', 'M', 'J', 'V', 'S'].forEach(d => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = d;
            grid.appendChild(header);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0,0,0,0);

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement('div'));
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = i;
            
            const checkDate = new Date(year, month, i);
            const dayOfWeek = checkDate.getDay();
            
            // Disable Sundays (0=Sun) or past dates. Saturdays are enabled.
            if (checkDate < today || dayOfWeek === 0) {
                dayEl.classList.add('disabled');
            } else {
                dayEl.addEventListener('click', () => {
                    bookingData.date = checkDate.toISOString();
                    bookingData.time = ''; // Reset time on date change
                    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                    dayEl.classList.add('selected');
                    validateButtonState();
                });
            }

            if (bookingData.date) {
                if (new Date(bookingData.date).toDateString() === checkDate.toDateString()) {
                    dayEl.classList.add('selected');
                }
            }

            if (checkDate.toDateString() === today.toDateString()) {
                dayEl.classList.add('today');
            }

            grid.appendChild(dayEl);
        }
    }

    // --- Step 3: Time Slots ---
    function renderTimeSlots() {
        const container = document.getElementById('timeSlots');
        const dateDisplay = document.getElementById('selectedDateDisplay');
        container.innerHTML = '';
        
        if (!bookingData.date) return;
        
        const dateObj = new Date(bookingData.date);
        dateDisplay.textContent = dateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

        const dayOfWeek = dateObj.getDay(); // 0=Sun, 6=Sat
        const service = bookingData.service;
        let slots = [];

        // Logic:
        // Vet: Mon-Sat 9am - 3:30pm
        // Bath (and others): Mon-Fri 9am - 1pm, Sat 9am - 3pm
        
        const isVet = service === 'Servicio Veterinario';
        const isGuarderia = service === 'Guardería Canina';
        const isSaturday = dayOfWeek === 6;

        if (isVet) {
             // Vet: 9am - 3:30pm. Slots: 9, 10, 11, 12, 1, 2. (Last slot 2pm-3pm).
             slots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];
        } else if (isGuarderia) {
            // Guarderia: 7am - 6pm
            if (isSaturday) {
                slots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];
            } else {
                slots = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                         '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
            }
        } else {
            // Bath & Others
            if (isSaturday) {
                // Sat: 9am - 3pm. Slots: 9, 10, 11, 12, 1, 2.
                slots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];
            } else {
                // Mon-Fri: 9am - 1pm. Slots: 9, 10, 11, 12.
                slots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
            }
        }
        
        slots.forEach(time => {
            const btn = document.createElement('button');
            btn.className = 'time-slot';
            btn.textContent = time;
            
            if (bookingData.time === time) btn.classList.add('selected');
            
            btn.addEventListener('click', () => {
                bookingData.time = time;
                document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                validateButtonState();
            });
            
            container.appendChild(btn);
        });
    }

    // --- Step 4: Summary ---
    function updateSummary() {
        document.getElementById('summaryService').textContent = bookingData.service;
        document.getElementById('summaryProfessional').textContent = bookingData.professional;
        const dateObj = new Date(bookingData.date);
        document.getElementById('summaryDate').textContent = dateObj.toLocaleDateString('es-CO');
        document.getElementById('summaryTime').textContent = bookingData.time;
    }

    function finishBooking() {
        const message = `Hola *Peludos y vanidosos*, quiero confirmar la siguiente cita:\n\n` +
                        `🐶 *Servicio:* ${bookingData.service}\n` +
                        `👤 *Profesional:* ${bookingData.professional}\n` +
                        `📅 *Fecha:* ${new Date(bookingData.date).toLocaleDateString('es-CO')}\n` +
                        `⏰ *Hora:* ${bookingData.time}\n\n` +
                        `Quedo atento a su confirmación. ¡Gracias!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        // Clear draft
        localStorage.removeItem('bookingDraft');
        closeBookingModal();
        
        window.open(whatsappUrl, '_blank');
    }

    // ==========================================
    // 6. MEDIA GALLERY (GUARDERIA)
    // ==========================================
    const guarderiaMediaContainer = document.getElementById('guarderia-media-container');
    const guarderiaNextBtn = document.getElementById('guarderia-next-btn');
    
    if (guarderiaMediaContainer && guarderiaNextBtn) {
        const guarderiaMedia = [
            { type: 'video', src: '3.mp4' },
            { type: 'image', src: 'https://i.postimg.cc/vTQhJdbF/96189e8a-8de3-4ea6-9964-9840795f6999.jpg' },
            { type: 'image', src: 'https://i.postimg.cc/7L83vynQ/1befaae6-ce32-4cc3-bc03-54aebff6a935.jpg' },
            { type: 'image', src: 'https://i.postimg.cc/6QfGD4Qg/69a011b8-7eed-42a8-a59c-69f65833d807.jpg' }
        ];

        let currentMediaIndex = 0;

        // Initialize transition
        guarderiaMediaContainer.style.transition = 'opacity 0.3s ease';

        guarderiaNextBtn.addEventListener('click', () => {
            currentMediaIndex = (currentMediaIndex + 1) % guarderiaMedia.length;
            const media = guarderiaMedia[currentMediaIndex];
            
            // Fade out
            guarderiaMediaContainer.style.opacity = '0';
            
            setTimeout(() => {
                guarderiaMediaContainer.innerHTML = '';
                
                if (media.type === 'video') {
                    const video = document.createElement('video');
                    video.src = media.src;
                    video.autoplay = true;
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
                    video.innerHTML = 'Tu navegador no soporta videos HTML5.';
                    guarderiaMediaContainer.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = media.src;
                    img.alt = 'Galería Guardería Canina';
                    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
                    guarderiaMediaContainer.appendChild(img);
                }
                
                // Fade in
                setTimeout(() => {
                    guarderiaMediaContainer.style.opacity = '1';
                }, 50);
            }, 300);
        });
    }

    // ==========================================
    // 7. MEDIA GALLERY (BANHO)
    // ==========================================
    const banhoMediaContainer = document.getElementById('banho-media-container');
    const banhoNextBtn = document.getElementById('banho-next-btn');
    
    if (banhoMediaContainer && banhoNextBtn) {
        const banhoMedia = [
            'https://i.postimg.cc/28gc5Mx3/ffa5f5ea-59f9-46aa-96e0-25e8038efbfd.jpg',
            'https://i.postimg.cc/GpLFSFCj/68057bb9-9bc6-4b19-9157-ba4121cc73be.jpg',
            'https://i.postimg.cc/FswWK8xz/c85de774-577e-4184-9fcd-afa31f1c0c99.jpg'
        ];

        let currentBanhoIndex = 0;

        // Initialize transition
        banhoMediaContainer.style.transition = 'opacity 0.3s ease';

        banhoNextBtn.addEventListener('click', () => {
            currentBanhoIndex = (currentBanhoIndex + 1) % banhoMedia.length;
            const imgSrc = banhoMedia[currentBanhoIndex];
            
            // Fade out
            banhoMediaContainer.style.opacity = '0';
            
            setTimeout(() => {
                banhoMediaContainer.innerHTML = '';
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = 'Galería Baño y Peluquería';
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
                banhoMediaContainer.appendChild(img);
                
                // Fade in
                setTimeout(() => {
                    banhoMediaContainer.style.opacity = '1';
                }, 50);
            }, 300);
        });
    }

    // ==========================================
    // 8. MEDIA GALLERY (VETERINARIO)
    // ==========================================
    const veterinarioMediaContainer = document.getElementById('veterinario-media-container');
    const veterinarioNextBtn = document.getElementById('veterinario-next-btn');
    
    if (veterinarioMediaContainer && veterinarioNextBtn) {
        const veterinarioMedia = [
            'https://i.postimg.cc/tJkZ6f17/53da7772-74a9-4b16-813a-5b78db8d565c.jpg',
            'https://i.postimg.cc/dVLk75wX/05c418e9-de16-473b-815d-07e5a204cc41.jpg'
        ];

        let currentVeterinarioIndex = 0;

        // Initialize transition
        veterinarioMediaContainer.style.transition = 'opacity 0.3s ease';

        veterinarioNextBtn.addEventListener('click', () => {
            currentVeterinarioIndex = (currentVeterinarioIndex + 1) % veterinarioMedia.length;
            const imgSrc = veterinarioMedia[currentVeterinarioIndex];
            
            // Fade out
            veterinarioMediaContainer.style.opacity = '0';
            
            setTimeout(() => {
                veterinarioMediaContainer.innerHTML = '';
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = 'Galería Veterinaria';
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
                veterinarioMediaContainer.appendChild(img);
                
                // Fade in
                setTimeout(() => {
                    veterinarioMediaContainer.style.opacity = '1';
                }, 50);
            }, 300);
        });
    }

});
