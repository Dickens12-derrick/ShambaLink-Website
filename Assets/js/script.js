document.addEventListener('DOMContentLoaded', () => {
    // Select all slider elements
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;

    // Execute slider code only if slides exist on the current page
    if (slides.length > 0) {
        
        // Function to update active slide class
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        }

        // Advance to the next slide (loops back to 0 at the end)
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        // Go back to the previous slide
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        // Manual Navigation Button Listeners
        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoSlide();
            });

            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoSlide();
            });
        }

        // Automatic slider transition every 5 seconds
        let slideInterval = setInterval(nextSlide, 5000);

        // Reset timer when user manually interacts with controls
        function resetAutoSlide() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }
    }

    // Theme toggle (stores preference in localStorage)
    const themeToggle = document.getElementById('theme-toggle');
    const userPref = localStorage.getItem('shambalinks_theme');
    if (userPref === 'dark') document.body.classList.add('dark');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('shambalinks_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // Simple client-side auth (localStorage)
    function getUser(){ try { return JSON.parse(localStorage.getItem('shambalinks_user')) } catch(e){return null} }
    function setUser(user){ localStorage.setItem('shambalinks_user', JSON.stringify(user)) }
    function clearUser(){ localStorage.removeItem('shambalinks_user') }

    function renderProfileSummary(){
        const user = getUser();
        const nameEl = document.getElementById('user-profile-name');
        const statusEl = document.getElementById('user-profile-status');
        if (!nameEl || !statusEl) return;
        if (user) {
            nameEl.textContent = 'Welcome, ' + (user.name || 'member');
            statusEl.textContent = 'Profile ready. You can view your account and continue shopping.';
        } else {
            nameEl.textContent = 'Welcome, guest';
            statusEl.textContent = 'Login to unlock your profile and personal dashboard.';
        }
    }

    function updateAuthLinks(){
        const loginLink = document.getElementById('login-link');
        const profileLink = document.getElementById('profile-link');
        const user = getUser();
        if (user && profileLink){ profileLink.style.display = 'inline-block'; if (loginLink) loginLink.style.display='none' }
        else if (loginLink){ loginLink.style.display='inline-block'; if(profileLink) profileLink.style.display='none' }
        renderProfileSummary();
    }
    updateAuthLinks();

    // Basic cart using localStorage
    const cartKey = 'shambalinks_cart';
    function getCart(){ return JSON.parse(localStorage.getItem(cartKey) || '[]') }
    function setCart(items){ localStorage.setItem(cartKey, JSON.stringify(items)); renderCartCount(); }
    function addToCart(item){ 
        if(!item) return;
        // prevent adding services to cart
        if(item.type && item.type === 'service'){
            alert('This is a service. Please request it via the contact page.');
            window.location.href = 'pages/contact.html';
            return;
        }
        const c=getCart(); c.push(item); setCart(c);
    }
    // expose for other pages
    window.addToCart = addToCart;
    function renderCartCount(){ const el = document.getElementById('cart-count'); if(!el) return; el.textContent = getCart().length }
    renderCartCount();

    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn){
        cartBtn.addEventListener('click', ()=>{
            const items = getCart();
            const modal = document.createElement('div'); modal.className='modal';
            const content = document.createElement('div'); content.className='modal-content';
            const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
            content.innerHTML = `
                <h3>Your Cart</h3>
                ${items.length ? '<ul class="cart-list">' + items.map(i => `<li><span>${i.name}</span><strong>UGX ' + Number(i.price).toLocaleString() + '</strong></li>`).join('') + '</ul>' : '<p>Cart is empty</p>'}
                ${items.length ? '<div class="cart-total"><span>Subtotal</span><strong>UGX ' + total.toLocaleString() + '</strong></div>' : ''}
            `;
            const payBtn = document.createElement('button'); payBtn.className='btn'; payBtn.textContent='Proceed to Payment';
            const checkoutPath = window.location.pathname.includes('/pages/') ? 'checkout.html' : 'pages/checkout.html';
            payBtn.addEventListener('click', ()=>{ document.body.removeChild(modal); window.location.href = checkoutPath; });
            const close = document.createElement('button'); close.className='btn btn-outline'; close.textContent='Close'; close.style.marginLeft='8px';
            close.addEventListener('click', ()=> document.body.removeChild(modal));
            content.appendChild(payBtn); content.appendChild(close);
            modal.appendChild(content); document.body.appendChild(modal);
        });
    }

    // Image editor removed from the UI — team and placeholders replace it.

    // Keep auth links updated on storage changes across tabs
    window.addEventListener('storage', (e)=>{ if (e.key === 'shambalinks_user'){ updateAuthLinks() } });

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        const items = getCart();
        const summaryList = document.getElementById('checkout-items');
        const totalEl = document.getElementById('checkout-total');
            if (summaryList && totalEl) {
            if (!items.length) {
                summaryList.innerHTML = '<li>Cart is empty.</li>';
                totalEl.textContent = 'UGX 0';
            } else {
                const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
                summaryList.innerHTML = items.map(item => `<li><span>${item.name}</span><strong>UGX ` + Number(item.price).toLocaleString() + `</strong></li>`).join('');
                totalEl.textContent = 'UGX ' + total.toLocaleString();
            }
        }
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Payment successful. Your order has been placed.');
            localStorage.removeItem('shambalinks_cart');
            renderCartCount();
            window.location.href = 'index.html';
        });
    }

    // Dropdown toggle on click
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropbtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other dropdowns first
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('open');
                });
                const isOpen = dropdown.classList.toggle('open');
                // update aria-expanded for accessibility
                try{ btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); }catch(e){}
            });
            // keyboard support for Enter/Space
            btn.addEventListener('keydown', (ev)=>{
                if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); btn.click(); }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('open'));
        // update aria-expanded to false for all buttons
        dropdowns.forEach(d => { const b = d.querySelector('.dropbtn'); if(b) b.setAttribute('aria-expanded','false'); });
    });

    // Close dropdowns on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdowns.forEach(d => d.classList.remove('open'));
    });

    // Update aria-expanded when Escape is used
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdowns.forEach(d => { const b = d.querySelector('.dropbtn'); if(b) b.setAttribute('aria-expanded','false'); });
    });

    // Stats animation when visible
    const statEls = document.querySelectorAll('.stat-number');
    if (statEls && statEls.length){
        const formatValue = (value)=>{
            if(value >= 1000) return Math.round(value/1000) + 'K';
            return value.toString();
        }
        const animateStat = (el, target, suffix) => {
            let start = 0;
            const duration = 1500;
            const stepTime = Math.max(16, Math.floor(duration / target));
            const startTime = performance.now();
            const tick = (now)=>{
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(target * progress);
                el.textContent = (target >= 1000 ? formatValue(current) : current) + (suffix || '');
                if(progress < 1) requestAnimationFrame(tick);
                else el.textContent = (target >= 1000 ? formatValue(target) : target) + (suffix || '');
            };
            requestAnimationFrame(tick);
        }
        const io = new IntersectionObserver((entries, observer)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target')||'0',10);
                    const suffix = el.getAttribute('data-suffix')||'';
                    animateStat(el, target, suffix);
                    observer.unobserve(el);
                }
            });
        },{threshold:0.4});
        statEls.forEach(s=> io.observe(s));
    }

    // Contact form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm && !contactForm.id) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('input[type="text"]');
            const email = contactForm.querySelector('input[type="email"]');
            const msg = contactForm.querySelector('textarea');
            if (name && name.value.trim() && email && email.value.trim() && msg && msg.value.trim()) {
                alert('Thank you, ' + name.value.trim() + '! Your message has been received. We will contact you at ' + email.value.trim() + ' soon.');
                contactForm.reset();
            }
        });
    }
});