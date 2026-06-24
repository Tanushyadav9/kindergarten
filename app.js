/* ==========================================
   KINDERGARTEN CLIENT APP JS - REDESIGNED
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initMobileMenu();
  initTestimonialCarousel();
  initGalleryLightbox();
  initStatsAnimator();
  initCurriculumTabs();
  initEnrollmentWizard();
  initLocateUsMap();
  initHeaderScrollEffect();
  initQuickContactForm();
  initFaqAccordion();
  initVirtualTourModal();
});

/* --- Toast Notification Helper --- */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = message;
  toast.className = `toast-msg show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================
   1. Client-side Routing & Navigation
   ========================================== */
function initRouter() {
  const pages = ['home', 'admissions', 'locate-us', 'educators'];
  
  function handleRoute() {
    let hash = window.location.hash || '#home';
    let primaryHash = hash;
    let subAnchor = '';
    
    // Parse secondary hashes like #home#programs-section
    if (hash.includes('#', 1)) {
      const parts = hash.substring(1).split('#');
      primaryHash = '#' + parts[0];
      subAnchor = parts[1];
    }
    
    let activePage = primaryHash.substring(1);
    if (!pages.includes(activePage)) {
      activePage = 'home';
    }
    
    // Deactivate all page routes, activate selected page
    pages.forEach(page => {
      const el = document.getElementById(page);
      if (el) {
        if (page === activePage) {
          el.style.display = 'block';
          // Trigger browser layout before adding transition class
          el.offsetHeight; 
          el.classList.add('active');
        } else {
          el.classList.remove('active');
          el.style.display = 'none';
        }
      }
    });
    
    // Update menu indicators
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-page') === activePage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile menu if open
    const navMenu = document.getElementById('nav-menu');
    const mobileToggle = document.getElementById('mobile-toggle');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      mobileToggle.classList.remove('active');
    }

    // Scroll handling
    if (subAnchor) {
      setTimeout(() => {
        const subEl = document.getElementById(subAnchor);
        if (subEl) {
          subEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Leaflet map needs invalidating on page display to load tiles correctly
    if (activePage === 'locate-us' && window.kindergartenMap) {
      setTimeout(() => {
        window.kindergartenMap.invalidateSize();
      }, 200);
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // Run on initial load
}

/* ==========================================
   2. Sticky Header Scroll Effect & Mobile Nav
   ========================================== */
function initHeaderScrollEffect() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  
  if (!toggle || !menu) return;
  
  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    
    // Animate hamburger lines
    const spans = toggle.querySelectorAll('span');
    if (menu.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
}

/* ==========================================
   3. Testimonial Carousel
   ========================================== */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  
  if (!track || !dotsContainer) return;
  
  const slides = Array.from(track.children);
  const dots = Array.from(dotsContainer.children);
  let currentIndex = 0;
  let autoplayTimer = null;
  
  function updateCarousel(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active dot
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  
  // Controls click events
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentIndex - 1);
      resetAutoplay();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentIndex + 1);
      resetAutoplay();
    });
  }
  
  // Dots click events
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      updateCarousel(index);
      resetAutoplay();
    });
  });
  
  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 6000);
  }
  
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }
  
  // Touch support for swiping
  let startX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    let diffX = e.changedTouches[0].clientX - startX;
    if (diffX > 50) {
      updateCarousel(currentIndex - 1); // Swipe Right -> Prev
      resetAutoplay();
    } else if (diffX < -50) {
      updateCarousel(currentIndex + 1); // Swipe Left -> Next
      resetAutoplay();
    }
  }, { passive: true });

  startAutoplay();
}

/* ==========================================
   4. Gallery Lightbox Modal
   ========================================== */
function initGalleryLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const items = document.querySelectorAll('.gallery-item');
  const closeBtn = document.getElementById('lightbox-close');
  const lightboxEmoji = document.getElementById('lightbox-emoji');
  const lightboxCaption = document.getElementById('lightbox-caption');
  
  if (!lightbox || !closeBtn) return;
  
  items.forEach(item => {
    item.addEventListener('click', () => {
      const emoji = item.querySelector('.gallery-placeholder-icon').textContent;
      const caption = item.getAttribute('data-caption');
      
      lightboxEmoji.textContent = emoji;
      lightboxCaption.textContent = caption;
      
      // Select visual style matching the item
      const color = window.getComputedStyle(item.querySelector('.gallery-placeholder')).backgroundColor;
      lightboxEmoji.parentElement.style.backgroundColor = color;
      
      lightbox.classList.add('active');
    });
  });
  
  function closeLightbox() {
    lightbox.classList.remove('active');
  }
  
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

/* ==========================================
   5. Scroll Animation Counter for Stats
   ========================================== */
function initStatsAnimator() {
  const stats = document.querySelectorAll('.stat-num');
  if (stats.length === 0) return;
  
  const speed = 200; // lower number = faster counts
  
  function animate(el) {
    const target = parseInt(el.getAttribute('data-target'));
    let count = 0;
    const increment = Math.ceil(target / speed);
    
    const updateCount = () => {
      count += increment;
      if (count < target) {
        el.textContent = count + '+';
        setTimeout(updateCount, 15);
      } else {
        el.textContent = target + '+';
      }
    };
    
    updateCount();
  }
  
  // Set up intersection observer
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.5 });
  
  stats.forEach(stat => observer.observe(stat));
}

/* ==========================================
   6. Curriculum Tabs Switcher (Admissions)
   ========================================== */
function initCurriculumTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.curriculum-content-panel');
  
  if (tabBtns.length === 0) return;
  
  function activateTab(programId) {
    // Buttons
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-program') === programId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Panels
    panels.forEach(panel => {
      if (panel.id === `curr-${programId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  }
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prog = btn.getAttribute('data-program');
      activateTab(prog);
    });
  });

  // Link clicking from homepage programs section to admissions page tab
  document.querySelectorAll('.prog-learn-more, .prog-learn-more-foot').forEach(link => {
    link.addEventListener('click', (e) => {
      const tab = link.getAttribute('data-tab');
      if (tab) {
        activateTab(tab);
      }
    });
  });
}

