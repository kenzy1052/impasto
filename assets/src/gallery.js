// ===========================================
// GALLERY FUNCTIONALITY
// ===========================================
let currentImageCount = 12;
const totalImages = 60;
const imagesPerLoad = 12;
/**
 * Initialize gallery with first 12 images
 */
function initializeGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  for (let i = 1; i <= currentImageCount; i++) {
    const galleryItem = createGalleryItem(i);
    galleryGrid.appendChild(galleryItem);
  }
  // Disable load more button if all images are loaded
  if (currentImageCount >= totalImages) {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Images Loaded';
  }
}
/**
 * Create a gallery item
 * @param {number} imageNumber - The image number
 * @returns {HTMLElement} - The gallery item element
 */
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

  // Trigger animation for new items after a small delay
  setTimeout(() => {
    if (isElementInViewport(item)) {
      item.classList.add("visible");
    }
  }, 100);

  return item;
}
/**
 * Load more images into the gallery
 */
function loadMoreImages() {
  const galleryGrid = document.getElementById("galleryGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  // Show loading state
  loadMoreBtn.disabled = true;
  loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  // Simulate loading delay for better UX
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
    // Update button state
    if (currentImageCount >= totalImages) {
      loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Images Loaded';
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> View More';
    }
  }, 800);
}
/**
 * Open lightbox with specific image
 * @param {number} imageNumber - The image number to display
 */
function openLightbox(imageNumber) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  lightboxImage.src = `assets/images/img${imageNumber}.jpg`;
  lightboxImage.alt = `Gallery Image ${imageNumber}`;
  lightbox.classList.add("active");
  // Prevent body scroll
  document.body.style.overflow = "hidden";
}
/**
 * Close lightbox
 */
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("active");
  // Restore body scroll
  document.body.style.overflow = "auto";
}
