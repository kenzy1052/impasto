//===========================================
// GALLERY FUNCTIONALITY
// ===========================================
let currentImageIndex = 1;
const totalImages = 60;
const imagesPerLoad = 12;
let currentImageCount = 12;

// Detect if device is touch-enabled
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
  lightboxImage.src = `assets/images/img${imageNumber}.jpg`;
  lightboxImage.alt = `Gallery Image ${imageNumber}`;
  lightboxCounter.textContent = `Image ${imageNumber} of ${totalImages}`;
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";

  // Setup event listeners
  setupTouchEvents();
  setupMouseEvents();
  setupKeyboardEvents();
  setupMouseWheelZoom();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = "auto";

  // Remove event listeners
  removeTouchEvents();
  removeMouseEvents();
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
  resetTransform();
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

// ===========================================
// IMPROVED ZOOM & PAN FUNCTIONALITY (Fixed All Issues)
// ===========================================
let transform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

// GESTURE STATE MANAGEMENT
let gestureState = {
  lastTouchEnd: 0,
  lastTapTime: 0,
  lastTapPosition: { x: 0, y: 0 },
  touchStartPoint: { x: 0, y: 0 },
  touchStartTime: 0,
  isDragging: false,
  isPinching: false,
  hasMoved: false,
  totalMovement: 0,
  pinchData: {
    startDistance: 0,
    startScale: 1,
    startCenter: { x: 0, y: 0 },
    startTransform: { scale: 1, translateX: 0, translateY: 0 },
    currentCenter: { x: 0, y: 0 }, // Track current pinch center
  },
};

// PAN SENSITIVITY
const PAN_SENSITIVITY = 1.2;

// GESTURE DETECTION THRESHOLDS
const DOUBLE_TAP_DELAY = 300;
const TAP_MOVEMENT_THRESHOLD = 15;
const SWIPE_THRESHOLD = 50;
const PINCH_THRESHOLD = 10;

// Immediate transform update with no transitions
function updateTransform() {
  const container = document.getElementById("lightboxImageContainer");
  if (!container) return;

  container.style.transform = `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`;

  // Update cursor based on zoom state
  if (transform.scale > 1.01) {
    container.classList.add("zoomed");
  } else {
    container.classList.remove("zoomed");
  }
}

function resetTransform() {
  transform = { scale: 1, translateX: 0, translateY: 0 };
  updateTransform();
}

function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

// Get precise image coordinates from touch/click point
function getImageCoordinates(clientX, clientY) {
  const container = document.getElementById("lightboxContent");
  if (!container) return { x: 0, y: 0 };

  const containerRect = container.getBoundingClientRect();

  return {
    x: clientX - containerRect.left - containerRect.width / 2,
    y: clientY - containerRect.top - containerRect.height / 2,
  };
}

function getImageBounds() {
  const container = document.getElementById("lightboxContent");
  const image = document.getElementById("lightboxImage");

  if (!container || !image || !image.naturalWidth) {
    return { width: 0, height: 0, displayedWidth: 0, displayedHeight: 0 };
  }

  const containerRect = container.getBoundingClientRect();
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const containerAspect = containerRect.width / containerRect.height;

  let displayedWidth, displayedHeight;
  if (imageAspect > containerAspect) {
    displayedWidth = containerRect.width * 0.95;
    displayedHeight = (containerRect.width * 0.95) / imageAspect;
  } else {
    displayedHeight = containerRect.height * 0.95;
    displayedWidth = containerRect.height * 0.95 * imageAspect;
  }

  return {
    width: containerRect.width,
    height: containerRect.height,
    displayedWidth,
    displayedHeight,
  };
}

