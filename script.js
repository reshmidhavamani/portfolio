document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. MOBILE MENU TOGGLE
    // -------------------------------------------------------------------------
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Toggle hamburger icon animation
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars-staggered';
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('open');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars-staggered';
            }
        });
    });

    // -------------------------------------------------------------------------
    // 1.5. CELESTIAL THEME TOGGLE (DARK / LIGHT MODE)
    // -------------------------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    
    // Load theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        document.body.classList.add('light-mode');
        const icon = themeToggle ? themeToggle.querySelector('i') : null;
        if (icon) icon.className = 'fa-solid fa-sun';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            
            if (document.body.classList.contains('light-mode')) {
                if (icon) icon.className = 'fa-solid fa-sun';
                localStorage.setItem('theme', 'light');
            } else {
                if (icon) icon.className = 'fa-solid fa-moon';
                localStorage.setItem('theme', 'dark');
            }

            // Performance Optimization: Update all star colors once on toggle
            if (typeof stars !== 'undefined' && stars.length > 0) {
                stars.forEach(star => star.resolveColor());
            }
        });
    }


    // -------------------------------------------------------------------------
    // 2. GALAXY CANVAS BACKGROUND
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('galaxy-bg');
    const ctx = canvas.getContext('2d');

    let stars = [];
    let isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 80 : 250;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };
    let rotationAngle = 0;

    // Star Class definition
    class Star {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            // Distribute stars relative to canvas center
            const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
            this.r = initial ? Math.random() * maxRadius : maxRadius;
            this.angle = Math.random() * Math.PI * 2;
            
            // Speed of orbital motion
            this.speed = (0.02 + Math.random() * 0.05) * (1 - this.r / maxRadius); // inner stars move slightly faster
            
            // Sizes of stars
            this.size = 0.5 + Math.random() * 1.5;
            
            // Star colors (white, pastel pink, lavender, hot pink highlights - girlish cosmic)
            const colors = ['#ffffff', '#ff8ac2', '#a76eff', '#ff52a2', '#ffffff'];
            this.baseColor = colors[Math.floor(Math.random() * colors.length)];
            this.resolveColor();
            
            // Twinkle parameters
            this.opacity = Math.random();
            this.twinkleSpeed = 0.005 + Math.random() * 0.015;
            this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
        }

        resolveColor() {
            if (document.body.classList.contains('light-mode')) {
                if (this.baseColor === '#ffffff') {
                    this.color = '#5c2d46'; // Deep cosmic berry
                } else if (this.baseColor === '#ff8ac2') {
                    this.color = '#d6006e'; // Saturated deep pink
                } else if (this.baseColor === '#a76eff') {
                    this.color = '#803bff'; // Deep lavender
                } else if (this.baseColor === '#ff52a2') {
                    this.color = '#ff4d9c'; // Vibrant hot pink
                }
            } else {
                this.color = this.baseColor;
            }
        }

        update() {
            // Orbit logic
            this.angle += this.speed * 0.05; // Slow down the base speed for smooth feel
            
            // Twinkle logic
            this.opacity += this.twinkleSpeed * this.twinkleDir;
            if (this.opacity >= 1) {
                this.opacity = 1;
                this.twinkleDir = -1;
            } else if (this.opacity <= 0.2) {
                this.opacity = 0.2;
                this.twinkleDir = 1;
            }
        }

        draw() {
            // Convert polar to cartesian coordinates from center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Mouse parallax shift only on desktop
            const parallaxX = isMobile ? 0 : (mouse.x - centerX) * (this.size * 0.015);
            const parallaxY = isMobile ? 0 : (mouse.y - centerY) * (this.size * 0.015);

            const x = centerX + Math.cos(this.angle) * this.r - parallaxX;
            const y = centerY + Math.sin(this.angle) * this.r - parallaxY;

            // Draw only if on screen
            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                ctx.beginPath();
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
            }
        }
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        isMobile = window.innerWidth < 768;
        initStars();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse movement tracker with easing (lerp) - only active on desktop
    window.addEventListener('mousemove', (e) => {
        if (isMobile) return;
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    function animate() {
        // Smoothly transition mouse variables
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Clear canvas with trace transparency for slight motion blur look
        if (document.body.classList.contains('light-mode')) {
            ctx.fillStyle = 'rgba(246, 243, 252, 0.2)';
        } else {
            ctx.fillStyle = 'rgba(2, 0, 10, 0.2)';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw and update stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();


    // -------------------------------------------------------------------------
    // 3. TYPING EFFECT FOR HERO TAGLINE
    // -------------------------------------------------------------------------
    const typingTextElement = document.getElementById('typing-text');
    const words = [
        "B.Sc. Artificial Intelligence & Data Science Student",
        "Aspiring Software Developer",
        "Exploring the Universe of Code"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Remove character
            typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Delete faster
        } else {
            // Add character
            typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Standard typing speed
        }

        // Word finished typing
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } 
        // Word finished deleting
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length; // Move to next word
            typingSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing loop
    if (typingTextElement) {
        setTimeout(type, 1000);
    }


    // -------------------------------------------------------------------------
    // 4. MOUSE HOVER GLOW EFFECT FOR GLASS CARDS
    // -------------------------------------------------------------------------
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate within element
            const y = e.clientY - rect.top;  // y coordinate within element

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });


    // -------------------------------------------------------------------------
    // 5. SCROLL REVEAL & NAVIGATION ACTIVE STATE SYNCHRONIZATION
    // -------------------------------------------------------------------------
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const sections = document.querySelectorAll('section');

    // Reveal elements on scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    scrollRevealElements.forEach(el => revealObserver.observe(el));

    // Active navigation links synchronization
    const navActiveObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5, // Trigger when 50% of the section is visible
        rootMargin: '-70px 0px 0px 0px' // Offset the sticky header
    });

    sections.forEach(sec => navActiveObserver.observe(sec));


    // -------------------------------------------------------------------------
    // 6. CONTACT FORM SUBMISSION WITH SPACE EFFECT
    // -------------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Visual loading state
            const btn = contactForm.querySelector('.form-btn');
            const btnText = btn.querySelector('.btn-text');
            const btnIcon = btn.querySelector('i');
            const originalText = btnText.textContent;
            
            btnText.textContent = "Launching Signal...";
            btnIcon.className = "fa-solid fa-satellite-dish fa-spin";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            // Mocking successful server receipt with timeout
            setTimeout(() => {
                formStatus.textContent = "Signal successful! Transmission reached the nebula.";
                formStatus.className = "form-status success";
                
                // Clear inputs
                contactForm.reset();

                // Revert button
                btnText.textContent = originalText;
                btnIcon.className = "fa-solid fa-paper-plane";
                btn.style.opacity = "1";
                btn.disabled = false;

                // Clear status after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = "none";
                }, 5000);
            }, 1800);
        });
    }
});