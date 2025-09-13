//===========================================
// GALLERY FUNCTIONALITY - FIXED
// ===========================================
let currentImageIndex = 1;
let currentZoom = 1;
let translateX = 0;
let translateY = 0;
const totalImages = 60;
const imagesPerLoad = 12;
let currentImageCount = 0; // Start at 0, not 12
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

// Swipe variables
let isSwipeGesture = false;
const swipeThreshold = 50;
const swipeVelocityThreshold = 0.5;

// History management for mobile back button
let lightboxOpen = false;

// Detect if device is touch-enabled - improved detection
const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
  );
};

// Initialize gallery - FIXED
function initializeGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  // Load the first 12 images initially
  loadMoreImages(); // This will load images 1-12
}

// Create gallery item - FIXED
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

// Load more images - FIXED WITH ANIMATION TRIGGER
function loadMoreImages() {
  const galleryGrid = document.getElementById("galleryGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  }

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

    // Trigger animations for newly loaded images
    if (typeof observeNewElements === "function") {
      observeNewElements(); // Use Intersection Observer if available
    } else if (typeof forceCheckAnimations === "function") {
      forceCheckAnimations(); // Fallback to manual check
    }

    if (loadMoreBtn) {
      if (currentImageCount >= totalImages) {
        loadMoreBtn.innerHTML =
          '<i class="fas fa-check"></i> All Images Loaded';
      } else {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> View More';
      }
    }
  }, 800);
}

// ===========================================
// LIGHTBOX FUNCTIONALITY WITH HISTORY MANAGEMENT
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
  lightboxOpen = true;

  // Add history entry for mobile back button support
  if (history.pushState) {
    history.pushState({ lightbox: true }, "", "");
  }

  // Update image transform
  updateImageTransform();

  // Setup appropriate event listeners based on device type
  setupMouseEvents();
  setupTouchEvents();
  setupKeyboardEvents();
  setupMouseWheelZoom();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = "auto";
  lightboxOpen = false;

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

// Handle browser back button
window.addEventListener("popstate", function (event) {
  if (lightboxOpen) {
    closeLightbox();
  }
});

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
  if (imageContainer) {
    imageContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;

    // Update cursor based on zoom state
    if (currentZoom > 1) {
      imageContainer.classList.add("zoomed");
    } else {
      imageContainer.classList.remove("zoomed");
    }
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
  if (!container) return;

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
// IMPROVED TOUCH DEVICE FUNCTIONALITY
// ===========================================
function setupTouchEvents() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    lightbox.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    lightbox.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });
  }
}

function removeTouchEvents() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.removeEventListener("touchstart", handleTouchStart);
    lightbox.removeEventListener("touchmove", handleTouchMove);
    lightbox.removeEventListener("touchend", handleTouchEnd);
  }
}

function handleTouchStart(e) {
  // Prevent default only if we're handling the touch
  if (
    e.target.closest(".lightbox-top-bar") ||
    e.target.closest(".lightbox-nav")
  ) {
    return; // Let buttons handle their own events
  }

  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  // Detect double-tap for smoother zooming
  if (tapLength < doubleTapDelay && tapLength > 0 && e.touches.length === 1) {
    // Double-tap detected
    const touch = e.touches[0];
    toggleZoom(touch.clientX, touch.clientY);
    e.preventDefault();
    return;
  }

  lastTapTime = currentTime;

  // Store touch start position
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lastTouchX = touchStartX;
    lastTouchY = touchStartY;
    lastTouchTime = Date.now();
    isSwipeGesture = false;

    // Only allow dragging when zoomed in
    isDragging = currentZoom > 1;

    // Reset velocity
    velocityX = 0;
    velocityY = 0;
  }

  // Detect pinch-to-zoom with improved smoothness
  if (e.touches.length === 2) {
    isPinching = true;
    isDragging = false;
    isSwipeGesture = false;
    // Calculate initial distance between two touches
    touchStartDistance = getDistance(e.touches[0], e.touches[1]);
    // Prevent default to avoid page zoom
    e.preventDefault();
  }
}

function handleTouchMove(e) {
  // Prevent default only if we're handling the gesture
  if (
    e.target.closest(".lightbox-top-bar") ||
    e.target.closest(".lightbox-nav")
  ) {
    return;
  }

  if (isPinching && e.touches.length === 2) {
    // Enhanced pinch-to-zoom logic with smoother transitions
    e.preventDefault();

    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / touchStartDistance;

    // Apply zoom with smoother limits
    let newZoom = currentZoom * scale;
    newZoom = Math.max(0.8, Math.min(4, newZoom)); // Allow slight zoom-out for bounce-back effect

    const oldZoom = currentZoom;
    currentZoom = newZoom;
    touchStartDistance = currentDistance;

    // Calculate center of pinch
    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    const container = document.getElementById("lightboxContent");
    const containerRect = container.getBoundingClientRect();

    const relX = centerX - containerRect.left;
    const relY = centerY - containerRect.top;

    const offsetX = containerRect.width / 2 - relX;
    const offsetY = containerRect.height / 2 - relY;

    const zoomFactor = currentZoom / oldZoom;

    if (currentZoom < oldZoom) {
      const centeringFactor = 1 - (Math.max(currentZoom, 1) - 1) / 3;
      translateX =
        translateX * zoomFactor + offsetX * (1 - zoomFactor) * centeringFactor;
      translateY =
        translateY * zoomFactor + offsetY * (1 - zoomFactor) * centeringFactor;
    } else {
      translateX = translateX * zoomFactor + offsetX * (1 - zoomFactor);
      translateY = translateY * zoomFactor + offsetY * (1 - zoomFactor);
    }

    // Smooth snap-back to zoom = 1 when under-zoomed
    if (currentZoom <= 1) {
      currentZoom = 1;
      translateX = translateX * 0.9; // Smooth transition to center
      translateY = translateY * 0.9;
    }

    clampPosition();
    updateImageTransform();
  } else if (e.touches.length === 1) {
    const touch = e.touches[0];
    const currentTime = Date.now();

    if (isDragging && currentZoom > 1) {
      // Enhanced panning when zoomed in
      e.preventDefault();

      const timeDiff = currentTime - lastTouchTime;
      if (timeDiff > 0) {
        velocityX = ((touch.clientX - lastTouchX) / timeDiff) * 0.8; // Smoother velocity
        velocityY = ((touch.clientY - lastTouchY) / timeDiff) * 0.8;
      }

      const deltaX = touch.clientX - lastTouchX;
      const deltaY = touch.clientY - lastTouchY;
      translateX += deltaX;
      translateY += deltaY;

      clampPosition();
      updateImageTransform();

      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      lastTouchTime = currentTime;
    } else if (currentZoom === 1) {
      // Track potential swipe when not zoomed
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);

      if (deltaX > 10 || deltaY > 10) {
        isSwipeGesture = true;
      }
    }
  }
}