function applyBoundaries() {
  const bounds = getImageBounds();
  if (bounds.displayedWidth === 0) return;

  const zoomedWidth = bounds.displayedWidth * transform.scale;
  const zoomedHeight = bounds.displayedHeight * transform.scale;

  let maxX = 0,
    maxY = 0;

  if (zoomedWidth > bounds.width) {
    maxX = (zoomedWidth - bounds.width) / 2;
  }
  if (zoomedHeight > bounds.height) {
    maxY = (zoomedHeight - bounds.height) / 2;
  }

  const buffer = 5;
  transform.translateX = Math.max(
    -maxX - buffer,
    Math.min(maxX + buffer, transform.translateX)
  );
  transform.translateY = Math.max(
    -maxY - buffer,
    Math.min(maxY + buffer, transform.translateY)
  );
}

function setupTouchEvents() {
  const container = document.getElementById("lightboxContent");
  if (!container) return;

  container.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });
  container.addEventListener("touchmove", handleTouchMove, {
    passive: false,
  });
  container.addEventListener("touchend", handleTouchEnd, {
    passive: false,
  });
  container.addEventListener("touchcancel", handleTouchCancel, {
    passive: false,
  });
}

function removeTouchEvents() {
  const container = document.getElementById("lightboxContent");
  if (container) {
    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
    container.removeEventListener("touchend", handleTouchEnd);
    container.removeEventListener("touchcancel", handleTouchCancel);
  }
}

function resetGestureState() {
  gestureState.isDragging = false;
  gestureState.isPinching = false;
  gestureState.hasMoved = false;
  gestureState.totalMovement = 0;
}

function handleTouchStart(e) {
  const now = Date.now();

  if (e.touches.length === 1) {
    const touch = e.touches[0];

    resetGestureState();

    gestureState.touchStartPoint = { x: touch.clientX, y: touch.clientY };
    gestureState.touchStartTime = now;

    // Check for double tap
    const timeSinceLastTap = now - gestureState.lastTapTime;
    const distanceFromLastTap = Math.sqrt(
      Math.pow(touch.clientX - gestureState.lastTapPosition.x, 2) +
        Math.pow(touch.clientY - gestureState.lastTapPosition.y, 2)
    );

    if (
      timeSinceLastTap < DOUBLE_TAP_DELAY &&
      timeSinceLastTap > 50 &&
      distanceFromLastTap < TAP_MOVEMENT_THRESHOLD
    ) {
      e.preventDefault();
      toggleZoomAtExactPoint(touch.clientX, touch.clientY);
      gestureState.lastTapTime = 0;
      return;
    }

    gestureState.lastTapPosition = { x: touch.clientX, y: touch.clientY };
    gestureState.lastTapTime = now;
  } else if (e.touches.length === 2) {
    e.preventDefault();

    gestureState.isDragging = false;
    gestureState.isPinching = true;
    gestureState.hasMoved = false;

    const center = getMidpoint(e.touches[0], e.touches[1]);
    gestureState.pinchData.startDistance = getDistance(
      e.touches[0],
      e.touches[1]
    );
    gestureState.pinchData.startScale = transform.scale;
    gestureState.pinchData.startCenter = center;
    gestureState.pinchData.currentCenter = center; // Track current center
    gestureState.pinchData.startTransform = { ...transform };
  }
}