/* ==========================================
   7. Online Enrollment Form Wizard & Confetti
   ========================================== */
function initEnrollmentWizard() {
  const wizard = document.getElementById('enroll-wizard');
  if (!wizard) return;
  
  const form = document.getElementById('admission-form');
  const panels = Array.from(wizard.querySelectorAll('.form-step-panel'));
  const stepNodes = Array.from(wizard.querySelectorAll('.wizard-step-node'));
  const fillLine = document.getElementById('wizard-progress-bar');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const successPanel = document.getElementById('form-success');
  
  let currentStep = 1;
  const totalSteps = 3;

  function updateWizard() {
    // Update step visibility
    panels.forEach((panel, index) => {
      if (index === currentStep - 1) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
    
    // Update node states
    stepNodes.forEach((node, index) => {
      const stepNum = index + 1;
      node.classList.remove('active', 'completed');
      
      if (stepNum === currentStep) {
        node.classList.add('active');
      } else if (stepNum < currentStep) {
        node.classList.add('completed');
      }
    });
    
    // Update line fill width
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    fillLine.style.width = `${percentage}%`;
    
    // Button visibility
    if (currentStep === 1) {
      btnPrev.style.display = 'none';
    } else {
      btnPrev.style.display = 'block';
    }
    
    if (currentStep === totalSteps) {
      btnNext.innerHTML = 'Submit Application <i class="fa-solid fa-check"></i>';
    } else {
      btnNext.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    }
  }

  // Input validation
  function validateStep(step) {
    let isValid = true;
    const panel = panels[step - 1];
    const inputs = panel.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
      const errorMsg = input.nextElementSibling;
      let fieldValid = true;
      
      if (!input.value.trim()) {
        fieldValid = false;
      }
      
      // Date validation (age boundary checks)
      if (input.type === 'date' && input.id === 'child-dob') {
        const dob = new Date(input.value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        // Ages: 1.5 to 6 years old eligible
        if (isNaN(dob.getTime()) || age < 1.5 || age > 6) {
          fieldValid = false;
        }
      }
      
      // Email validation regex
      if (input.type === 'email') {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(input.value.trim())) {
          fieldValid = false;
        }
      }
      
      // Phone verification
      if (input.type === 'tel') {
        const regex = /^\d{10}$/;
        // Remove spaces, dashes, parentheses
        const cleanVal = input.value.replace(/[\s\-\(\)]/g, '');
        if (!regex.test(cleanVal)) {
          fieldValid = false;
        }
      }
      
      if (!fieldValid) {
        input.classList.add('error');
        if (errorMsg && errorMsg.classList.contains('error-msg')) {
          errorMsg.style.display = 'block';
        }
        isValid = false;
      } else {
        input.classList.remove('error');
        if (errorMsg && errorMsg.classList.contains('error-msg')) {
          errorMsg.style.display = 'none';
        }
      }
    });
    
    return isValid;
  }

  btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateWizard();
      } else {
        // Final submit
        submitInquiry();
      }
    } else {
      showToast('Please correct the highlighted fields before proceeding.', 'error');
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizard();
    }
  });

  function submitInquiry() {
    const childName = document.getElementById('child-firstname').value + ' ' + document.getElementById('child-lastname').value;
    const parentEmail = document.getElementById('parent-email').value;
    
    // Hide form structure, reveal success message
    form.style.display = 'none';
    document.getElementById('success-child-name').textContent = childName;
    document.getElementById('success-parent-email').textContent = parentEmail;
    successPanel.style.display = 'block';
    
    // Run Confetti explosion!
    triggerConfetti();
    showToast('Admissions application submitted successfully!', 'success');
  }

  // Reset form functionality
  document.getElementById('btn-reset-form').addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    successPanel.style.display = 'none';
    currentStep = 1;
    updateWizard();
    
    // Reset validations
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
  });

  /* --- Confetti Engine --- */
  function triggerConfetti() {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = wizard.offsetWidth;
    canvas.height = wizard.offsetHeight;
    
    const colors = ['#38bdf8', '#f472b6', '#4ade80', '#facc15', '#c084fc', '#fb923c'];
    const particles = [];
    
    // Initialize 80 particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 6 + 4,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 12 + 6,
        gravity: 0.35,
        friction: 0.96,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }
    
    let animationFrameId;
    
    function animateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      
      particles.forEach(p => {
        if (p.alpha <= 0) return;
        
        alive = true;
        p.speed *= p.friction;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed + p.gravity;
        p.alpha -= p.decay;
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      if (alive) {
        animationFrameId = requestAnimationFrame(animateConfetti);
      } else {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    animateConfetti();
  }
}

/* ==========================================
   8. Locate Us - Leaflet Map Integration & Timings
   ========================================== */
function initLocateUsMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  
  // Coordinates for our playschool (Sunshine Heights district)
  const lat = 40.6974;
  const lng = -73.9933;
  
  // Create map
  const map = L.map('map', {
    scrollWheelZoom: false
  }).setView([lat, lng], 15);
  
  window.kindergartenMap = map;
  
  // Add CartoDB Positron tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);
  
  const marker = L.marker([lat, lng]).addTo(map);
  
  marker.bindPopup(`
    <div style="text-align: center;">
      <h4 style="margin: 0 0 4px 0; color: #db2777; font-family: 'Fredoka', sans-serif;">Kindergarten Preschool</h4>
      <p style="margin: 0; font-size: 13px; font-weight: 500;">123 Blossom Lane, Sunshine Heights</p>
      <a href="#admissions#enrollment-section" style="display:inline-block; margin-top:8px; background:#0284c7; color:white; padding:4px 10px; border-radius:50px; text-decoration:none; font-size:11px; font-weight:600;">Apply Online</a>
    </div>
  `).openPopup();

  updateOpeningStatus();
  setInterval(updateOpeningStatus, 60000);
}

