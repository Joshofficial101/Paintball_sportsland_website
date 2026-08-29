/*
  SLIDESHOW ELEMENTS
  These variables connect JavaScript to HTML elements by their CSS classes.
  If a class name changes in main.html, update it here too.
*/
const slides = document.querySelectorAll('.slide');
const previousButton = document.querySelector('.previous');
const nextButton = document.querySelector('.next');
const dots = document.querySelectorAll('.slide-dot');

/* Elements that make up the fixed scroll-progress indicator. */
const scrollTrack = document.querySelector('.page-scroll');
const scrollThumb = document.querySelector('.page-scroll-thumb');

/* Stores the zero-based position of the visible slide: 0 means the first slide. */
let currentSlide = 0;

/*
  Shows one slide and updates its matching dot.
  The modulo (%) calculation wraps around: after the last slide comes the first,
  and before the first slide comes the last.
*/
function showSlide(slideNumber) {
  /* Remove the visible/selected state from the slide currently on screen. */
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  /* Save the requested number after safely wrapping it inside the available range. */
  currentSlide = (slideNumber + slides.length) % slides.length;

  /* Show the new slide and highlight its matching selector dot. */
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

/* Move backward one slide when the left arrow is clicked. */
previousButton.addEventListener('click', () => {
  showSlide(currentSlide - 1);
});

/* Move forward one slide when the right arrow is clicked. */
nextButton.addEventListener('click', () => {
  showSlide(currentSlide + 1);
});

/* Give every dot a click handler using its position as the target slide number. */
dots.forEach((dot, dotNumber) => {
  dot.addEventListener('click', () => {
    showSlide(dotNumber);
  });
});

/*
  Calculates how far down the page the visitor has scrolled and moves the thumb
  the same percentage down its track. A page with no scrollable height stays at 0.
*/
function updateScrollThumb() {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = pageHeight > 0 ? window.scrollY / pageHeight : 0;
  scrollThumb.style.transform = `translateY(${scrollPercent * 100}%)`;
}

/* Recalculate the indicator continuously as the visitor scrolls. */
window.addEventListener('scroll', updateScrollThumb);

/*
  Allows visitors to click a point on the scroll track to smoothly jump to the
  matching percentage of the page.
*/
scrollTrack.addEventListener('click', (event) => {
  const trackPosition = event.clientY - scrollTrack.getBoundingClientRect().top;
  const trackHeight = scrollTrack.clientHeight;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({
    top: (trackPosition / trackHeight) * pageHeight,
    behavior: 'smooth' /* Animate the jump rather than moving instantly. */
  });
});

/* Set the correct indicator position immediately when the page first loads. */
updateScrollThumb();
