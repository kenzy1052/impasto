      // Active Navigation
      function setActiveNav(element) {
        document.querySelectorAll(".nav-item").forEach((item) => {
          item.classList.remove("active");
        });
        element.classList.add("active");
      }

      // Smooth Scroll
      function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }

      // Handle navigation links
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("href").substring(1);
          scrollToSection(targetId);
        });
      });