function handleTouchEnd(e) {
  if (
    e.target.closest(".lightbox-top-bar") ||
    e.target.closest(".lightbox-nav")
  ) {
    return;
  }

  // Handle swipe navigation when not zoomed and not pinching
  if (
    currentZoom === 1 &&
    !isPinching &&
    isSwipeGesture &&
    e.changedTouches.length === 1
  ) {
    const touch = e.changedTouches[0];
    const diffX = touchStartX - touch.clientX;
    const diffY = Math.abs(touchStartY - touch.clientY);

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY * 1.5) {
      e.preventDefault(); // Prevent any default behavior
      if (diffX > 0) {
        nextImage();
      } else {
        previousImage();
      }
    }
  }

  // Apply enhanced inertia if we were dragging
  if (isDragging && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
    applyInertia();
  }

  // Reset flags
  isDragging = false;
  isPinching = false;
  isSwipeGesture = false;
}

function applyInertia() {
  const inertia = () => {
    translateX += velocityX * 20; // Increased momentum
    translateY += velocityY * 20;

    velocityX *= 0.92; // Smoother deceleration
    velocityY *= 0.92;

    clampPosition();
    updateImageTransform();

    if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
      animationFrameId = requestAnimationFrame(inertia);
    }
  };

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
  if (imageContainer) {
    // Use native dblclick for zoom
    imageContainer.addEventListener("dblclick", handleDoubleClick);
    // Dragging
    imageContainer.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    imageContainer.addEventListener("contextmenu", (e) => e.preventDefault());
  }
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
  e.preventDefault();
  toggleZoom(e.clientX, e.clientY);
}

function handleMouseDown(e) {
  if (currentZoom <= 1 || e.button !== 0) return;

  mouseDownTime = Date.now();
  hasMoved = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startTranslateX = translateX;
  startTranslateY = translateY;

  const imageContainer = document.getElementById("lightboxImageContainer");
  if (imageContainer) {
    imageContainer.classList.add("no-transition");
  }

  e.preventDefault();
  e.stopPropagation();
}

function handleMouseMove(e) {
  if (mouseDownTime > 0) {
    const deltaX = Math.abs(e.clientX - dragStartX);
    const deltaY = Math.abs(e.clientY - dragStartY);

    if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      hasMoved = true;
      isDragging = true;
      const imageContainer = document.getElementById("lightboxImageContainer");
      if (imageContainer) {
        imageContainer.classList.add("dragging");
      }
    }

    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();

      const moveX = e.clientX - dragStartX;
      const moveY = e.clientY - dragStartY;
      translateX = startTranslateX + moveX;
      translateY = startTranslateY + moveY;

      clampPosition();
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
      if (imageContainer) {
        imageContainer.classList.remove("dragging");
      }
    }

    const imageContainer = document.getElementById("lightboxImageContainer");
    if (imageContainer) {
      imageContainer.classList.remove("no-transition");
    }
  }
}

// ===========================================
// MOUSE WHEEL ZOOM
// ===========================================
function setupMouseWheelZoom() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.addEventListener("wheel", handleMouseWheel, {
      passive: false,
    });
  }
}

function removeMouseWheelZoom() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.removeEventListener("wheel", handleMouseWheel);
  }
}

function handleMouseWheel(e) {
  e.preventDefault();

  const minZoom = 1;
  const maxZoom = 4;
  const zoomDelta = -e.deltaY * 0.001;
  const newZoom = currentZoom + zoomDelta;

  if (newZoom >= minZoom && newZoom <= maxZoom) {
    currentZoom = newZoom;

    if (currentZoom <= 1) {
      currentZoom = 1;
      translateX = 0;
      translateY = 0;
    }

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
      if (e.key === "ArrowLeft") {
        previousImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    } else {
      const panAmount = 30;
      if (e.key === "ArrowLeft") {
        translateX -= panAmount;
      } else if (e.key === "ArrowRight") {
        translateX += panAmount;
      } else if (e.key === "ArrowUp") {
        translateY -= panAmount;
      } else if (e.key === "ArrowDown") {
        translateY += panAmount;
      }

      clampPosition();
      updateImageTransform();
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
  initializeGallery();
  initScrollAnimations();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

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

console.log("Gallery loaded successfully!");
