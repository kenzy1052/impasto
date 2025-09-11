//===========================================
// GALLERY FUNCTIONALITY
// ===========================================
let currentImageIndex = 1;
let currentZoom = 1;
let translateX = 0;
let translateY = 0;
const totalImages = 60;
const imagesPerLoad = 12;
let currentImageCount = 12;

// Touch device variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartDistance = 0;
let isPinching = false;
let isDragging = false;
let lastTapTime = 0;
const doubleTapDelay = 300; // milliseconds between taps for double-tap

// Non-touch device variables
let dragStartX = 0;
let dragStartY = 0;
let startTranslateX = 0;
let startTranslateY = 0;
let mouseDownTime = 0;
let hasMoved = false;
const dragThreshold = 5; // pixels to move before considering it a drag

// Inertia variables
let velocityX = 0;
let velocityY = 0;
let lastTouchX = 0;
let lastTouchY = 0;
let lastTouchTime = 0;
let animationFrameId = null;

// Detect if device is touch-enabled - improved detection
const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
  );
};

// Initialize gallery
function initializeGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  // Load only the first 12 images initially
  for (let i = 1; i <= currentImageCount; i++) {
    const galleryItem = createGalleryItem(i);
    galleryGrid.appendChild(galleryItem);
  }
}

// Create gallery item
function createGalleryItem(imageNumber) {
  const item = document.createElement("div");
  item.className = "gallery-item fade-in";
  item.onclick = () => openLightbox(imageNumber);

  const img = document.createElement("img");
  img.src = `assets/images/img${imageNumber}.jpg`;
  img.alt = `Gallery Image ${imageNumber}`;
  img.className = "no-context-menu";
  img.draggable = false;
  img.oncontextmenu = () => false;

  const overlay = document.createElement("div");
  overlay.className = "gallery-overlay";

  const info = document.createElement("div");
  info.className = "gallery-info";
  info.innerHTML = `<div class="gallery-number">Image ${imageNumber} of ${totalImages}</div>`;

  overlay.appendChild(info);
  item.appendChild(img);
  item.appendChild(overlay);

  setTimeout(() => {
    if (isElementInViewport(item)) {
      item.classList.add("visible");
    }
  }, 100);

  return item;
}

// Load more images
function loadMoreImages() {
  const galleryGrid = document.getElementById("galleryGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  loadMoreBtn.disabled = true;
  loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  setTimeout(() => {
    const remainingImages = Math.min(
      imagesPerLoad,
      totalImages - currentImageCount
    );

    for (let i = 1; i <= remainingImages; i++) {
      const imageNumber = currentImageCount + i;
      const galleryItem = createGalleryItem(imageNumber);
      galleryGrid.appendChild(galleryItem);
    }

    currentImageCount += remainingImages;

    if (currentImageCount >= totalImages) {
      loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Images Loaded';
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> View More';
    }
  }, 800);
}

// ===========================================
// LIGHTBOX FUNCTIONALITY
// ===========================================
function openLightbox(imageNumber) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCounter = document.getElementById("lightboxCounter");

  currentImageIndex = imageNumber;
  currentZoom = 1;
  translateX = 0;
  translateY = 0;

  lightboxImage.src = `assets/images/img${imageNumber}.jpg`;
  lightboxImage.alt = `Gallery Image ${imageNumber}`;
  lightboxCounter.textContent = `Image ${imageNumber} of ${totalImages}`;

  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";

  // Update image transform
  updateImageTransform();

  // Setup appropriate event listeners based on device type
  // Always setup both mouse and touch events for devices with both capabilities
  setupMouseEvents();
  setupTouchEvents();

  // Setup common events
  setupKeyboardEvents();
  setupMouseWheelZoom();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");

  lightbox.classList.remove("active");
  document.body.style.overflow = "auto";

  // Cancel any ongoing animations
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Reset zoom and position
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();

  // Remove event listeners
  removeMouseEvents();
  removeTouchEvents();
  removeKeyboardEvents();
  removeMouseWheelZoom();
}

