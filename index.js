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
    // 3. Editorial Problems Section (Clean Interaction)
    // ==========================================================================
    // Smooth scrolling already handled by global anchor listener

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
    // 5. Interactive Funnel Form (Lead Generator) & Cloudflare Turnstile
    // ==========================================================================
    const form = document.getElementById('probetraining-funnel-form');
    const steps = Array.from(document.querySelectorAll('.funnel-step'));
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const progressFill = document.getElementById('progress-fill');
    const successView = document.getElementById('funnel-success');
    const formErrorMsg = document.getElementById('form-error-msg');
    
    // Cloudflare Turnstile Configuration
    // Registered domains: onelife.friese-scholz.workers.dev and onelife-nienburg.de
    // Test key '1x00000000000000000000AA' always passes (ideal for local / tunnel preview)
    const isTunnelOrLocal = window.location.hostname.includes('trycloudflare.com') || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';

    const TURNSTILE_SITEKEY = (window.TURNSTILE_SITEKEY && !isTunnelOrLocal)
        ? window.TURNSTILE_SITEKEY
        : '1x00000000000000000000AA';

    let currentStep = 1;
    let turnstileWidgetId = null;
    let turnstileToken = '';

    function renderTurnstile() {
        const container = document.getElementById('cf-turnstile-container');
        if (!container || !window.turnstile) return;
        if (turnstileWidgetId !== null) return; // Prevent duplicate render

        try {
            container.innerHTML = '';
            turnstileWidgetId = window.turnstile.render(container, {
                sitekey: TURNSTILE_SITEKEY,
                theme: 'dark',
                callback: function(token) {
                    turnstileToken = token;
                    if (formErrorMsg) formErrorMsg.style.display = 'none';
                },
                'expired-callback': function() {
                    turnstileToken = '';
                },
                'error-callback': function() {
                    console.warn('Turnstile challenge error - check domain whitelisting.');
                }
            });
        } catch (err) {
            console.warn('Turnstile render exception:', err);
        }
    }
    
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

        // Render Turnstile when reaching Step 3
        if (currentStep === 3) {
            if (window.turnstile) {
                renderTurnstile();
            } else {
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (window.turnstile) {
                        renderTurnstile();
                        clearInterval(checkInterval);
                    } else if (attempts > 30) {
                        clearInterval(checkInterval);
                    }
                }, 100);
            }
        }
    }
    
    function validateStep(stepNum) {
        const stepContainer = document.querySelector(`.funnel-step[data-step="${stepNum}"]`);
        if (!stepContainer) return true;

        if (formErrorMsg) formErrorMsg.style.display = 'none';
        
        // Validate radio buttons (Step 1 and Step 2)
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

        if (!inputsValid) {
            if (formErrorMsg) {
                formErrorMsg.textContent = 'Bitte fülle alle Pflichtfelder aus und bestätige die Datenschutzerklärung.';
                formErrorMsg.style.display = 'block';
            }
            return false;
        }
        
        return true;
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

    const GOAL_LABELS = {
        'ruecken': 'Rückenschmerzen lindern',
        'gewicht': 'Abnehmen & Körper straffen',
        'muskeln': 'Muskeln aufbauen',
        'energie': 'Mehr Energie im Alltag'
    };

    const CORPORATE_LABELS = {
        'hansefit': 'Hansefit Firmenfitness',
        'egym': 'EGYM Wellpass Firmenfitness',
        'epassy': 'Epassi Firmenfitness',
        'nein': 'Nein, Privatzahler / Selbstzahler'
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateStep(currentStep)) {
                return;
            }

            const submitBtn = document.getElementById('submit-btn');
            const originalBtnContent = submitBtn.innerHTML;

            // Check Turnstile token if available
            const token = turnstileToken || (window.turnstile && turnstileWidgetId !== null ? window.turnstile.getResponse(turnstileWidgetId) : '');

            // Collect Form Data
            const goalInput = form.querySelector('input[name="goal"]:checked');
            const corporateInput = form.querySelector('input[name="corporate"]:checked');
            const nameInput = document.getElementById('client-name');
            const emailInput = document.getElementById('client-email');
            const phoneInput = document.getElementById('client-phone');

            const goalVal = goalInput ? goalInput.value : '';
            const corpVal = corporateInput ? corporateInput.value : '';
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const phoneVal = phoneInput ? phoneInput.value.trim() : '';

            const formattedGoal = GOAL_LABELS[goalVal] || goalVal || 'Nicht angegeben';
            const formattedCorp = CORPORATE_LABELS[corpVal] || corpVal || 'Nicht angegeben';
            const requestDate = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'full', timeStyle: 'short' });
            const originHost = window.location.hostname || 'onelife-nienburg.de';

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.75';
            submitBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                <span>Wird gesichert übertragen...</span>
            `;

            if (formErrorMsg) formErrorMsg.style.display = 'none';

            // Premium HTML Email Template for Scholz & Friese OneLife Lead System
            const emailSubject = `⚡ Neue Anfrage Probetraining: ${nameVal} (${formattedGoal})`;
            const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Neue Probetraining-Anfrage</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0e14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0e14; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121824; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #00C853, #10B981, #FACC15); height: 5px;"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #00C853; margin-bottom: 8px;">
                OneLife Nienburg • Lead Management
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Neue Anfrage für ein Probetraining
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94A3B8;">
                Eingegangen am ${requestDate} Uhr
              </p>
            </td>
          </tr>
          
          <!-- Lead Summary Card -->
          <tr>
            <td style="padding: 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                
                <!-- Contact Details Header -->
                <tr>
                  <td colspan="2" style="padding-bottom: 14px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #FACC15;">
                      👤 Kontaktdaten des Interessenten
                    </div>
                  </td>
                </tr>

                <!-- Name -->
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; color: #94A3B8; width: 140px;">
                    Name:
                  </td>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 16px; font-weight: 700; color: #ffffff;">
                    ${escapeHtml(nameVal)}
                  </td>
                </tr>

                <!-- Phone -->
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; color: #94A3B8;">
                    Telefonnummer:
                  </td>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 16px; font-weight: 700; color: #00C853;">
                    <a href="tel:${escapeHtml(phoneVal.replace(/\s+/g, ''))}" style="color: #00C853; text-decoration: none;">
                      📞 ${escapeHtml(phoneVal)}
                    </a>
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; color: #94A3B8;">
                    E-Mail:
                  </td>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 15px; color: #60A5FA;">
                    <a href="mailto:${escapeHtml(emailVal)}" style="color: #60A5FA; text-decoration: underline;">
                      ${escapeHtml(emailVal)}
                    </a>
                  </td>
                </tr>

                <!-- Training Goal -->
                <tr>
                  <td style="padding: 14px 0 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; color: #94A3B8;">
                    Sportliches Ziel:
                  </td>
                  <td style="padding: 14px 0 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 15px; font-weight: 600; color: #F1F5F9;">
                    <span style="display: inline-block; background: rgba(0, 200, 83, 0.15); border: 1px solid rgba(0, 200, 83, 0.35); color: #86EFAC; padding: 4px 10px; border-radius: 6px; font-size: 13px;">
                      🎯 ${escapeHtml(formattedGoal)}
                    </span>
                  </td>
                </tr>

                <!-- Corporate Fitness -->
                <tr>
                  <td style="padding: 10px 0 14px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; color: #94A3B8;">
                    Firmenfitness:
                  </td>
                  <td style="padding: 10px 0 14px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 15px; font-weight: 600; color: #F1F5F9;">
                    <span style="display: inline-block; background: rgba(250, 204, 21, 0.12); border: 1px solid rgba(250, 204, 21, 0.3); color: #FDE047; padding: 4px 10px; border-radius: 6px; font-size: 13px;">
                      🏢 ${escapeHtml(formattedCorp)}
                    </span>
                  </td>
                </tr>

                <!-- Source / Security -->
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748B;">
                    Website &amp; Status:
                  </td>
                  <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748B;">
                    ${escapeHtml(originHost)} • Turnstile ${token ? 'validiert' : 'bereit'}
                  </td>
                </tr>

              </table>
              
              <!-- Action Call-to-Action Buttons -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
                <a href="tel:${escapeHtml(phoneVal.replace(/\s+/g, ''))}" style="display: inline-block; background-color: #00C853; color: #080a0f; text-decoration: none; font-weight: 800; font-size: 15px; padding: 12px 24px; border-radius: 8px; margin: 4px; box-shadow: 0 4px 14px rgba(0, 200, 83, 0.35);">
                  📞 Jetzt anrufen (${escapeHtml(phoneVal)})
                </a>
                <a href="mailto:${escapeHtml(emailVal)}?subject=Dein%20kostenloses%20Probetraining%20bei%20OneLife%20Nienburg" style="display: inline-block; background-color: rgba(255, 255, 255, 0.08); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 20px; border-radius: 8px; margin: 4px; border: 1px solid rgba(255, 255, 255, 0.15);">
                  ✉️ E-Mail antworten
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0d14; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748B;">
              OneLife Nienburg • Hannoversche Str. 60, 31582 Nienburg/Weser<br>
              Lead-System engineered by Scholz &amp; Friese Webdesign
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

            const payload = {
                from: "OneLife Nienburg <noreply@scholz-friese-webdesign.de>",
                to: ["friese.scholz@gmail.com"],
                reply_to: emailVal,
                subject: emailSubject,
                html: emailHtml
            };

            try {
                const response = await fetch('https://resend-mailer.friese-scholz.workers.dev', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok || (data && data.id)) {
                    // Success View
                    form.style.display = 'none';
                    progressFill.style.width = '100%';
                    successView.classList.add('active');

                    // Reset Turnstile if widget active
                    if (window.turnstile && turnstileWidgetId !== null) {
                        try { window.turnstile.reset(turnstileWidgetId); } catch (e) {}
                    }

                    // Smooth scroll to top of lead section
                    const leadSection = document.getElementById('lead-form');
                    if (leadSection) {
                        window.scrollTo({
                            top: leadSection.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    throw new Error(data.message || data.error || 'Fehler beim Senden');
                }
            } catch (err) {
                console.error('Mail dispatch error:', err);
                if (formErrorMsg) {
                    formErrorMsg.textContent = 'Es gab ein Problem beim Absenden deiner Anfrage. Bitte überprüfe deine Angaben oder kontaktiere uns direkt telefonisch.';
                    formErrorMsg.style.display = 'block';
                }
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    // ==========================================================================
    // 6. Award Video Player Interaction (Instagram Reel / Trophy Video)
    // ==========================================================================
    const awardVideoBox = document.querySelector('.award-video-box');
    if (awardVideoBox) {
        const awardVideo = awardVideoBox.querySelector('video');
        const awardPlayBtn = awardVideoBox.querySelector('.award-play-btn');
        const awardMuteBtn = document.getElementById('award-mute-toggle');

        if (awardVideo) {
            const togglePlay = () => {
                if (awardVideo.paused) {
                    awardVideo.play().then(() => {
                        awardVideoBox.classList.add('is-playing');
                    }).catch(err => {
                        console.log('Video autoplay prevented:', err);
                    });
                } else {
                    awardVideo.pause();
                    awardVideoBox.classList.remove('is-playing');
                }
            };

            if (awardPlayBtn) {
                awardPlayBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    togglePlay();
                });
            }

            awardVideo.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });

            awardVideo.addEventListener('pause', () => {
                awardVideoBox.classList.remove('is-playing');
            });

            awardVideo.addEventListener('ended', () => {
                awardVideoBox.classList.remove('is-playing');
            });

            // Mute / Unmute toggle
            if (awardMuteBtn) {
                awardMuteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    awardVideo.muted = !awardVideo.muted;
                    const unmutedIcon = awardMuteBtn.querySelector('.icon-unmuted');
                    const mutedIcon = awardMuteBtn.querySelector('.icon-muted');
                    if (awardVideo.muted) {
                        if (mutedIcon) mutedIcon.style.display = 'block';
                        if (unmutedIcon) unmutedIcon.style.display = 'none';
                    } else {
                        if (mutedIcon) mutedIcon.style.display = 'none';
                        if (unmutedIcon) unmutedIcon.style.display = 'block';
                    }
                });
            }
        }
    }

    // ==========================================================================
    // 7. FAQ Accordion Interaction
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close other open FAQ items for a clean editorial feel
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherBtn = otherItem.querySelector('.faq-question');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    questionBtn.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // ==========================================================================
    // 8. Hero Featured Video (Right Column) Interaction
    // Autoplays muted. Minimal controls: Replay (spins & restarts) & Sound (mute/unmute)
    // ==========================================================================
    const heroCard = document.getElementById('hero-featured-card');
    const heroVideo = document.getElementById('hero-featured-video');
    const replayBtn = document.getElementById('hero-replay-btn');
    const soundBtn = document.getElementById('hero-sound-btn');
    const mutedIcon = document.querySelector('.icon-sound-muted');
    const activeIcon = document.querySelector('.icon-sound-active');
    const progressBar = document.getElementById('hero-video-progress');

    if (heroCard && heroVideo) {
        // Update sound icon state
        const updateSoundState = (unmuted) => {
            if (unmuted) {
                if (mutedIcon) mutedIcon.style.display = 'none';
                if (activeIcon) activeIcon.style.display = 'block';
                if (soundBtn) {
                    soundBtn.classList.add('is-active');
                    soundBtn.setAttribute('title', 'Ton stummschalten');
                    soundBtn.setAttribute('aria-label', 'Ton stummschalten');
                }
                heroCard.classList.add('has-sound');
            } else {
                if (mutedIcon) mutedIcon.style.display = 'block';
                if (activeIcon) activeIcon.style.display = 'none';
                if (soundBtn) {
                    soundBtn.classList.remove('is-active');
                    soundBtn.setAttribute('title', 'Ton einschalten');
                    soundBtn.setAttribute('aria-label', 'Ton einschalten');
                }
                heroCard.classList.remove('has-sound');
            }
        };

        // Replay Button: spins smoothly and restarts video
        if (replayBtn) {
            replayBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                // Trigger smooth rotation animation
                replayBtn.classList.remove('is-spinning');
                void replayBtn.offsetWidth; // force reflow
                replayBtn.classList.add('is-spinning');
                setTimeout(() => replayBtn.classList.remove('is-spinning'), 650);

                // Restart video from 0
                heroVideo.currentTime = 0;
                heroVideo.play().catch(err => console.log('Replay error:', err));
            });
        }

        // Sound Toggle Button: switches between muted and unmuted
        if (soundBtn) {
            soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                heroVideo.muted = !heroVideo.muted;
                if (!heroVideo.muted) {
                    heroVideo.volume = 1.0;
                    heroVideo.play().catch(err => console.log('Sound play error:', err));
                }
                updateSoundState(!heroVideo.muted);
            });
        }

        // Clicking the video card itself (outside the buttons)
        heroCard.addEventListener('click', () => {
            if (heroVideo.muted) {
                // If currently muted, unmute and play from beginning
                heroVideo.currentTime = 0;
                heroVideo.muted = false;
                heroVideo.volume = 1.0;
                heroVideo.play().catch(err => console.log('Video card play error:', err));
                updateSoundState(true);
            } else {
                // Toggle play/pause if already unmuted
                if (heroVideo.paused) {
                    heroVideo.play();
                    heroCard.classList.remove('is-paused');
                } else {
                    heroVideo.pause();
                    heroCard.classList.add('is-paused');
                }
            }
        });

        heroCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                heroCard.click();
            }
        });

        // Track video progress bar
        heroVideo.addEventListener('timeupdate', () => {
            if (progressBar && heroVideo.duration) {
                const percent = (heroVideo.currentTime / heroVideo.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
        });

        // Reset progress on loop/ended
        heroVideo.addEventListener('ended', () => {
            if (progressBar) progressBar.style.width = '0%';
        });
    }
    
});
