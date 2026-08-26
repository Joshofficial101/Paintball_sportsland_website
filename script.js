const slides = document.querySelectorAll('.slide');
const previousButton = document.querySelector('.previous');
const nextButton = document.querySelector('.next');
const dots = document.querySelectorAll('.slide-dot');
const scrollTrack = document.querySelector('.page-scroll');
const scrollThumb = document.querySelector('.page-scroll-thumb');
let currentSlide = 0;

function showSlide(slideNumber) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (slideNumber + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

previousButton.addEventListener('click', () => {
  showSlide(currentSlide - 1);
});

nextButton.addEventListener('click', () => {
  showSlide(currentSlide + 1);
});

dots.forEach((dot, dotNumber) => {
  dot.addEventListener('click', () => {
    showSlide(dotNumber);
  });
});

function updateScrollThumb() {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = pageHeight > 0 ? window.scrollY / pageHeight : 0;
  scrollThumb.style.transform = `translateY(${scrollPercent * 100}%)`;
}

window.addEventListener('scroll', updateScrollThumb);

scrollTrack.addEventListener('click', (event) => {
  const trackPosition = event.clientY - scrollTrack.getBoundingClientRect().top;
  const trackHeight = scrollTrack.clientHeight;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({
    top: (trackPosition / trackHeight) * pageHeight,
    behavior: 'smooth'
  });
});

updateScrollThumb();
