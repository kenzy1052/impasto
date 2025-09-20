// ===========================================
// THEME TOGGLE FUNCTIONALITY
// ===========================================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector(".theme-icon");
  const themeText = document.querySelector(".theme-text");
  const logos = document.querySelectorAll(".logo-icon, .footer-logo-icon");

  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme");
    themeIcon.className = "fas fa-moon theme-icon";
    themeText.textContent = "Dark";
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2.png";
    });
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    themeIcon.className = "fas fa-sun theme-icon";
    themeText.textContent = "Light";
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2d.png";
    });
    localStorage.setItem("theme", "dark");
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    const themeIcon = document.querySelector(".theme-icon");
    const themeText = document.querySelector(".theme-text");
    if (themeIcon) themeIcon.className = "fas fa-sun theme-icon";
    if (themeText) themeText.textContent = "Light";
    const logos = document.querySelectorAll(".logo-icon, .footer-logo-icon");
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2d.png";
    });
  }
}

// ===========================================
// NAVIGATION FUNCTIONALITY - COMPLETE FIX
// ===========================================
// Define parent-child relationships for navigation
const navHierarchy = {
  "information.html": [
    "faq.html",
    "portfolio.html",
    "client-questionnaire.html",
    "reviews.html",
  ],
  "ratecards.html": ["portrait.html", "wedding.html"],
};

// Override any existing setActiveNav function
function setActiveNav(element) {
  // Prevent default behavior
  if (window.event) {
    window.event.preventDefault();
  }

  // Get the href attribute
  const href = element.getAttribute("href");

  // Only handle internal links (not anchor links)
  if (href && !href.startsWith("#")) {
    // Close mobile menu if open
    closeMobileMenu();

    // Navigate to the new page
    window.location.href = href;
  }

  // Set active state
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  element.classList.add("active");
}

// Set active state based on current page with parent-child relationships
function setActiveNavBasedOnPage() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  // First, remove active class from all nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Check if current page is a child page
  let parentPage = null;
  for (const [parent, children] of Object.entries(navHierarchy)) {
    if (children.includes(currentPath)) {
      parentPage = parent;
      break;
    }
  }

  // Set active state
  if (parentPage) {
    // If it's a child page, set the parent as active
    const parentLink = document.querySelector(
      `.nav-link[href="${parentPage}"]`
    );
    if (parentLink) {
      parentLink.classList.add("active");
    }
  } else {
    // If it's a parent page or standalone page, set it as active
    const currentLink = document.querySelector(
      `.nav-link[href="${currentPath}"]`
    );
    if (currentLink) {
      currentLink.classList.add("active");
    }
  }
}

// Handle navigation clicks with event delegation
function handleNavigationClicks() {
  document.addEventListener("click", function (e) {
    // Check if clicked element is a nav link
    const navLink = e.target.closest(".nav-link");
    if (navLink && !navLink.closest(".dropdown-toggle")) {
      const href = navLink.getAttribute("href");

      // Only handle internal links (not anchor links)
      if (href && !href.startsWith("#")) {
        e.preventDefault();

        // Close mobile menu if open
        closeMobileMenu();

        // Navigate to the new page
        window.location.href = href;
      }
    }
  });
}

// Mobile menu functions
function toggleMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const overlay = document.getElementById("mobileMenuOverlay");

  if (navMenu && mobileToggle && overlay) {
    const isActive = navMenu.classList.contains("active");

    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }
}

function openMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const overlay = document.getElementById("mobileMenuOverlay");

  navMenu.classList.add("active");
  mobileToggle.classList.add("active");
  overlay.classList.add("active");
  mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const overlay = document.getElementById("mobileMenuOverlay");

  if (navMenu && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");
    if (mobileToggle) {
      mobileToggle.classList.remove("active");
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    if (overlay) {
      overlay.classList.remove("active");
    }
    document.body.style.overflow = "";
  }
}

function toggleDropdown(element) {
  if (window.innerWidth < 1024) {
    const dropdownMenu =
      element.parentElement.parentElement.querySelector(".dropdown-menu");
    const dropdownArrow = element.querySelector(".dropdown-arrow");

    if (dropdownMenu && dropdownArrow) {
      dropdownMenu.classList.toggle("open");
      dropdownArrow.classList.toggle("open");

      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
    }
  }
}

// ===========================================
// SCROLL AND ANIMATION FUNCTIONS
// ===========================================
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    closeMobileMenu();
    const navbarHeight = document.getElementById("navbar").offsetHeight;
    const targetPosition = section.offsetTop - navbarHeight - 20;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

function handleNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
}

function initScrollAnimations() {
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.classList.add("visible");
  }

  setTimeout(() => {
    handleScrollAnimations();
  }, 150);

  setTimeout(() => {
    handleScrollAnimations();
  }, 500);
}

function handleScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".fade-in:not(.visible), .slide-in-left:not(.visible), .slide-in-right:not(.visible), .scale-in:not(.visible), .scroll-animate:not(.visible), .text-animate:not(.visible)"
  );

  animatedElements.forEach((element, index) => {
    if (isElementInViewport(element)) {
      setTimeout(() => {
        element.classList.add("visible");
      }, index * 100);
    }
  });
}

function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const elementHeight = rect.height;
  const triggerPoint = elementHeight * 0.2;
  const viewportTriggerLine = windowHeight * 0.8;
  const isTopInTriggerZone = rect.top <= viewportTriggerLine;
  const isElementPartiallyVisible = rect.top < windowHeight && rect.bottom > 0;
  const hasMinimumVisibility = rect.top <= windowHeight - triggerPoint;

  return (
    isTopInTriggerZone && isElementPartiallyVisible && hasMinimumVisibility
  );
}

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

const throttledScrollHandler = throttle(() => {
  handleScrollAnimations();
}, 16);

// ===========================================
// HERO SLIDER FUNCTIONALITY
// ===========================================
let heroCurrentSlide = 0;
let heroTotalSlides = 5;
let heroSlideInterval;
let isAnimating = false;

function updateHeroSlide() {
  if (isAnimating) return;

  isAnimating = true;

  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dot");

  if (heroSlides.length === 0 || heroDots.length === 0) {
    isAnimating = false;
    return;
  }

  heroSlides.forEach((slide) => slide.classList.remove("active"));
  heroDots.forEach((dot) => dot.classList.remove("active"));

  heroSlides[heroCurrentSlide].classList.add("active");
  heroDots[heroCurrentSlide].classList.add("active");

  setTimeout(() => {
    isAnimating = false;
  }, 1000);
}

function nextHeroSlide() {
  heroCurrentSlide = (heroCurrentSlide + 1) % heroTotalSlides;
  updateHeroSlide();
}

function previousHeroSlide() {
  heroCurrentSlide = (heroCurrentSlide - 1 + heroTotalSlides) % heroTotalSlides;
  updateHeroSlide();
}

function goToSlide(slideIndex) {
  if (slideIndex >= 0 && slideIndex < heroTotalSlides && !isAnimating) {
    heroCurrentSlide = slideIndex;
    updateHeroSlide();
  }
}

function startHeroAutoSlide() {
  if (document.querySelector(".hero-slide")) {
    heroSlideInterval = setInterval(() => {
      nextHeroSlide();
    }, 6000);
  }
}

function stopHeroAutoSlide() {
  if (heroSlideInterval) {
    clearInterval(heroSlideInterval);
  }
}

function initHeroSlider() {
  const heroSlides = document.querySelectorAll(".hero-slide");
  if (heroSlides.length > 0) {
    heroTotalSlides = heroSlides.length;
    updateHeroSlide();
    startHeroAutoSlide();

    const heroDots = document.querySelectorAll(".hero-dot");
    heroDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToSlide(index);
        stopHeroAutoSlide();
        setTimeout(startHeroAutoSlide, 3000);
      });
    });
  }
}

// ===========================================
// INITIALIZATION AND EVENT LISTENERS
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  // Load saved theme
  loadSavedTheme();

  // Set active navigation based on current page
  setActiveNavBasedOnPage();

  // Handle navigation clicks
  handleNavigationClicks();

  // Initialize hero slider if it exists
  initHeroSlider();

  // Initialize scroll animations
  initScrollAnimations();

  // Add smooth scrolling to anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scrollToSection(targetId);
    });
  });

  // Trigger animations on page load
  setTimeout(() => {
    handleScrollAnimations();
  }, 250);
});

// Global event listeners
window.addEventListener("scroll", handleNavbarScroll);
window.addEventListener("scroll", throttledScrollHandler);

window.addEventListener(
  "resize",
  debounce(() => {
    handleScrollAnimations();
  }, 250)
);

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopHeroAutoSlide();
  } else {
    startHeroAutoSlide();
  }
});

window.addEventListener("focus", startHeroAutoSlide);
window.addEventListener("blur", stopHeroAutoSlide);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeMobileMenu();
  }

  if (e.key === "ArrowLeft") {
    previousHeroSlide();
    stopHeroAutoSlide();
    setTimeout(startHeroAutoSlide, 3000);
  }
  if (e.key === "ArrowRight") {
    nextHeroSlide();
    stopHeroAutoSlide();
    setTimeout(startHeroAutoSlide, 3000);
  }
});

// ===========================================
// IMAGE PROTECTION
// ===========================================
document.addEventListener("contextmenu", function (e) {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
    return false;
  }
});

document.addEventListener("dragstart", function (e) {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
    return false;
  }
});

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
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

console.log("Impasto Photography Website Loaded Successfully! 📸");
