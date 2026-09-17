const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const intro = document.querySelector(".intro");
const introCount = document.querySelector(".intro__count");
const introProgress = document.querySelector(".intro__progress i");
const skipButton = document.querySelector(".intro__skip");

let introFinished = false;
let counterFrame;
let introTimer;

function finishIntro() {
  if (introFinished || !intro) return;
  introFinished = true;
  cancelAnimationFrame(counterFrame);
  clearTimeout(introTimer);
  introCount.textContent = "100";
  introProgress.style.width = "100%";
  intro.classList.add("is-done");
  document.body.classList.add("is-ready");
  setTimeout(() => intro.remove(), 900);
}

function runIntro() {
  if (reduceMotion) {
    finishIntro();
    return;
  }

  const start = performance.now();
  const duration = 2100;

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * 100);
    introCount.textContent = String(value).padStart(2, "0");
    introProgress.style.width = `${value}%`;

    if (progress < 1) {
      counterFrame = requestAnimationFrame(update);
    }
  }

  counterFrame = requestAnimationFrame(update);
  introTimer = setTimeout(finishIntro, duration + 180);
}

skipButton?.addEventListener("click", finishIntro);
window.addEventListener("load", runIntro);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal, .reveal-card").forEach((el) => observer.observe(el));

const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
let mouseX = -100;
let mouseY = -100;
let ringX = -100;
let ringY = -100;

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  if (dot) {
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }
});

function renderCursor() {
  if (!ring) return;
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(renderCursor);
}
renderCursor();

document.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("mouseenter", () => ring?.classList.add("is-active"));
  item.addEventListener("mouseleave", () => ring?.classList.remove("is-active"));
});

document.querySelectorAll(".magnetic").forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "translate(0, 0)";
  });
});

const heroSlides = [...document.querySelectorAll(".hero__slides img")];
const heroIndex = document.querySelector("[data-hero-index]");
let currentSlide = 0;

function setHeroSlide(next) {
  if (!heroSlides.length) return;
  heroSlides[currentSlide].classList.remove("is-active");
  currentSlide = next % heroSlides.length;
  heroSlides[currentSlide].classList.add("is-active");
  if (heroIndex) heroIndex.textContent = String(currentSlide + 1).padStart(2, "0");
}

if (!reduceMotion && heroSlides.length > 1) {
  setInterval(() => setHeroSlide(currentSlide + 1), 3600);
}

document.querySelectorAll(".cinema-card, .reel-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateX(${y * -2.6}deg) rotateY(${x * 2.6}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  });
});

const scrollSection = document.querySelector(".scroll-play");
const cinemaViewport = document.querySelector("[data-cinema-viewport]");
const cinemaTrack = document.querySelector("[data-cinema-track]");
const cinemaProgress = document.querySelector("[data-cinema-progress]");
const scrollCount = document.querySelector("[data-scroll-count]");
const cinemaCards = [...document.querySelectorAll(".cinema-card")];

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function updateScrollPlay() {
  if (!scrollSection || !cinemaViewport || !cinemaTrack) return;
  if (window.innerWidth <= 980) {
    cinemaTrack.style.transform = "";
    if (cinemaProgress) cinemaProgress.style.width = "100%";
    return;
  }

  const rect = scrollSection.getBoundingClientRect();
  const total = scrollSection.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / total);
  const maxShift = Math.max(0, cinemaTrack.scrollWidth - cinemaViewport.clientWidth);

  cinemaTrack.style.transform = `translate3d(${-progress * maxShift}px, 0, 0)`;
  if (cinemaProgress) cinemaProgress.style.width = `${progress * 100}%`;

  const index = Math.min(
    cinemaCards.length,
    Math.max(1, Math.floor(progress * cinemaCards.length) + 1)
  );
  if (scrollCount) scrollCount.textContent = String(index).padStart(2, "0");
}

window.addEventListener("scroll", updateScrollPlay, { passive: true });
window.addEventListener("resize", updateScrollPlay);
window.addEventListener("load", updateScrollPlay);

const canvas = document.querySelector(".ambient-canvas");
const ctx = canvas?.getContext("2d");
let width = 0;
let height = 0;
let particles = [];
let animationFrame;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.floor(Math.min(80, Math.max(34, width / 22)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.24,
    hue: index % 3 === 0 ? "183,255,0" : index % 3 === 1 ? "119,168,255" : "128,102,255",
  }));
}

function renderAmbient() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  particles.forEach((particle, index) => {
    particle.x += particle.vx + (mouseX - width / 2) * 0.00003;
    particle.y += particle.vy + (mouseY - height / 2) * 0.00002;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.hue}, 0.48)`;
    ctx.shadowColor = `rgba(${particle.hue}, 0.7)`;
    ctx.shadowBlur = 18;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    const next = particles[(index + 7) % particles.length];
    const dx = particle.x - next.x;
    const dy = particle.y - next.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 150) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${particle.hue}, ${0.11 * (1 - distance / 150)})`;
      ctx.lineWidth = 0.7;
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
  });

  ctx.shadowBlur = 0;
  animationFrame = requestAnimationFrame(renderAmbient);
}

if (canvas && ctx) {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  if (reduceMotion) {
    renderAmbient();
    cancelAnimationFrame(animationFrame);
  } else {
    renderAmbient();
  }
}

document.querySelector("[data-year]").textContent = new Date().getFullYear();

