const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const scrollProgress = document.querySelector(".scroll-progress span");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(
  ".hero-copy, .hero-art, .intro-strip > *, .section-kicker, .about-grid, .focus-heading, .focus-card, .experience-heading, .timeline-item, .leadership-heading, .leadership-card, .webfastlab-layout, .service-list article, .contact-layout, .social-links, .contact-form, .contact-footer",
);
let revealObserver;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  document.documentElement.classList.add("js");

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
  );

  revealTargets.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

let progressFrame = 0;

function updateScrollProgress() {
  if (progressFrame) {
    return;
  }

  progressFrame = window.requestAnimationFrame(() => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    scrollProgress.style.transform = `scaleX(${progress})`;

    if (revealObserver) {
      revealTargets.forEach((element) => {
        if (
          !element.classList.contains("is-visible") &&
          element.getBoundingClientRect().top < window.innerHeight * 0.9
        ) {
          element.classList.add("is-visible");
          revealObserver.unobserve(element);
        }
      });
    }

    progressFrame = 0;
  });
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const contactForm = document.querySelector(".contact-form");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector(".form-status");
  const originalLabel = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";
  status.classList.remove("is-error");
  status.textContent = "";

  try {
    const formData = new URLSearchParams(new FormData(contactForm));
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Pengiriman pesan gagal (${response.status}).`);
    }

    contactForm.reset();
    status.textContent = "Pesan terkirim. Terima kasih sudah menghubungi saya!";
  } catch (error) {
    status.classList.add("is-error");
    status.textContent =
      "Pesan belum terkirim. Coba lagi setelah situs dipublikasikan di Netlify.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});
