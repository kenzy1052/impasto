// ===========================================
// THEME TOGGLE FUNCTIONALITY
// ===========================================
/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector(".theme-icon");
  const themeText = document.querySelector(".theme-text");
  const logos = document.querySelectorAll(
    ".logo-icon, .footer-logo-icon, .logo-icon2"
  );
  // Check current theme
  if (body.getAttribute("data-theme") === "dark") {
    // Switch to light theme
    body.removeAttribute("data-theme");
    themeIcon.className = "fas fa-moon theme-icon";
    themeText.textContent = "Dark";
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2.png";
    });
    localStorage.setItem("theme", "light");
  } else {
    // Switch to dark theme
    body.setAttribute("data-theme", "dark");
    themeIcon.className = "fas fa-sun theme-icon";
    themeText.textContent = "Light";
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2d.png";
    });
    localStorage.setItem("theme", "dark");
  }
}
/**
 * Load saved theme preference on page load
 */
function loadSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    document.querySelector(".theme-icon").className = "fas fa-sun theme-icon";
    document.querySelector(".theme-text").textContent = "Light";
    const logos = document.querySelectorAll(
      ".logo-icon, .footer-logo-icon, .logo-icon2"
    );
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2d.png";
    });
  }
}
// ===========================================
// NAVIGATION FUNCTIONALITY
// ===========================================
/**
 * Set active navigation item
 * @param {HTMLElement} element - The clicked navigation link
 */
function setActiveNav(element) {
  // Remove active class from all nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  // Add active class to clicked link
  element.classList.add("active");
  // Close mobile menu if open
  const navMenu = document.getElementById("navMenu");
  if (navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");
    // Reset mobile menu toggle icon
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    mobileToggle.classList.remove("active");
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
  }
}
/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");

  navMenu.classList.toggle("active");
  mobileToggle.classList.toggle("active");

  // Change icon based on menu state
  if (navMenu.classList.contains("active")) {
    mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
  } else {
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
  }
}
/**
 * Smooth scroll to section
 * @param {string} sectionId - The ID of the section to scroll to
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    // Close mobile menu if open
    const navMenu = document.getElementById("navMenu");
    if (navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      const mobileToggle = document.querySelector(".mobile-menu-toggle");
      mobileToggle.classList.remove("active");
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
/**
 * Handle navbar scroll effect
 */
function handleNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

// ===========================================
// IMPROVED SCROLL ANIMATION FUNCTIONS
// ===========================================
/**
 * Initialize scroll animations with professional timing
 */
function initScrollAnimations() {
  // Make hero section visible immediately
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.classList.add("visible");
  }

  // Initial check for elements already in viewport
  setTimeout(() => {
    handleScrollAnimations();
  }, 150);

  // Second check to catch any dynamically loaded content
  setTimeout(() => {
    handleScrollAnimations();
  }, 500);
}

/**
 * Enhanced scroll animation handler with better viewport detection
 */
function handleScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".fade-in:not(.visible), .slide-in-left:not(.visible), .slide-in-right:not(.visible), .scale-in:not(.visible)"
  );

  animatedElements.forEach((element) => {
    if (isElementInViewport(element)) {
      element.classList.add("visible");
    }
  });
}

/**
 * Improved viewport detection with multiple trigger points
 * @param {HTMLElement} element - The element to check
 * @return {boolean} - True if element is in viewport
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;

  // Much more aggressive triggering - animate as soon as any part is visible
  // This creates a more responsive and professional feel
  const topVisible = rect.top < windowHeight;
  const bottomVisible = rect.bottom > 0;

  // Element is considered "in view" if any part is visible
  return topVisible && bottomVisible;
}

/**
 * Alternative function for elements that need earlier triggering
 * Triggers when element is about to enter viewport
 * @param {HTMLElement} element - The element to check
 * @return {boolean} - True if element is about to be in viewport
 */
function isElementAboutToBeVisible(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;

  // Trigger when element is 100px before entering viewport
  const earlyTriggerOffset = 100;

  return (
    rect.top < windowHeight + earlyTriggerOffset &&
    rect.bottom > -earlyTriggerOffset
  );
}

/**
 * Enhanced scroll handler with throttling for better performance
 */
const throttledScrollHandler = throttle(() => {
  handleScrollAnimations();
}, 16); // ~60fps

/**
 * Throttle function for better performance than debounce for scroll events
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @return {Function} - The throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ===========================================
// EVENT LISTENERS
// ===========================================
// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load saved theme
  loadSavedTheme();
  // Initialize gallery
  if (typeof initializeGallery === "function") {
    initializeGallery();
  }
  // Initialize scroll animations
  initScrollAnimations();
  // Initialize Intersection Observer
  initIntersectionObserver();

  // Add smooth scrolling to all navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scrollToSection(targetId);
    });
  });

  // Trigger animations on page load for elements already in view
  setTimeout(() => {
    handleScrollAnimations();
    observeNewElements();
  }, 250);
});

// Optimized scroll event listeners
window.addEventListener("scroll", handleNavbarScroll);
window.addEventListener("scroll", throttledScrollHandler);

// Handle resize events to recalculate element positions
window.addEventListener(
  "resize",
  debounce(() => {
    handleScrollAnimations();
  }, 250)
);

// Keyboard navigation for lightbox
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (typeof closeLightbox === "function") {
      closeLightbox();
    }
  }
  // Close mobile menu on escape
  if (e.key === "Escape") {
    const navMenu = document.getElementById("navMenu");
    if (navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      const mobileToggle = document.querySelector(".mobile-menu-toggle");
      if (mobileToggle) {
        mobileToggle.classList.remove("active");
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    }
  }
});

// ===========================================
// IMAGE PROTECTION
// ===========================================
// Prevent right-click on the entire document
document.addEventListener("contextmenu", function (e) {
  // Check if the target is an image
  if (e.target.tagName === "IMG") {
    e.preventDefault();
    return false;
  }
});
// Prevent drag and drop of images
document.addEventListener("dragstart", function (e) {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
    return false;
  }
});

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The wait time in milliseconds
 * @return {Function} - The debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Console log for debugging
console.log("Impasto Photography Website Loaded Successfully! 📸");
