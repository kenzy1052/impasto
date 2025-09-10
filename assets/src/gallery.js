//===========================================
// GALLERY FUNCTIONALITY
// ===========================================
let currentImageIndex = 1;
let currentZoom = 1;
const totalImages = 60;
const imagesPerLoad = 12;
let currentImageCount = 12;
let touchStartX = 0;
let touchEndX = 0;
let touchStartDistance = 0;
let isZooming = false;
let isDragging = false;
let hasDragged = false;
let dragStartX = 0;
let dragStartY = 0;
let translateX = 0;
let translateY = 0;
function initializeGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  // Load only the first 12 images initially
  for (let i = 1; i <= currentImageCount; i++) {
    const galleryItem = createGalleryItem(i);
    galleryGrid.appendChild(galleryItem);
  }
}
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
// ADVANCED LIGHTBOX FUNCTIONALITY
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
  // Force a recalculation of the viewport height
  setTimeout(() => {
    updateImageTransform();
  }, 50);
  setupTouchEvents();
  setupDragEvents();
  setupMouseWheelZoom();
  setupImageClick();
}
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = "auto";
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();
  removeTouchEvents();
  removeDragEvents();
  removeMouseWheelZoom();
  removeImageClick();
}
function updateLightboxImage() {
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCounter = document.getElementById("lightboxCounter");
  lightboxImage.src = `assets/images/img${currentImageIndex}.jpg`;
  lightboxImage.alt = `Gallery Image ${currentImageIndex}`;
  lightboxCounter.textContent = `Image ${currentImageIndex} of ${totalImages}`;
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  // Force a recalculation of the viewport height
  setTimeout(() => {
    updateImageTransform();
  }, 50);
}
function previousImage() {
  currentImageIndex =
    currentImageIndex > 1 ? currentImageIndex - 1 : totalImages;
  updateLightboxImage();
}
function nextImage() {
  currentImageIndex =
    currentImageIndex < totalImages ? currentImageIndex + 1 : 1;
  updateLightboxImage();
}
function updateImageTransform() {
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}
// ===========================================
// IMAGE CLICK TO ZOOM FUNCTIONALITY
// ===========================================
function setupImageClick() {
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.addEventListener("click", handleImageClick);
  imageContainer.addEventListener("contextmenu", handleImageClick);
}
function removeImageClick() {
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.removeEventListener("click", handleImageClick);
  imageContainer.removeEventListener("contextmenu", handleImageClick);
}
function handleImageClick(e) {
  e.preventDefault();
  // Only handle zoom if we haven't dragged
  if (!hasDragged) {
    const imageContainer = document.getElementById("lightboxImageContainer");
    if (currentZoom === 1) {
      // Zoom in
      currentZoom = 2;
      imageContainer.classList.add("zoomed");
    } else {
      // Zoom out
      currentZoom = 1;
      translateX = 0;
      translateY = 0;
      imageContainer.classList.remove("zoomed");
    }
    updateImageTransform();
  }
  // Reset drag flag for next interaction
  hasDragged = false;
}
// ===========================================
// DRAG FUNCTIONALITY
// ===========================================
function setupDragEvents() {
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.addEventListener("mousedown", handleDragStart);
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
}
function removeDragEvents() {
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.removeEventListener("mousedown", handleDragStart);
  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
}
function handleDragStart(e) {
  // Only allow dragging with left mouse button (button 0)
  if (currentZoom > 1 && e.button === 0) {
    isDragging = true;
    hasDragged = false; // Reset drag flag
    dragStartX = e.clientX - translateX;
    dragStartY = e.clientY - translateY;
    const imageContainer = document.getElementById("lightboxImageContainer");
    imageContainer.classList.add("dragging");
    e.preventDefault(); // Prevent text selection and other default behaviors
  }
}
function handleDragMove(e) {
  if (isDragging) {
    e.preventDefault();
    // Calculate new position
    let newTranslateX = e.clientX - dragStartX;
    let newTranslateY = e.clientY - dragStartY;
    // Get image dimensions and viewport
    const image = document.getElementById("lightboxImage");
    const rect = image.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // Calculate the actual dimensions of the zoomed image
    const imageWidth = rect.width;
    const imageHeight = rect.height;
    // Calculate maximum allowed translation to keep image fully visible
    let maxTranslateX = 0;
    let maxTranslateY = 0;
    // Only allow horizontal dragging if image is wider than viewport
    if (imageWidth > viewportWidth) {
      maxTranslateX = (imageWidth - viewportWidth) / 2;
    }
    // Only allow vertical dragging if image is taller than viewport
    if (imageHeight > viewportHeight) {
      maxTranslateY = (imageHeight - viewportHeight) / 2;
    }
    // Constrain translation to keep image fully visible
    // This ensures the image never moves outside the screen boundaries
    translateX = Math.max(
      -maxTranslateX,
      Math.min(maxTranslateX, newTranslateX)
    );
    translateY = Math.max(
      -maxTranslateY,
      Math.min(maxTranslateY, newTranslateY)
    );
    updateImageTransform();
    // Mark that we have dragged
    hasDragged = true;
  }
}
function handleDragEnd() {
  isDragging = false;
  const imageContainer = document.getElementById("lightboxImageContainer");
  imageContainer.classList.remove("dragging");
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
  lightbox.removeEventListener("wheel", handleMouseWheel);
}
function handleMouseWheel(e) {
  e.preventDefault();
  const imageContainer = document.getElementById("lightboxImageContainer");
  if (e.deltaY < 0) {
    // Scrolling up - zoom in
    if (currentZoom < 3) {
      currentZoom += 0.1;
      if (currentZoom > 1) {
        imageContainer.classList.add("zoomed");
      }
      updateImageTransform();
    }
  } else {
    // Scrolling down - zoom out
    if (currentZoom > 1) {
      currentZoom -= 0.1;
      if (currentZoom <= 1) {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        imageContainer.classList.remove("zoomed");
      }
      updateImageTransform();
    }
  }
}
// ===========================================
// TOUCH/SWIPE FUNCTIONALITY
// ===========================================
function setupTouchEvents() {
  const lightbox = document.getElementById("lightbox");
  lightbox.addEventListener("touchstart", handleTouchStart, {
    passive: true,
  });
  lightbox.addEventListener("touchmove", handleTouchMove, {
    passive: true,
  });
  lightbox.addEventListener("touchend", handleTouchEnd, {
    passive: true,
  });
}
function removeTouchEvents() {
  const lightbox = document.getElementById("lightbox");
  lightbox.removeEventListener("touchstart", handleTouchStart);
  lightbox.removeEventListener("touchmove", handleTouchMove);
  lightbox.removeEventListener("touchend", handleTouchEnd);
}
function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
  if (e.changedTouches.length === 2) {
    touchStartDistance = getTouchDistance(
      e.changedTouches[0],
      e.changedTouches[1]
    );
    isZooming = true;
  }
}
function handleTouchMove(e) {
  if (e.changedTouches.length === 2 && isZooming) {
    const currentDistance = getTouchDistance(
      e.changedTouches[0],
      e.changedTouches[1]
    );
    const scale = currentDistance / touchStartDistance;
    const imageContainer = document.getElementById("lightboxImageContainer");
    if (scale > 1.1 && currentZoom < 3) {
      currentZoom += 0.1;
      if (currentZoom > 1) {
        imageContainer.classList.add("zoomed");
      }
      touchStartDistance = currentDistance;
      updateImageTransform();
    } else if (scale < 0.9 && currentZoom > 1) {
      currentZoom -= 0.1;
      if (currentZoom <= 1) {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        imageContainer.classList.remove("zoomed");
      }
      touchStartDistance = currentDistance;
      updateImageTransform();
    }
  }
}
function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
  isZooming = false;
}
function getTouchDistance(touch1, touch2) {
  const dx = touch1.screenX - touch2.screenX;
  const dy = touch1.screenY - touch2.screenY;
  return Math.sqrt(dx * dx + dy * dy);
}
function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextImage();
    } else {
      previousImage();
    }
  }
}