function updateLightboxImage() {
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCounter = document.getElementById("lightboxCounter");

  lightboxImage.src = `assets/images/img${currentImageIndex}.jpg`;
  lightboxImage.alt = `Gallery Image ${currentImageIndex}`;
  lightboxCounter.textContent = `Image ${currentImageIndex} of ${totalImages}`;

  // Reset zoom and position for new image
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();
}

function previousImage() {
  if (currentImageIndex > 1) {
    currentImageIndex--;
    updateLightboxImage();
  } else {
    // Loop to last image
    currentImageIndex = totalImages;
    updateLightboxImage();
  }
}

function nextImage() {
  if (currentImageIndex < totalImages) {
    currentImageIndex++;
    updateLightboxImage();
  } else {
    // Loop to first image
    currentImageIndex = 1;
    updateLightboxImage();
  }
}

function updateImageTransform() {
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;

  // Update cursor based on zoom state
  if (currentZoom > 1) {
    imageContainer.classList.add("zoomed");
  } else {
    imageContainer.classList.remove("zoomed");
  }
}

// ===========================================
// BOUNDARY CALCULATION
// ===========================================
function calculateBoundaries() {
  const container = document.getElementById("lightboxContent");
  const image = document.getElementById("lightboxImage");

  if (!container || !image) return { maxX: 0, maxY: 0 };

  const containerRect = container.getBoundingClientRect();

  // Get the natural dimensions of the image
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  // Calculate the displayed dimensions of the image (without zoom)
  const containerAspect = containerRect.width / containerRect.height;
  const imageAspect = naturalWidth / naturalHeight;

  let displayedWidth, displayedHeight;

  if (imageAspect > containerAspect) {
    // Image is wider than container (relative to their aspect ratios)
    displayedWidth = containerRect.width;
    displayedHeight = containerRect.width / imageAspect;
  } else {
    // Image is taller than container (relative to their aspect ratios)
    displayedHeight = containerRect.height;
    displayedWidth = containerRect.height * imageAspect;
  }

  // Calculate the dimensions after zoom
  const zoomedWidth = displayedWidth * currentZoom;
  const zoomedHeight = displayedHeight * currentZoom;

  // Calculate maximum allowed translation
  let maxX = 0;
  let maxY = 0;

  if (zoomedWidth > containerRect.width) {
    maxX = (zoomedWidth - containerRect.width) / 2;
  }

  if (zoomedHeight > containerRect.height) {
    maxY = (zoomedHeight - containerRect.height) / 2;
  }

  return { maxX, maxY };
}

function clampPosition() {
  const { maxX, maxY } = calculateBoundaries();

  // Clamp translateX and translateY to keep image within boundaries
  translateX = Math.max(-maxX, Math.min(maxX, translateX));
  translateY = Math.max(-maxY, Math.min(maxY, translateY));
}

// ===========================================
// DESKTOP ZOOM & PAN BEHAVIOR
// ===========================================
function toggleZoom(x, y) {
  const container = document.getElementById("lightboxContent");
  const containerRect = container.getBoundingClientRect();

  if (currentZoom === 1) {
    // Zoom in to 2x
    currentZoom = 2;

    // Calculate the offset from the center of the container to the mouse position
    // Adjust for current zoom level to prevent jumping
    const offsetX =
      ((containerRect.width / 2 - (x - containerRect.left)) *
        (currentZoom - 1)) /
      currentZoom;
    const offsetY =
      ((containerRect.height / 2 - (y - containerRect.top)) *
        (currentZoom - 1)) /
      currentZoom;

    translateX = offsetX;
    translateY = offsetY;
  } else {
    // Zoom out
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
  }

  // Clamp position and update transform
  clampPosition();
  updateImageTransform();
}

// ===========================================
// TOUCH DEVICE FUNCTIONALITY
// ===========================================
function setupTouchEvents() {
  const imageContainer = document.getElementById("lightboxImageContainer");

  imageContainer.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });

  imageContainer.addEventListener("touchmove", handleTouchMove, {
    passive: false,
  });

  imageContainer.addEventListener("touchend", handleTouchEnd, {
    passive: true,
  });
}

function removeTouchEvents() {
  const imageContainer = document.getElementById("lightboxImageContainer");

  if (imageContainer) {
    imageContainer.removeEventListener("touchstart", handleTouchStart);
    imageContainer.removeEventListener("touchmove", handleTouchMove);
    imageContainer.removeEventListener("touchend", handleTouchEnd);
  }
}