function handleTouchMove(e) {
  e.preventDefault();

  if (gestureState.isPinching && e.touches.length === 2) {
    // PINCH ZOOM
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const currentCenter = getMidpoint(e.touches[0], e.touches[1]); // Current pinch center
    const distanceDelta = Math.abs(
      currentDistance - gestureState.pinchData.startDistance
    );

    if (distanceDelta < PINCH_THRESHOLD && !gestureState.hasMoved) return;

    gestureState.hasMoved = true;

    // Update current center for zoom out reference
    gestureState.pinchData.currentCenter = currentCenter;

    // Calculate scale change
    const scaleFactor = currentDistance / gestureState.pinchData.startDistance;
    let newScale = gestureState.pinchData.startScale * scaleFactor;
    newScale = Math.max(1, Math.min(5, newScale));

    // Use current pinch center for zoom calculations (not start center)
    const pinchPoint = getImageCoordinates(currentCenter.x, currentCenter.y);

    // Apply zoom centered on current pinch point
    const scaleChange = newScale - gestureState.pinchData.startTransform.scale;
    transform.translateX =
      gestureState.pinchData.startTransform.translateX -
      pinchPoint.x * scaleChange;
    transform.translateY =
      gestureState.pinchData.startTransform.translateY -
      pinchPoint.y * scaleChange;
    transform.scale = newScale;

    if (transform.scale <= 1.01) {
      resetTransform();
      return;
    }

    applyBoundaries();
    updateTransform();
  } else if (e.touches.length === 1 && !gestureState.isPinching) {
    // SINGLE TOUCH MOVEMENT
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureState.touchStartPoint.x;
    const deltaY = touch.clientY - gestureState.touchStartPoint.y;
    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    gestureState.totalMovement = totalDistance;

    if (transform.scale > 1.01 && totalDistance > TAP_MOVEMENT_THRESHOLD) {
      if (!gestureState.isDragging) {
        gestureState.isDragging = true;
        gestureState.hasMoved = true;
      }
    }

    // PAN (only if dragging is active)
    if (gestureState.isDragging) {
      const moveDeltaX =
        (touch.clientX - gestureState.touchStartPoint.x) * PAN_SENSITIVITY;
      const moveDeltaY =
        (touch.clientY - gestureState.touchStartPoint.y) * PAN_SENSITIVITY;

      transform.translateX += moveDeltaX;
      transform.translateY += moveDeltaY;

      applyBoundaries();
      updateTransform();

      gestureState.touchStartPoint = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }
}

function handleTouchEnd(e) {
  const now = Date.now();
  const touchDuration = now - gestureState.touchStartTime;

  if (e.touches.length === 0) {
    gestureState.lastTouchEnd = now;

    // Handle swipe navigation
    if (
      !gestureState.isPinching &&
      !gestureState.isDragging &&
      transform.scale <= 1.01 &&
      gestureState.totalMovement > SWIPE_THRESHOLD &&
      touchDuration < 500
    ) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - gestureState.touchStartPoint.x;
      const deltaY = touch.clientY - gestureState.touchStartPoint.y;

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > SWIPE_THRESHOLD
      ) {
        if (deltaX > 0) {
          previousImage();
        } else {
          nextImage();
        }
      }
    }

    resetGestureState();
  } else if (e.touches.length === 1 && gestureState.isPinching) {
    gestureState.isPinching = false;
    gestureState.isDragging = false;
    gestureState.hasMoved = false;
    gestureState.touchStartPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    gestureState.touchStartTime = now;
  }
}

function handleTouchCancel(e) {
  resetGestureState();
}

// PRECISE ZOOM AT EXACT POINT
function toggleZoomAtExactPoint(clientX, clientY) {
  const imageCoords = getImageCoordinates(clientX, clientY);

  if (transform.scale <= 1.01) {
    const targetScale = 2.5;
    const scaleChange = targetScale - transform.scale;

    transform.translateX = transform.translateX - imageCoords.x * scaleChange;
    transform.translateY = transform.translateY - imageCoords.y * scaleChange;
    transform.scale = targetScale;

    applyBoundaries();
  } else {
    resetTransform();
  }

  updateTransform();
}

// ===========================================
// MOUSE EVENTS (DESKTOP) - Fixed
// ===========================================
let isMouseDragging = false;
let mouseLastPoint = { x: 0, y: 0 };
let mouseStartTime = 0;

function setupMouseEvents() {
  const container = document.getElementById("lightboxImageContainer");

  container.addEventListener("mousedown", handleMouseDown);
  container.addEventListener("dblclick", handleMouseDoubleClick);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mouseleave", handleMouseUp);

  container.addEventListener("contextmenu", (e) => e.preventDefault());
}

