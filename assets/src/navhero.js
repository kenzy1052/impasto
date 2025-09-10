// ===========================================
// HERO SLIDER FUNCTIONALITY
// ===========================================
let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slide");
const indicators = document.querySelectorAll(".hero-indicator");
const totalSlides = slides.length;

/**
 * Go to a specific slide
 * @param {number} slideIndex - Index of the slide to go to
 */
function goToSlide(slideIndex) {
  // Remove active class from all slides and indicators
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  // Add active class to the selected slide and indicator
  slides[slideIndex].classList.add("active");
  indicators[slideIndex].classList.add("active");

  // Update current slide index
  currentSlide = slideIndex;
}

/**
 * Go to the next slide
 */
function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
}

/**
 * Initialize the hero slider
 */
function initHeroSlider() {
  // Auto-advance slides every 5 seconds
  setInterval(nextSlide, 5000);
}

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
  const logos = document.querySelectorAll(".logo-icon, .footer-logo-icon");
  // Check current theme
  if (body.getAttribute("data-theme") === "dark") {
    // Switch to light theme
    body.removeAttribute("data-theme");
    themeIcon.className = "fas fa-moon theme-icon";
    themeText.textContent = "Dark";
    logos.forEach((logo) => {
      logo.src = "/assets/images/logo2.png";
    });
    localStorage.setItem("theme", "light");
  } else {
    // Switch to dark theme
    body.setAttribute("data-theme", "dark");
    themeIcon.className = "fas fa-sun theme-icon";
    themeText.textContent = "Light";
    logos.forEach((logo) => {
      logo.src = "/assets/images/logo2d.png";
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
    const logos = document.querySelectorAll(".logo-icon, .footer-logo-icon");
    logos.forEach((logo) => {
      logo.src = "/assets/images/logo2d.png";
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
  // Don't set active if this is a dropdown toggle
  if (element.classList.contains("dropdown-toggle")) {
    return;
  }

  // Remove active class from all nav links
  document
    .querySelectorAll(".nav-link:not(.dropdown-toggle)")
    .forEach((link) => {
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
    // Hide overlay
    document.getElementById("mobileMenuOverlay").classList.remove("active");
  }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const overlay = document.getElementById("mobileMenuOverlay");

  navMenu.classList.toggle("active");
  mobileToggle.classList.toggle("active");
  overlay.classList.toggle("active");

  // Change icon based on menu state
  if (navMenu.classList.contains("active")) {
    mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
  } else {
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
  }
}

/**
 * Toggle dropdown menu (for mobile)
 * @param {HTMLElement} element - The clicked dropdown toggle
 */
function toggleDropdown(element) {
  // Only for mobile view
  if (window.innerWidth < 1024) {
    const dropdownMenu =
      element.parentElement.parentElement.querySelector(".dropdown-menu");
    const dropdownArrow = element.querySelector(".dropdown-arrow");
    const parentLink = element.parentElement.querySelector(
      ".nav-link:not(.dropdown-toggle)"
    );

    dropdownMenu.classList.toggle("open");
    dropdownArrow.classList.toggle("open");

    // Prevent default link behavior
    event.preventDefault();
    event.stopPropagation();

    // Remove hover/active effects from parent link when dropdown is open
    if (dropdownMenu.classList.contains("open")) {
      parentLink.style.color = "";
      parentLink.classList.remove("active");
    }
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
      document.getElementById("mobileMenuOverlay").classList.remove("active");
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
// SCROLL ANIMATION FUNCTIONS
// ===========================================
/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
  // Make hero section visible immediately
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.classList.add("visible");
  }
  // Trigger initial check for elements in view
  handleScrollAnimations();
}

/**
 * Handle scroll animations
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
 * Check if element is in viewport
 * @param {HTMLElement} element - The element to check
 * @return {boolean} - True if element is in viewport
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  // Add some offset for better timing (trigger when element is 80% visible)
  const offset = windowHeight * 0.2;
  return rect.top <= windowHeight - offset && rect.bottom >= offset;
}

// ===========================================
// EVENT LISTENERS
// ===========================================
// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load saved theme
  loadSavedTheme();
  // Initialize hero slider
  initHeroSlider();
  // Initialize scroll animations
  initScrollAnimations();
  // Add smooth scrolling to all navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scrollToSection(targetId);
    });
  });
});

// Scroll event listeners
window.addEventListener("scroll", handleNavbarScroll);
window.addEventListener("scroll", handleScrollAnimations);

// Keyboard navigation for lightbox
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeLightbox();
  }
  // Close mobile menu on escape
  if (e.key === "Escape") {
    const navMenu = document.getElementById("navMenu");
    if (navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      const mobileToggle = document.querySelector(".mobile-menu-toggle");
      mobileToggle.classList.remove("active");
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      document.getElementById("mobileMenuOverlay").classList.remove("active");
    }
  }
});
