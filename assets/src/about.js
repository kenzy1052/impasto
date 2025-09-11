// ===========================================
// ABOUT PAGE SPECIFIC FUNCTIONALITY
// ===========================================

/**
 * Initialize About Page specific animations and interactions
 */
function initAboutPage() {
  // Initialize scroll animations for about page elements
  initAboutScrollAnimations();

  // Add smooth scrolling for internal links
  initSmoothScrolling();

  // Initialize timeline animations
  initTimelineAnimations();

  // Initialize team member hover effects
  initTeamMemberEffects();

  // Initialize value cards hover effects
  initValueCardEffects();
}

/**
 * Initialize scroll animations specific to about page
 */
function initAboutScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".about-hero .fade-in, .our-story .fade-in, .mission-vision .slide-in-left, " +
      ".our-values .fade-in, .meet-team .slide-in-right, .journey-timeline .fade-in, " +
      ".cta-section .slide-in-up"
  );

  // Trigger initial check
  handleAboutScrollAnimations();

  // Add scroll event listener
  window.addEventListener("scroll", handleAboutScrollAnimations);
}

/**
 * Handle about page scroll animations
 */
function handleAboutScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".about-hero .fade-in:not(.visible), .our-story .fade-in:not(.visible), " +
      ".mission-vision .slide-in-left:not(.visible), .our-values .fade-in:not(.visible), " +
      ".meet-team .slide-in-right:not(.visible), .journey-timeline .fade-in:not(.visible), " +
      ".cta-section .slide-in-up:not(.visible)"
  );

  animatedElements.forEach((element) => {
    if (isElementInViewport(element)) {
      element.classList.add("visible");
    }
  });
}

/**
 * Initialize smooth scrolling for internal navigation
 */
function initSmoothScrolling() {
  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

/**
 * Initialize timeline animations
 */
function initTimelineAnimations() {
  const timelineItems = document.querySelectorAll(".timeline-item");

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  timelineItems.forEach((item) => {
    // Set initial state
    item.style.opacity = "0";
    item.style.transform = "translateY(30px)";
    item.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    // Observe the item
    observer.observe(item);
  });
}

/**
 * Initialize team member hover effects
 */
function initTeamMemberEffects() {
  const teamMembers = document.querySelectorAll(".team-member");

  teamMembers.forEach((member) => {
    const overlay = member.querySelector(".member-overlay");
    const socialLinks = member.querySelectorAll(".member-overlay .social-link");

    // Add hover effect for the entire team member card
    member.addEventListener("mouseenter", () => {
      member.style.transform = "translateY(-10px)";
    });

    member.addEventListener("mouseleave", () => {
      member.style.transform = "translateY(0)";
    });

    // Add staggered animation for social links
    if (overlay) {
      overlay.addEventListener("mouseenter", () => {
        socialLinks.forEach((link, index) => {
          setTimeout(() => {
            link.style.transform = "scale(1.1)";
          }, index * 100);
        });
      });

      overlay.addEventListener("mouseleave", () => {
        socialLinks.forEach((link) => {
          link.style.transform = "scale(1)";
        });
      });
    }
  });
}

/**
 * Initialize value cards hover effects
 */
function initValueCardEffects() {
  const valueItems = document.querySelectorAll(".value-item");

  valueItems.forEach((item) => {
    const icon = item.querySelector(".value-icon");

    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateY(-5px)";
      if (icon) {
        icon.style.transform = "scale(1.1) rotate(5deg)";
      }
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateY(0)";
      if (icon) {
        icon.style.transform = "scale(1) rotate(0deg)";
      }
    });
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
  const offset = windowHeight * 0.2;

  return rect.top <= windowHeight - offset && rect.bottom >= offset;
}

/**
 * Add parallax effect to hero section
 */
function initParallaxEffect() {
  const heroSection = document.querySelector(".about-hero");

  if (heroSection) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;

      heroSection.style.transform = `translateY(${parallax}px)`;
    });
  }
}

/**
 * Initialize counter animation for timeline years
 */
function initCounters() {
  const timelineYears = document.querySelectorAll(".timeline-year");

  const observerOptions = {
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const yearElement = entry.target;
        const targetYear = parseInt(yearElement.textContent);

        // Simple animation effect
        yearElement.style.transform = "scale(1.2)";
        yearElement.style.color = "var(--accent-color2)";

        setTimeout(() => {
          yearElement.style.transform = "scale(1)";
          yearElement.style.color = "var(--accent-color)";
        }, 300);

        // Unobserve after animation
        observer.unobserve(yearElement);
      }
    });
  }, observerOptions);

  timelineYears.forEach((year) => {
    observer.observe(year);
  });
}

/**
 * Add interactive elements to mission/vision cards
 */
function initMissionVisionInteractions() {
  const missionCard = document.querySelector(".mission-card");
  const visionCard = document.querySelector(".vision-card");

  if (missionCard) {
    missionCard.addEventListener("click", () => {
      missionCard.style.transform = "scale(1.02)";
      setTimeout(() => {
        missionCard.style.transform = "translateY(-5px)";
      }, 200);
    });
  }

  if (visionCard) {
    visionCard.addEventListener("click", () => {
      visionCard.style.transform = "scale(1.02)";
      setTimeout(() => {
        visionCard.style.transform = "translateY(-5px)";
      }, 200);
    });
  }
}

/**
 * Initialize all about page functionality when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize about page specific functionality
  initAboutPage();

  // Initialize parallax effect
  initParallaxEffect();

  // Initialize counter animations
  initCounters();

  // Initialize mission/vision interactions
  initMissionVisionInteractions();

  // Set active nav item for about page
  const aboutLinks = document.querySelectorAll('a[href="about.html"]');
  aboutLinks.forEach((link) => {
    link.classList.add("active");
  });
});

/**
 * Cleanup event listeners when page is unloaded
 */
window.addEventListener("beforeunload", function () {
  // Remove scroll event listener
  window.removeEventListener("scroll", handleAboutScrollAnimations);
});

// Export functions for external use if needed
window.AboutPage = {
  init: initAboutPage,
  refreshAnimations: handleAboutScrollAnimations,
};

console.log("About Page Loaded Successfully! 📸");
