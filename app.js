 document.addEventListener("DOMContentLoaded", function () {
        const revealElements = document.querySelectorAll(".scroll-reveal");
        const revealOnScroll = () => {
          const windowHeight = window.innerHeight;
          revealElements.forEach((el) => {
            const top = el.getBoundingClientRect().top;
            if (top < windowHeight - 50) {
              el.classList.add("revealed");
            }
          });
        };
        window.addEventListener("scroll", revealOnScroll);
        revealOnScroll();

        // Animate skill bars
        document.querySelectorAll(".skill-progress").forEach((bar) => {
          const width = bar.getAttribute("data-width");
          bar.style.width = width;
        });
      });

      // Mobile menu toggle
      function toggleMenu() {
        const menu = document.getElementById("mobileMenu");
        menu.classList.toggle("hidden");
      }