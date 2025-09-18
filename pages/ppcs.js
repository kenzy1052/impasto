Lightbox(imageNumber) {
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

        updateImageTransform();
        setupLightboxEvents();
        updateZoomControls();
      }

      function closeLightbox() {
        const lightbox = document.getElementById("lightbox");
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
        removeLightboxEvents();
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
        updateImageTransform();
        updateZoomControls();
      }

      function previousImage() {
        if (currentImageIndex > 1) {
          currentImageIndex--;
        } else {
          currentImageIndex = totalImages;
        }
        updateLightboxImage();
      }

      function nextImage() {
        if (currentImageIndex < totalImages) {
          currentImageIndex++;
        } else {
          currentImageIndex = 1;
        }
        updateLightboxImage();
      }

      function updateImageTransform() {
        const imageContainer = document.getElementById("lightboxImageContainer");
        imageContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;

        if (currentZoom > 1) {
          imageContainer.classList.add("zoomed");
        } else {
          imageContainer.classList.remove("zoomed");
        }
      }

      function updateZoomControls() {
        const zoomInBtn = document.getElementById("zoomInBtn");
        const zoomOutBtn = document.getElementById("zoomOutBtn");

        if (zoomInBtn && zoomOutBtn) {
          zoomInBtn.disabled = currentZoom >= 5;
          zoomOutBtn.disabled = currentZoom <= 1;
        }
      }

      function zoomIn() {
        if (currentZoom < 5) {
          currentZoom = Math.min(5, currentZoom + 0.5);
          clampPosition();
          updateImageTransform();
          updateZoomControls();
        }
      }

      function zoomOut() {
        if (currentZoom > 1) {
          currentZoom = Math.max(1, currentZoom - 0.5);
          if (currentZoom === 1) {
            translateX = 0;
            translateY = 0;
          }
          clampPosition();
          updateImageTransform();
          updateZoomControls();
        }
      }

      // ===========================================
      // ENHANCED TOUCH AND DRAG FUNCTIONALITY
      // ===========================================
      function calculateBoundaries() {
        const container = document.getElementById("lightboxContent");
        const image = document.getElementById("lightboxImage");
        
        if (!container || !image) return { maxX: 0, maxY: 0 };

        const containerRect = container.getBoundingClientRect();
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        if (!naturalWidth || !naturalHeight) return { maxX: 0, maxY: 0 };

        const containerAspect = containerRect.width / containerRect.height;
        const imageAspect = naturalWidth / naturalHeight;

        let displayedWidth, displayedHeight;

        if (imageAspect > containerAspect) {
          displayedWidth = containerRect.width;
          displayedHeight = containerRect.width / imageAspect;
        } else {
          displayedHeight = containerRect.height;
          displayedWidth = containerRect.height * imageAspect;
        }

        const zoomedWidth = displayedWidth * currentZoom;
        const zoomedHeight = displayedHeight * currentZoom;

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
        translateX = Math.max(-maxX, Math.min(maxX, translateX));
        translateY = Math.max(-maxY, Math.min(maxY, translateY));
      }

      function toggleZoom(x, y) {
        const container = document.getElementById("lightboxContent");
        const containerRect = container.getBoundingClientRect();

        if (currentZoom === 1) {
          currentZoom = 2;
          const offsetX = ((containerRect.width / 2 - (x - containerRect.left)) * (currentZoom - 1)) / currentZoom;
          const offsetY = ((containerRect.height / 2 - (y - containerRect.top)) * (currentZoom - 1)) / currentZoom;
          translateX = offsetX;
          translateY = offsetY;
        } else {
          currentZoom = 1;
          translateX = 0;
          translateY = 0;
        }

        clampPosition();
        updateImageTransform();
        updateZoomControls();
      }

      // ===========================================
      // ENHANCED MOBILE TOUCH EVENTS
      // ===========================================
      function setupTouchEvents() {
        const imageContainer = document.getElementById("lightboxImageContainer");
        imageContainer.addEventListener("touchstart", handleTouchStart, { passive: false });
        imageContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
        imageContainer.addEventListener("touchend", handleTouchEnd, { passive: true });
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
        const currentTime = Date.now();
        const tapLength = currentTime - lastTapTime;

        // Enhanced double-tap detection
        if (tapLength < doubleTapDelay && tapLength > 0 && e.touches.length === 1) {
          const touch = e.touches[0];
          toggleZoom(touch.clientX, touch.clientY);
          e.preventDefault();
          return;
        }

        lastTapTime = currentTime;

        if (e.touches.length === 1) {
          // Single touch - pan or swipe
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          lastTouchX = touchStartX;
          lastTouchY = touchStartY;
          lastTouchTime = currentTime;
          touchStartTranslateX = translateX;
          touchStartTranslateY = translateY;

          isDragging = currentZoom > 1;
          velocityX = 0;
          velocityY = 0;

          // Add no-transition class for immediate response
          const imageContainer = document.getElementById("lightboxImageContainer");
          imageContainer.classList.add("no-transition");
        } else if (e.touches.length === 2) {
          // Two touches - pinch to zoom
          isPinching = true;
          isDragging = false;
          touchStartDistance = getDistance(e.touches[0], e.touches[1]);
          e.preventDefault();
        }
      }

      function handleTouchMove(e) {
        const currentTime = Date.now();

        if (isPinching && e.touches.length === 2) {
          e.preventDefault();
          
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          const scale = currentDistance / touchStartDistance;
          
          let newZoom = currentZoom * scale;
          newZoom = Math.max(1, Math.min(5, newZoom));
          
          const oldZoom = currentZoom;
          currentZoom = newZoom;
          touchStartDistance = currentDistance;

          // Enhanced pinch center calculation
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
            // Smoother zoom out behavior
            const centeringFactor = Math.max(0, 1 - (currentZoom - 1) / 4);
            translateX = translateX * zoomFactor + offsetX * (1 - zoomFactor) * centeringFactor;
            translateY = translateY * zoomFactor + offsetY * (1 - zoomFactor) * centeringFactor;
          } else {
            // Natural zoom in behavior
            translateX = translateX * zoomFactor + offsetX * (1 - zoomFactor);
            translateY = translateY * zoomFactor + offsetY * (1 - zoomFactor);
          }

          if (currentZoom <= 1) {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
          }

          clampPosition();
          updateImageTransform();
          updateZoomControls();

        } else if (isDragging && e.touches.length === 1) {
          e.preventDefault();
          
          const touch = e.touches[0];
          const timeDiff = Math.max(1, currentTime - lastTouchTime);
          
          // Enhanced velocity calculation with smoothing
          const newVelocityX = (touch.clientX - lastTouchX) / timeDiff;
          const newVelocityY = (touch.clientY - lastTouchY) / timeDiff;
          
          // Apply smoothing to velocity for more natural feel
          velocityX = velocityX * 0.8 + newVelocityX * 0.2;
          velocityY = velocityY * 0.8 + newVelocityY * 0.2;

          // More responsive direct panning
          const deltaX = touch.clientX - lastTouchX;
          const deltaY = touch.clientY - lastTouchY;
          
          // Apply momentum-based movement scaling
          const momentumScale = 1 + Math.min(0.5, Math.sqrt(velocityX * velocityX + velocityY * velocityY) * 0.1);
          
          translateX += deltaX * momentumScale;
          translateY += deltaY * momentumScale;

          clampPosition();
          updateImageTransform();

          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
          lastTouchTime = currentTime;
        }
      }

      function handleTouchEnd(e) {
        const imageContainer = document.getElementById("lightboxImageContainer");
        imageContainer.classList.remove("no-transition");

        // Handle swipe navigation for non-zoomed images
        if (currentZoom === 1 && !isDragging && !isPinching && e.changedTouches.length === 1) {
          const touch = e.changedTouches[0];
          const swipeThreshold = 70; // Slightly higher threshold for better accuracy
          const diffX = touchStartX - touch.clientX;
          const diffY = Math.abs(touchStartY - touch.clientY);
          
          // Only trigger swipe if horizontal movement is dominant
          if (Math.abs(diffX) > swipeThreshold && diffY < swipeThreshold * 0.8) {
            if (diffX > 0) {
              nextImage();
            } else {
              previousImage();
            }
          }
        }

        // Enhanced inertia for zoomed panning
        if (isDragging && currentZoom > 1 && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
          applyEnhancedInertia();
        }

        // Reset states
        isDragging = false;
        isPinching = false;
      }

      function applyEnhancedInertia() {
        const inertia = () => {
          // Enhanced friction curve for more natural deceleration
          const friction = 0.92;
          const minVelocity = 0.05;
          
          // Apply velocity with improved momentum
          translateX += velocityX * 20; // Increased multiplier for better responsiveness
          translateY += velocityY * 20;
          
          // Progressive friction
          velocityX *= friction;
          velocityY *= friction;
          
          // Boundary collision with bounce-back effect
          const { maxX, maxY } = calculateBoundaries();
          
          if (translateX > maxX) {
            translateX = maxX;
            velocityX *= -0.3; // Bounce effect
          } else if (translateX < -maxX) {
            translateX = -maxX;
            velocityX *= -0.3;
          }
          
          if (translateY > maxY) {
            translateY = maxY;
            velocityY *= -0.3;
          } else if (translateY < -maxY) {
            translateY = -maxY;
            velocityY *= -0.3;
          }

          updateImageTransform();

          // Continue animation with improved threshold
          if (Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
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
      // DESKTOP MOUSE EVENTS
      // ===========================================
      function setupMouseEvents() {
        const imageContainer = document.getElementById("lightboxImageContainer");
        
        imageContainer.addEventListener("dblclick", handleDoubleClick);
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
        imageContainer.classList.add("no-transition");
        
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
            imageContainer.classList.add("dragging");
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
            imageContainer.classList.remove("dragging");
          }
          
          const imageContainer = document.getElementById("lightboxImageContainer");
          imageContainer.classList.remove("no-transition");
        }
      }

      // ===========================================
      // MOUSE WHEEL ZOOM
      // ===========================================
      function setupMouseWheelZoom() {
        const lightbox = document.getElementById("lightbox");
        lightbox.addEventListener("wheel", handleMouseWheel, { passive: false });
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
        const maxZoom = 5;
        const zoomDelta = -e.deltaY * 0.002;
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
          updateZoomControls();
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

      function setupLightboxEvents() {
        setupMouseEvents();
        setupTouchEvents();
        setupKeyboardEvents();
        setupMouseWheelZoom();
      }

      function removeLightboxEvents() {
        removeMouseEvents();
        removeTouchEvents();
        removeKeyboardEvents();
        removeMouseWheelZoom();
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
        if (element.classList.contains("dropdown-toggle")) {
          return;
        }

        document
          .querySelectorAll(".nav-link:not(.dropdown-toggle)")
          .forEach((link) => {
            link.classList.remove("active");
          });

        element.classList.add("active");
        closeMobileMenu();
      }

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

        updateImageTransform();
        setupLightboxEvents();
        updateZoomControls();
      }

      function closeLightbox() {
        const lightbox = document.getElementById("lightbox");
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
        removeLightboxEvents();
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
        updateImageTransform();
        updateZoomControls();
      }

      function previousImage() {
        if (currentImageIndex > 1) {
          currentImageIndex--;
        } else {
          currentImageIndex = totalImages;
        }
        updateLightboxImage();
      }

      function nextImage() {
        if (currentImageIndex < totalImages) {
          currentImageIndex++;
        } else {
          currentImageIndex = 1;
        }
        updateLightboxImage();
      }

      function updateImageTransform() {
        const imageContainer = document.getElementById("lightboxImageContainer");
        imageContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;

        if (currentZoom > 1) {
          imageContainer.classList.add("zoomed");
        } else {
          imageContainer.classList.remove("zoomed");
        }
      }

      function updateZoomControls() {
        const zoomInBtn = document.getElementById("zoomInBtn");
        const zoomOutBtn = document.getElementById("zoomOutBtn");

        if (zoomInBtn && zoomOutBtn) {
          zoomInBtn.disabled = currentZoom >= 5;
          zoomOutBtn.disabled = currentZoom <= 1;
        }
      }

      function zoomIn() {
        if (currentZoom < 5) {
          currentZoom = Math.min(5, currentZoom + 0.5);
          clampPosition();
          updateImageTransform();
          updateZoomControls();
        }
      }

      function zoomOut() {
        if (currentZoom > 1) {
          currentZoom = Math.max(1, currentZoom - 0.5);
          if (currentZoom === 1) {
            translateX = 0;
            translateY = 0;
          }
          clampPosition();
          updateImageTransform();
          updateZoomControls();
        }
      }

      // ===========================================
      // ENHANCED TOUCH AND DRAG FUNCTIONALITY
      // ===========================================
      function calculateBoundaries() {
        const container = document.getElementById("lightboxContent");
        const image = document.getElementById("lightboxImage");
        
        if (!container || !image) return { maxX: 0, maxY: 0 };

        const containerRect = container.getBoundingClientRect();
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        if (!naturalWidth || !naturalHeight) return { maxX: 0, maxY: 0 };

        const containerAspect = containerRect.width / containerRect.height;
        const imageAspect = naturalWidth / naturalHeight;

        let displayedWidth, displayedHeight;

        if (imageAspect > containerAspect) {
          displayedWidth = containerRect.width;
          displayedHeight = containerRect.width / imageAspect;
        } else {
          displayedHeight = containerRect.height;
          displayedWidth = containerRect.height * imageAspect;
        }

        const zoomedWidth = displayedWidth * currentZoom;
        const zoomedHeight = displayedHeight * currentZoom;

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
        translateX = Math.max(-maxX, Math.min(maxX, translateX));
        translateY = Math.max(-maxY, Math.min(maxY, translateY));
      }

      function toggleZoom(x, y) {
        const container = document.getElementById("lightboxContent");
        const containerRect = container.getBoundingClientRect();

        if (currentZoom === 1) {
          currentZoom = 2;
          const offsetX = ((containerRect.width / 2 - (x - containerRect.left)) * (currentZoom - 1)) / currentZoom;
          const offsetY = ((containerRect.height / 2 - (y - containerRect.top)) * (currentZoom - 1)) / currentZoom;
          translateX = offsetX;
          translateY = offsetY;
        } else {
          currentZoom = 1;
          translateX = 0;
          translateY = 0;
        }

        clampPosition();
        updateImageTransform();
        updateZoomControls();
      }

      // ===========================================
      // ENHANCED MOBILE TOUCH EVENTS
      // ===========================================
      function setupTouchEvents() {
        const imageContainer = document.getElementById("lightboxImageContainer");
        imageContainer.addEventListener("touchstart", handleTouchStart, { passive: false });
        imageContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
        imageContainer.addEventListener("touchend", handleTouchEnd, { passive: true });
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
        const currentTime = Date.now();
        const tapLength = currentTime - lastTapTime;

        // Enhanced double-tap detection
        if (tapLength < doubleTapDelay && tapLength > 0 && e.touches.length === 1) {
          const touch = e.touches[0];
          toggleZoom(touch.clientX, touch.clientY);
          e.preventDefault();
          return;
        }

        lastTapTime = currentTime;

        if (e.touches.length === 1) {
          // Single touch - pan or swipe
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          lastTouchX = touchStartX;
          lastTouchY = touchStartY;
          lastTouchTime = currentTime;
          touchStartTranslateX = translateX;
          touchStartTranslateY = translateY;

          isDragging = currentZoom > 1;
          velocityX = 0;
          velocityY = 0;

          // Add no-transition class for immediate response
          const imageContainer = document.getElementById("lightboxImageContainer");
          imageContainer.classList.add("no-transition");
        } else if (e.touches.length === 2) {
          // Two touches - pinch to zoom
          isPinching = true;
          isDragging = false;
          touchStartDistance = getDistance(e.touches[0], e.touches[1]);
          e.preventDefault();
        }
      }

      function handleTouchMove(e) {
        const currentTime = Date.now();

        if (isPinching && e.touches.length === 2) {
          e.preventDefault();
          
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          const scale = currentDistance / touchStartDistance;
          
          let newZoom = currentZoom * scale;
          newZoom = Math.max(1, Math.min(5, newZoom));
          
          const oldZoom = currentZoom;
          currentZoom = newZoom;
          touchStartDistance = currentDistance;

          // Enhanced pinch center calculation
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
            // Smoother zoom out behavior
            const centeringFactor = Math.max(0, 1 - (currentZoom - 1) / 4);
            translateX = translateX * zoomFactor + offsetX * (1 - zoomFactor) * centeringFactor;
            translateY = translateY * zoomFactor + offsetY * (1 - zoomFactor) * centeringFactor;
          } else {
            // Natural zoom in behavior
            translateX = translateX * zoomFactor + offsetX * (1 - zoomFactor);
            translateY = translateY * zoomFactor + offsetY * (1 - zoomFactor);
          }

          if (currentZoom <= 1) {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
          }

          clampPosition();
          updateImageTransform();
          updateZoomControls();

        } else if (isDragging && e.touches.length === 1) {
          e.preventDefault();
          
          const touch = e.touches[0];
          const timeDiff = Math.max(1, currentTime - lastTouchTime);
          
          // Enhanced velocity calculation with smoothing
          const newVelocityX = (touch.clientX - lastTouchX) / timeDiff;
          const newVelocityY = (touch.clientY - lastTouchY) / timeDiff;
          
          // Apply smoothing to velocity for more natural feel
          velocityX = velocityX * 0.8 + newVelocityX * 0.2;
          velocityY = velocityY * 0.8 + newVelocityY * 0.2;

          // More responsive direct panning
          const deltaX = touch.clientX - lastTouchX;
          const deltaY = touch.clientY - lastTouchY;
          
          // Apply momentum-based movement scaling
          const momentumScale = 1 + Math.min(0.5, Math.sqrt(velocityX * velocityX + velocityY * velocityY) * 0.1);
          
          translateX += deltaX * momentumScale;
          translateY += deltaY * momentumScale;

          clampPosition();
          updateImageTransform();

          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
          lastTouchTime = currentTime;
        }
      }

      function handleTouchEnd(e) {
        const imageContainer = document.getElementById("lightboxImageContainer");
        imageContainer.classList.remove("no-transition");

        // Handle swipe navigation for non-zoomed images
        if (currentZoom === 1 && !isDragging && !isPinching && e.changedTouches.length === 1) {
          const touch = e.changedTouches[0];
          const swipeThreshold = 70; // Slightly higher threshold for better accuracy
          const diffX = touchStartX - touch.clientX;
          const diffY = Math.abs(touchStartY - touch.clientY);
          
          // Only trigger swipe if horizontal movement is dominant
          if (Math.abs(diffX) > swipeThreshold && diffY < swipeThreshold * 0.8) {
            if (diffX > 0) {
              nextImage();
            } else {
              previousImage();
            }
          }
        }

        // Enhanced inertia for zoomed panning
        if (isDragging && currentZoom > 1 && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
          applyEnhancedInertia();
        }

        // Reset states
        isDragging = false;
        isPinching = false;
      }

      function applyEnhancedInertia() {
        const inertia = () => {
          // Enhanced friction curve for more natural deceleration
          const friction = 0.92;
          const minVelocity = 0.05;
          
          // Apply velocity with improved momentum
          translateX += velocityX * 20; // Increased multiplier for better responsiveness
          translateY += velocityY * 20;
          
          // Progressive friction
          velocityX *= friction;
          velocityY *= friction;
          
          // Boundary collision with bounce-back effect
          const { maxX, maxY } = calculateBoundaries();
          
          if (translateX > maxX) {
            translateX = maxX;
            velocityX *= -0.3; // Bounce effect
          } else if (translateX < -maxX) {
            translateX = -maxX;
            velocityX *= -0.3;
          }
          
          if (translateY > maxY) {
            translateY = maxY;
            velocityY *= -0.3;
          } else if (translateY < -maxY) {
            translateY = -maxY;
            velocityY *= -0.3;
          }

          updateImageTransform();

          // Continue animation with improved threshold
          if (Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
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
      // DESKTOP MOUSE EVENTS
      // ===========================================
      function setupMouseEvents() {
        const imageContainer = document.getElementById("lightboxImageContainer");
        
        imageContainer.addEventListener("dblclick", handleDoubleClick);
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
        imageContainer.classList.add("no-transition");
        
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
            imageContainer.classList.add("dragging");
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
            imageContainer.classList.remove("dragging");
          }
          
          const imageContainer = document.getElementById("lightboxImageContainer");
          imageContainer.classList.remove("no-transition");
        }
      }

      // ===========================================
      // MOUSE WHEEL ZOOM
      // ===========================================
      function setupMouseWheelZoom() {
        const lightbox = document.getElementById("lightbox");
        lightbox.addEventListener("wheel", handleMouseWheel, { passive: false });
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
        const maxZoom = 5;
        const zoomDelta = -e.deltaY * 0.002;
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
          updateZoomControls();
        }
      }

      // ===========================================
      // KEYBOARD FUNCTIONALITY
      // ===========================================
      function setupKeyboardEvents() {
        document.addEventListener("keydown", handleLightboxKeyDown);
      }

      function removeKeyboardEvents() {
        document.removeEventListener("keydown", handleLightboxKeyDown);
      }

      function handleLightboxKeyDown(e) {
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

      function setupLightboxEvents() {
        setupMouseEvents();
        setupTouchEvents();
        setupKeyboardEvents();
        setupMouseWheelZoom();
      }

      function removeLightboxEvents() {
        removeMouseEvents();
        removeTouchEvents();
        removeKeyboardEvents();
        removeMouseWheelZoom();
      }