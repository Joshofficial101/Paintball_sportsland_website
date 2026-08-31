/*
  SLIDESHOW ELEMENTS
  These variables connect JavaScript to HTML elements by their CSS classes.
  If a class name changes in index.html, update it here too.
*/
const slides = document.querySelectorAll('.slide');
const previousButton = document.querySelector('.previous');
const nextButton = document.querySelector('.next');
const dots = document.querySelectorAll('.slide-dot');

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