function handleTouchStart(e) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  // Detect double-tap
  if (tapLength < doubleTapDelay && tapLength > 0 && e.touches.length === 1) {
    // Double-tap detected
    const touch = e.touches[0];
    toggleZoom(touch.clientX, touch.clientY);
    e.preventDefault();
  }

  lastTapTime = currentTime;

  // Store touch start position
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lastTouchX = touchStartX;
    lastTouchY = touchStartY;
    lastTouchTime = Date.now();

    // Only allow dragging when zoomed in
    isDragging = currentZoom > 1;

    // Reset velocity
    velocityX = 0;
    velocityY = 0;
  }

  // Detect pinch-to-zoom
  if (e.touches.length === 2) {
    isPinching = true;
    isDragging = false; // Ensure we're not in dragging mode

    // Calculate initial distance between two touches
    touchStartDistance = getDistance(e.touches[0], e.touches[1]);

    // Prevent default to avoid page zoom
    e.preventDefault();
  }
}

function handleTouchMove(e) {
  if (isPinching && e.touches.length === 2) {
    // Pinch-to-zoom logic
    e.preventDefault(); // Prevent page scroll during pinch

    // Calculate current distance between two touches
    const currentDistance = getDistance(e.touches[0], e.touches[1]);

    // Calculate scale factor
    const scale = currentDistance / touchStartDistance;

    // Apply zoom with limits (min: 1, max: 5)
    let newZoom = currentZoom * scale;
    newZoom = Math.max(1, Math.min(5, newZoom));

    // Store the old zoom level for center calculation
    const oldZoom = currentZoom;
    currentZoom = newZoom;
    touchStartDistance = currentDistance;

    // Calculate the center of the pinch gesture
    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    // Calculate the container position
    const container = document.getElementById("lightboxContent");
    const containerRect = container.getBoundingClientRect();

    // Calculate the position of the pinch center relative to the container
    const relX = centerX - containerRect.left;
    const relY = centerY - containerRect.top;

    // Calculate the offset from the center of the container
    const offsetX = containerRect.width / 2 - relX;
    const offsetY = containerRect.height / 2 - relY;

    // Calculate the zoom factor
    const zoomFactor = currentZoom / oldZoom;

    // If we're zooming out, gradually move the image towards the center
    if (currentZoom < oldZoom) {
      // Calculate the centering factor (0 when zoom is 1, 1 when zoom is at max)
      const centeringFactor = 1 - (currentZoom - 1) / 4; // 4 is maxZoom - 1

      // Apply centering by moving the translation towards 0
      translateX =
        translateX * zoomFactor + offsetX * (1 - zoomFactor) * centeringFactor;
      translateY =
        translateY * zoomFactor + offsetY * (1 - zoomFactor) * centeringFactor;
    } else {
      // When zooming in, adjust translation to keep the pinch center fixed
      translateX = translateX * zoomFactor + offsetX * (1 - zoomFactor);
      translateY = translateY * zoomFactor + offsetY * (1 - zoomFactor);
    }

    // If we're at or below zoom level 1, reset to center
    if (currentZoom <= 1) {
      currentZoom = 1;
      translateX = 0;
      translateY = 0;
    }

    // Clamp position to keep image within boundaries
    clampPosition();
    updateImageTransform();
  } else if (isDragging && e.touches.length === 1) {
    // Panning when zoomed in with one finger
    e.preventDefault(); // Prevent page scroll during pan

    const touch = e.touches[0];
    const currentTime = Date.now();

    // Calculate velocity for inertia
    const timeDiff = currentTime - lastTouchTime;
    if (timeDiff > 0) {
      velocityX = (touch.clientX - lastTouchX) / timeDiff;
      velocityY = (touch.clientY - lastTouchY) / timeDiff;
    }

    // Calculate new position
    const deltaX = touch.clientX - lastTouchX;
    const deltaY = touch.clientY - lastTouchY;

    translateX += deltaX;
    translateY += deltaY;

    // Clamp position to keep image within boundaries
    clampPosition();

    // Update transform
    updateImageTransform();

    // Update last touch position and time
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
    lastTouchTime = currentTime;
  }
}