function removeMouseEvents() {
  const container = document.getElementById("lightboxImageContainer");
  if (container) {
    container.removeEventListener("mousedown", handleMouseDown);
    container.removeEventListener("dblclick", handleMouseDoubleClick);
  }
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("mouseleave", handleMouseUp);
}

function handleMouseDoubleClick(e) {
  e.preventDefault();
  toggleZoomAtExactPoint(e.clientX, e.clientY);
}

function handleMouseDown(e) {
  if (e.button !== 0) return;

  mouseStartTime = Date.now();

  if (transform.scale > 1.01) {
    isMouseDragging = true;
    mouseLastPoint = { x: e.clientX, y: e.clientY };

    const container = document.getElementById("lightboxImageContainer");
    container.classList.add("dragging");
  }

  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isMouseDragging) return;

  const deltaX = (e.clientX - mouseLastPoint.x) * PAN_SENSITIVITY;
  const deltaY = (e.clientY - mouseLastPoint.y) * PAN_SENSITIVITY;

  transform.translateX += deltaX;
  transform.translateY += deltaY;

  applyBoundaries();
  updateTransform();

  mouseLastPoint = { x: e.clientX, y: e.clientY };
}

function handleMouseUp(e) {
  if (isMouseDragging) {
    isMouseDragging = false;
    const container = document.getElementById("lightboxImageContainer");
    if (container) {
      container.classList.remove("dragging");
    }
  }
}

// ===========================================
// MOUSE WHEEL ZOOM - Fixed to use current cursor position
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

  const zoomSpeed = 0.003;
  const zoomDelta = -e.deltaY * zoomSpeed;
  let newScale = transform.scale + zoomDelta;

  newScale = Math.max(1, Math.min(5, newScale));

  // Use current mouse position for zoom center (both in and out)
  const cursorPoint = getImageCoordinates(e.clientX, e.clientY);
  const scaleChange = newScale - transform.scale;

  transform.translateX = transform.translateX - cursorPoint.x * scaleChange;
  transform.translateY = transform.translateY - cursorPoint.y * scaleChange;
  transform.scale = newScale;

  if (transform.scale <= 1.01) {
    resetTransform();
    return;
  }

  applyBoundaries();
  updateTransform();
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
    } else if (transform.scale <= 1.01) {
      if (e.key === "ArrowLeft") {
        previousImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    } else {
      const panAmount = 40 * PAN_SENSITIVITY;

      if (e.key === "ArrowLeft") {
        transform.translateX -= panAmount;
      } else if (e.key === "ArrowRight") {
        transform.translateX += panAmount;
      } else if (e.key === "ArrowUp") {
        transform.translateY -= panAmount;
      } else if (e.key === "ArrowDown") {
        transform.translateY += panAmount;
      }

      applyBoundaries();
      updateTransform();
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

  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme");
    if (themeIcon) themeIcon.className = "fas fa-moon theme-icon";
    if (themeText) themeText.textContent = "Dark";
    logos.forEach((logo) => {
      logo.src = "assets/images/logo2.png";
    });
    localStorage.setItem("theme", "light");
  } else {
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
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  element.classList.add("active");

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

function toggleMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");

  if (navMenu && mobileToggle) {
    navMenu.classList.toggle("active");
    mobileToggle.classList.toggle("active");

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
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.classList.add("visible");
  }
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
  const offset = windowHeight * 0.2;
  return rect.top <= windowHeight - offset && rect.bottom >= offset;
}

// ===========================================
// EVENT LISTENERS
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  loadSavedTheme();
  initializeGallery();
  initScrollAnimations();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scrollToSection(targetId);
    });
  });
});

window.addEventListener("scroll", handleNavbarScroll);
window.addEventListener("scroll", handleScrollAnimations);

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

console.log("Impasto Photography Website Loaded Successfully!");
