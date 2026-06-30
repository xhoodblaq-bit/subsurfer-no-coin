// Website interactivity and animations

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('.feature-card, .control-item, .stat-box, .gameplay-text').forEach(element => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(element);
});

// Mobile menu toggle (if needed for smaller screens)
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Close menu after clicking on a link
  });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    heroVisual.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Add active state to nav items based on scroll position
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      currentSection = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.style.color = '';
    link.style.background = '';
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.style.color = '#ffcc00';
      link.style.background = 'rgba(255, 204, 0, 0.1)';
    }
  });
});

// Smooth button hover effects
document.querySelectorAll('.btn-play, .btn-play-large').forEach(button => {
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
  });
  
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Stats counter animation
function animateCounter(element, target, duration = 1000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Trigger counter animation when stats section comes into view
const statsObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => {
        if (stat.textContent.match(/^\d+$/)) {
          const target = parseInt(stat.textContent);
          animateCounter(stat, target);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const gameplayStats = document.querySelector('.gameplay-stats');
if (gameplayStats) {
  statsObserver.observe(gameplayStats);
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close any open modals or menus if needed
  }
});

// Prevent some default behaviors for better UX
document.addEventListener('contextmenu', (e) => {
  // Allow right-click for normal use
}, false);

console.log('🎮 Subway Surfer Website loaded successfully!');