function updateOpeningStatus() {
  const statusTag = document.getElementById('timing-tag');
  if (!statusTag) return;
  
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  if (day === 0 || day === 6) {
    statusTag.textContent = 'Closed (Weekend)';
    statusTag.className = 'timing-status-tag closed';
  } else if (hour < 8 || hour >= 15) {
    statusTag.textContent = 'Closed Now (Hours: 8 AM - 3 PM)';
    statusTag.className = 'timing-status-tag closed';
  } else {
    statusTag.textContent = 'Open Now (Hours: 8 AM - 3 PM)';
    statusTag.className = 'timing-status-tag open';
  }
}

/* ==========================================
   9. Quick Contact Inquiry Submission
   ========================================== */
function initQuickContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    
    // Simulate API request
    setTimeout(() => {
      form.reset();
      showToast(`Thank you, <strong>${name}</strong>! Your campus tour booking request has been sent successfully.`, 'success');
    }, 600);
  });
}

/* ==========================================
   10. Parent FAQs Accordion
   ========================================== */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-header');
  
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.faq-body');
      const isOpen = item.classList.contains('open');
      
      // Close other open FAQ items for a clean toggle accordion feel
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-body').style.maxHeight = '0px';
        }
      });
      
      if (isOpen) {
        item.classList.remove('open');
        body.style.maxHeight = '0px';
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================
   11. Virtual School Tour Modal Setup
   ========================================== */
function initVirtualTourModal() {
  const modal = document.getElementById('tour-modal');
  const openBtn = document.getElementById('btn-open-tour');
  const mediaTrigger = document.getElementById('media-tour-trigger');
  const closeBtn = document.getElementById('tour-modal-close');
  
  if (!modal || !closeBtn) return;
  
  function openModal() {
    modal.classList.add('active');
  }
  
  function closeModal() {
    modal.classList.remove('active');
  }
  
  if (openBtn) openBtn.addEventListener('click', openModal);
  if (mediaTrigger) mediaTrigger.addEventListener('click', openModal);
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}
