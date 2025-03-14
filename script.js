// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initThemeToggle();
    initMobileMenu();
    initComparisonSliders();
    initTestimonialSlider();
    initCategoryFilter();
    initScrollAnimation();
    initBackToTop();
    initImageOptimization();
});

// Theme Toggle
function initThemeToggle() {
    const themeSwitch = document.getElementById('theme-switch');
    
    if (!themeSwitch) return;
    
    // Check for saved theme preference or respect OS preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }
    
    // Toggle theme when switch is clicked
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Listen for OS theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                themeSwitch.checked = true;
            } else {
                document.body.classList.remove('dark-mode');
                themeSwitch.checked = false;
            }
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open'); // Prevent scrolling when menu is open
    });
    
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

// Comparison Sliders
function initComparisonSliders() {
    const sliders = document.querySelectorAll('.comparison-slider');
    
    if (!sliders.length) return;
    
    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImage = slider.querySelector('.after-image');
        
        if (!handle || !afterImage) return;
        
        let isDragging = false;
        
        // Mouse events
        handle.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', endDrag);
        
        // Touch events for mobile
        handle.addEventListener('touchstart', startDrag);
        window.addEventListener('touchmove', drag);
        window.addEventListener('touchend', endDrag);
        
        // Initial position
        updateSliderPosition(slider, 50);
        
        // Add hover effect to indicate draggable
        handle.addEventListener('mouseenter', () => {
            handle.style.transform = 'scale(1.1)';
        });
        
        handle.addEventListener('mouseleave', () => {
            if (!isDragging) {
                handle.style.transform = 'scale(1)';
            }
        });
        
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            handle.style.transform = 'scale(1.1)';
            slider.classList.add('active');
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const rect = slider.getBoundingClientRect();
            let x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            let percentage = (x / rect.width) * 100;
            
            // Constrain percentage between 0 and 100
            percentage = Math.max(0, Math.min(percentage, 100));
            
            updateSliderPosition(slider, percentage);
        }
        
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            handle.style.transform = 'scale(1)';
            slider.classList.remove('active');
        }
        
        function updateSliderPosition(slider, percentage) {
            const afterImage = slider.querySelector('.after-image');
            const handle = slider.querySelector('.slider-handle');
            
            if (!afterImage || !handle) return;
            
            afterImage.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
            handle.style.left = `${percentage}%`;
        }
    });
}

// Testimonial Slider
function initTestimonialSlider() {
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    
    if (!testimonialSlider || !testimonials.length || !dots.length) return;
    
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let autoSlideInterval;
    
    // Set up initial state
    updateTestimonialSlider();
    
    // Set up dot click events
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateTestimonialSlider();
            resetAutoSlide();
        });
    });
    
    // Add swipe functionality for mobile
    testimonialSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    testimonialSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        resetAutoSlide();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left, go to next
            currentIndex = (currentIndex + 1) % testimonials.length;
            updateTestimonialSlider();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right, go to previous
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            updateTestimonialSlider();
        }
    }
    
    // Pause auto-slide when hovering over testimonials
    testimonialSlider.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    testimonialSlider.addEventListener('mouseleave', () => {
        startAutoSlide();
    });
    
    // Start auto-slide
    startAutoSlide();
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            updateTestimonialSlider();
        }, 5000);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    function updateTestimonialSlider() {
        // Update testimonial position
        testimonialSlider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// Category Filter for Works
function initCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const workItems = document.querySelectorAll('.work-item');
    
    if (!categoryButtons.length || !workItems.length) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Filter work items with animation
            workItems.forEach(item => {
                item.classList.add('fade-out');
                
                setTimeout(() => {
                    if (category === 'all' || item.classList.contains(category)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.remove('fade-out');
                        }, 50);
                    } else {
                        item.style.display = 'none';
                    }
                }, 300);
            });
        });
    });
}

// Scroll Animation
function initScrollAnimation() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (!animatedElements.length) return;
    
    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Once the animation is done, unobserve the element
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Back to Top Button
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (!backToTopButton) return;
    
    // Use Intersection Observer to detect when user scrolls past a certain point
    const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }, {
        threshold: 0,
        rootMargin: '0px 0px -300px 0px'
    });
    
    // Observe the header to determine when to show the button
    const header = document.querySelector('header');
    if (header) {
        observer.observe(header);
    }
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Image Optimization
function initImageOptimization() {
    // Optimize image loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if (!images.length) return;
    
    // Use Intersection Observer to load images only when they're about to enter the viewport
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('src');
                
                // Create a new image to preload
                const newImg = new Image();
                newImg.src = src;
                
                newImg.onload = () => {
                    img.classList.add('loaded');
                };
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '200px'
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Form Submission with validation
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Basic validation
    if (!name || !email || !subject || !message) {
        showFormError('Please fill in all fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormError('Please enter a valid email address');
        return;
    }
    
    // Here you would typically send the form data to a server
    // For demonstration, we'll just show a success message
    showFormSuccess(`Thank you, ${name}! Your message has been received. We'll get back to you soon.`);
    
    // Reset form
    this.reset();
});

function showFormError(message) {
    const formAlert = document.createElement('div');
    formAlert.className = 'form-alert error';
    formAlert.textContent = message;
    
    const form = document.getElementById('contactForm');
    form.appendChild(formAlert);
    
    setTimeout(() => {
        formAlert.remove();
    }, 3000);
}

function showFormSuccess(message) {
    const formAlert = document.createElement('div');
    formAlert.className = 'form-alert success';
    formAlert.textContent = message;
    
    const form = document.getElementById('contactForm');
    form.appendChild(formAlert);
    
    setTimeout(() => {
        formAlert.remove();
    }, 3000);
}

// Newsletter Subscription with validation
document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get email value
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'newsletter-error';
        errorMsg.textContent = 'Please enter a valid email address';
        
        // Remove any existing error message
        const existingError = this.querySelector('.newsletter-error');
        if (existingError) {
            existingError.remove();
        }
        
        this.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 3000);
        
        return;
    }
    
    // Here you would typically send the subscription request to a server
    // For demonstration, we'll just show a success message
    const successMsg = document.createElement('div');
    successMsg.className = 'newsletter-success';
    successMsg.textContent = `Thank you for subscribing to our newsletter with ${email}!`;
    
    // Remove any existing messages
    const existingMsg = this.querySelector('.newsletter-success, .newsletter-error');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    this.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
    
    // Reset form
    this.reset();
});

// Smooth scrolling for navigation links with improved performance
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Get header height dynamically
            const headerHeight = document.querySelector('header')?.offsetHeight || 70;
            
            window.scrollTo({
                top: targetElement.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        }
    });
}); 