function handleTouchEnd(e) {
  // Handle swipe navigation only if not zoomed in and not dragging
  if (
    currentZoom === 1 &&
    !isDragging &&
    !isPinching &&
    e.changedTouches.length === 1
  ) {
    const touch = e.changedTouches[0];
    const swipeThreshold = 50;
    const diffX = touchStartX - touch.clientX;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        nextImage();
      } else {
        previousImage();
      }
    }
  }

  // Apply inertia if we were dragging and there's velocity
  if (isDragging && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
    applyInertia();
  }

  // Reset flags
  isDragging = false;
  isPinching = false;
}

function applyInertia() {
  const inertia = () => {
    // Apply velocity to position
    translateX += velocityX * 16; // 16ms is roughly one frame at 60fps
    translateY += velocityY * 16;

    // Apply friction
    velocityX *= 0.95;
    velocityY *= 0.95;

    // Clamp position to keep image within boundaries
    clampPosition();

    // Update transform
    updateImageTransform();

    // Continue animation if there's still significant velocity
    if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
      animationFrameId = requestAnimationFrame(inertia);
    }
  };

  // Start the inertia animation
  animationFrameId = requestAnimationFrame(inertia);
}

function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// ===========================================
// NON-TOUCH DEVICE FUNCTIONALITY (DESKTOP)
// ===========================================
function setupMouseEvents() {
  const imageContainer = document.getElementById("lightboxImageContainer");

  // Use native dblclick for zoom
  imageContainer.addEventListener("dblclick", (e) => {
    e.preventDefault();
    toggleZoom(e.clientX, e.clientY);
  });

  // Dragging
  imageContainer.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  imageContainer.addEventListener("contextmenu", (e) => e.preventDefault());
}

function removeMouseEvents() {
  const imageContainer = document.getElementById("lightboxImageContainer");

  if (imageContainer) {
    imageContainer.removeEventListener("dblclick", handleDoubleClick);
    imageContainer.removeEventListener("mousedown", handleMouseDown);
  }

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
}

function handleDoubleClick(e) {
  // Prevent default behavior
  e.preventDefault();

  // Zoom in/out at the clicked position
  toggleZoom(e.clientX, e.clientY);
}

function handleMouseDown(e) {
  if (currentZoom <= 1 || e.button !== 0) return; // Only left click when zoomed

  mouseDownTime = Date.now();
  hasMoved = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startTranslateX = translateX;
  startTranslateY = translateY;

  // Don't set isDragging = true yet, wait for movement beyond threshold
  const imageContainer = document.getElementById("lightboxImageContainer");

  // Remove transition during drag for immediate response
  imageContainer.classList.add("no-transition");

  e.preventDefault();
  e.stopPropagation();
}

function handleMouseMove(e) {
  if (mouseDownTime > 0) {
    // Check if mouse has moved beyond threshold
    const deltaX = Math.abs(e.clientX - dragStartX);
    const deltaY = Math.abs(e.clientY - dragStartY);

    if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      // Mouse has moved beyond threshold, start dragging
      hasMoved = true;
      isDragging = true;
      const imageContainer = document.getElementById("lightboxImageContainer");
      imageContainer.classList.add("dragging");
    }

    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();

      // Calculate new position
      const moveX = e.clientX - dragStartX;
      const moveY = e.clientY - dragStartY;

      translateX = startTranslateX + moveX;
      translateY = startTranslateY + moveY;

      // Clamp position to keep image within boundaries
      clampPosition();

      // Update transform immediately without transition
      updateImageTransform();
    }
  }
}

function handleMouseUp() {
  if (mouseDownTime > 0) {
    mouseDownTime = 0;

    if (isDragging) {
      isDragging = false;
      const imageContainer = document.getElementById("lightboxImageContainer");
      imageContainer.classList.remove("dragging");
    }

    // Restore transition after drag
    const imageContainer = document.getElementById("lightboxImageContainer");
    imageContainer.classList.remove("no-transition");
  }
}

