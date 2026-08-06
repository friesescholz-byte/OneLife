/* ==========================================================================
   OneLife Nienburg JavaScript Logic
   Created by Scholz & Friese Webdesign-Agentur (UI/UX Pro Max)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. Header Scroll & Active Nav Indicator
    // ==========================================================================
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        // Toggle header backdrop-blur on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active nav state based on scroll position
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================================================
    // 2. Mobile Menu Navigation Overlay
    // ==========================================================================
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    function toggleMobileMenu() {
        menuToggle.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden'); // Disable scroll when overlay is active
    }
    
    if (menuToggle && mobileOverlay) {
        menuToggle.addEventListener('click', toggleMobileMenu);
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMobileMenu();
            });
        });
    }

    // ==========================================================================
    // 3. PAS Cards Mobile Flip Support (Touch Devices)
    // ==========================================================================
    const pasCards = document.querySelectorAll('.pas-card');
    
    pasCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if user clicked a link/button inside the card
            if (e.target.closest('.btn')) return;
            
            // On touch devices or click, toggle flipped state
            card.classList.toggle('flipped');
            
            // Remove flipped state from other cards
            pasCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('flipped');
                }
            });
        });
    });

    // ==========================================================================
    // 4. Testimonial Sliderrondell (3D video carousel)
    // ==========================================================================
    const slides = Array.from(document.querySelectorAll('.slide-card'));
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('slider-dots');
    const dots = Array.from(document.querySelectorAll('.dot'));
    
    let currentIndex = 0;
    let activeVideo = null;
    
    function updateSlider() {
        const totalSlides = slides.length;
        
        // Pause active video when switching slides
        if (activeVideo) {
            activeVideo.pause();
            activeVideo.currentTime = 0;
            const playingCard = activeVideo.closest('.slide-card');
            if (playingCard) {
                playingCard.classList.remove('playing');
            }
            activeVideo = null;
        }
        
        slides.forEach((slide, index) => {
            // Clean up old classes
            slide.classList.remove('active', 'prev', 'next', 'prev-prev', 'next-next');
            slide.style.display = ''; // reset displays
            
            // Calculate relative index in a circular list
            let relativeIndex = (index - currentIndex + totalSlides) % totalSlides;
            
            if (relativeIndex === 0) {
                slide.classList.add('active');
            } else if (relativeIndex === 1) {
                slide.classList.add('next');
            } else if (relativeIndex === totalSlides - 1) {
                slide.classList.add('prev');
            } else if (relativeIndex === 2) {
                slide.classList.add('next-next');
            } else if (relativeIndex === totalSlides - 2) {
                slide.classList.add('prev-prev');
            } else {
                slide.style.display = 'none'; // hide slides far away
            }
        });
        
        // Update Dots
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentIndex) {
                dot.classList.add('active');
            }
        });
    }
    
    function slideNext() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }
    
    function slidePrev() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }
    
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', slideNext);
        prevBtn.addEventListener('click', slidePrev);
    }
    
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            const dot = e.target.closest('.dot');
            if (dot) {
                currentIndex = parseInt(dot.getAttribute('data-index'), 10);
                updateSlider();
            }
        });
    }
    
    // Video Custom Player Logic
    slides.forEach(slide => {
        const video = slide.querySelector('.testimonial-video');
        const playOverlay = slide.querySelector('.video-play-overlay');
        
        if (playOverlay && video) {
            playOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Only allow playing video on the active card
                if (!slide.classList.contains('active')) {
                    // If clicked a side slide, navigate to it instead
                    currentIndex = parseInt(slide.getAttribute('data-slide-index'), 10);
                    updateSlider();
                    return;
                }
                
                if (video.paused) {
                    // Play active video
                    video.play();
                    slide.classList.add('playing');
                    activeVideo = video;
                } else {
                    // Pause active video
                    video.pause();
                    slide.classList.remove('playing');
                    activeVideo = null;
                }
            });
            
            // Add click listener to the video container itself to pause on click
            video.addEventListener('click', () => {
                if (slide.classList.contains('playing')) {
                    video.pause();
                    slide.classList.remove('playing');
                    activeVideo = null;
                }
            });
        }
    });
    
    // Swipe gestures on mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderTrackContainer = document.querySelector('.slider-track-container');
    
    if (sliderTrackContainer) {
        sliderTrackContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        sliderTrackContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            slideNext(); // Swiped left, go next
        } else if (touchEndX - touchStartX > swipeThreshold) {
            slidePrev(); // Swiped right, go prev
        }
    }
    
    // Initial Slider Layout Setup
    updateSlider();

    // ==========================================================================
    // 5. Interactive Funnel Form (Lead Generator)
    // ==========================================================================
    const form = document.getElementById('probetraining-funnel-form');
    const steps = Array.from(document.querySelectorAll('.funnel-step'));
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const progressFill = document.getElementById('progress-fill');
    const successView = document.getElementById('funnel-success');
    
    let currentStep = 1;
    
    function updateFunnelStep() {
        // Show/Hide steps
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.getAttribute('data-step'), 10) === currentStep) {
                step.classList.add('active');
            }
        });
        
        // Update Progress Bar
        const percentage = (currentStep / steps.length) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    function validateStep(stepNum) {
        const stepContainer = document.querySelector(`.funnel-step[data-step="${stepNum}"]`);
        
        // Validate radio buttons
        const radios = stepContainer.querySelectorAll('input[type="radio"]');
        if (radios.length > 0) {
            let radioChecked = false;
            radios.forEach(radio => {
                if (radio.checked) radioChecked = true;
            });
            if (!radioChecked) {
                alert('Bitte wähle eine Option aus, um fortzufahren.');
                return false;
            }
            return true;
        }
        
        // Validate text inputs on step 3
        const inputs = stepContainer.querySelectorAll('input[required]');
        let inputsValid = true;
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!input.checked) {
                    inputsValid = false;
                    input.closest('.form-checkbox-group').style.outline = '1px solid var(--color-danger)';
                } else {
                    input.closest('.form-checkbox-group').style.outline = 'none';
                }
            } else {
                if (!input.value.trim()) {
                    inputsValid = false;
                    input.style.borderColor = 'var(--color-danger)';
                } else {
                    input.style.borderColor = '';
                }
            }
        });
        
        return inputsValid;
    }
    
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateFunnelStep();
            }
        });
    });
    
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateFunnelStep();
        });
    });

    // Auto-advance for Step 1 and Step 2 radio selections
    const funnelRadios = document.querySelectorAll('.funnel-step input[type="radio"]');
    funnelRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentStep < 3) {
                setTimeout(() => {
                    currentStep++;
                    updateFunnelStep();
                }, 220); // Smooth delay so the selection highlight is visible
            }
        });
    });
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateStep(currentStep)) {
                // Simulate form submission (e.g. sending API call)
                const submitBtn = document.getElementById('submit-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Wird gesichert... ⚡';
                
                setTimeout(() => {
                    // Hide form container elements and show Success View
                    form.style.display = 'none';
                    progressFill.style.width = '100%';
                    successView.classList.add('active');
                    
                    // Smooth scroll to top of lead section so message is visible
                    const leadSection = document.getElementById('lead-form');
                    window.scrollTo({
                        top: leadSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }, 1200);
            }
        });
    }
    
});