// ===========================================
// MOUSE WHEEL ZOOM
// ===========================================
function setupMouseWheelZoom() {
  const lightbox = document.getElementById("lightbox");
  lightbox.addEventListener("wheel", handleMouseWheel, {
    passive: false,
  });
}

function removeMouseWheelZoom() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.removeEventListener("wheel", handleMouseWheel);
  }
}

function handleMouseWheel(e) {
  e.preventDefault();

  // Set min and max zoom levels
  const minZoom = 1;
  const maxZoom = 5;

  // Calculate zoom delta based on wheel direction
  const zoomDelta = -e.deltaY * 0.001;
  const newZoom = currentZoom + zoomDelta;

  if (newZoom >= minZoom && newZoom <= maxZoom) {
    currentZoom = newZoom;

    // If we're zooming out to 1, reset position
    if (currentZoom <= 1) {
      currentZoom = 1;
      translateX = 0;
      translateY = 0;
    }

    // Clamp position and update transform
    clampPosition();
    updateImageTransform();
  }
}

// ===========================================
// KEYBOARD FUNCTIONALITY
// ===========================================
function setupKeyboardEvents() {
  document.addEventListener("keydown", handleKeyDown);
}

function removeKeyboardEvents() {
  document.removeEventListener("keydown", handleKeyDown);
}

function handleKeyDown(e) {
  const lightbox = document.getElementById("lightbox");

  if (lightbox && lightbox.classList.contains("active")) {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (currentZoom === 1) {
      // When not zoomed, use arrow keys for navigation
      if (e.key === "ArrowLeft") {
        previousImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    } else {
      // When zoomed, use arrow keys for panning
      const panAmount = 30; // pixels to pan

      // Fixed arrow key directions to match intuitive behavior:
      if (e.key === "ArrowLeft") {
        translateX -= panAmount; // Move image left to see more of the right
      } else if (e.key === "ArrowRight") {
        translateX += panAmount; // Move image right to see more of the left
      } else if (e.key === "ArrowUp") {
        translateY -= panAmount; // Move image up to see more of the bottom
      } else if (e.key === "ArrowDown") {
        translateY += panAmount; // Move image down to see more of the top
      }

      // Clamp position and update transform
      clampPosition();
      updateImageTransform();
    }
  }
}

// ===========================================
// THEME TOGGLE FUNCTIONALITY
// ===========================================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector(".theme-icon");
  const themeText = document.querySelector(".theme-text");
  const logos = document.querySelectorAll(".logo-icon, .footer-logo-icon");

  // Check current theme
  if (body.getAttribute("data-theme") === "dark") {
    // Switch to light theme
    body.removeAttribute("data-theme");
    if (themeIcon) themeIcon.className = "fas fa-moon theme-icon";
    if (themeText) themeText.textContent = "Dark";
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2.png";
    });
    localStorage.setItem("theme", "light");
  } else {
    // Switch to dark theme
    body.setAttribute("data-theme", "dark");
    if (themeIcon) themeIcon.className = "fas fa-sun theme-icon";
    if (themeText) themeText.textContent = "Light";
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
// NAVIGATION FUNCTIONALITY
// ===========================================
function setActiveNav(element) {
  // Remove active class from all nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add active class to clicked link
  element.classList.add("active");

  // Close mobile menu if open
  const navMenu = document.getElementById("navMenu");
  if (navMenu && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");

    // Reset mobile menu toggle icon
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    if (mobileToggle) {
      mobileToggle.classList.remove("active");
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }
}

function toggleMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");

  if (navMenu && mobileToggle) {
    navMenu.classList.toggle("active");
    mobileToggle.classList.toggle("active");

    // Change icon based on menu state
    if (navMenu.classList.contains("active")) {
      mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    // Close mobile menu if open
    const navMenu = document.getElementById("navMenu");
    if (navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      const mobileToggle = document.querySelector(".mobile-menu-toggle");
      if (mobileToggle) {
        mobileToggle.classList.remove("active");
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
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

// ===========================================
// SCROLL ANIMATION FUNCTIONS
// ===========================================
function initScrollAnimations() {
  // Make hero section visible immediately
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.classList.add("visible");
  }

  // Trigger initial check for elements in view
  handleScrollAnimations();
}

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

  // Initialize gallery
  initializeGallery();

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
