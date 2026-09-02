/*
  RESERVATION CALENDAR
  Creates a date picker from the visitor's current month. This page collects a
  request only; the AWS reservation API will be connected later to submit it.
*/
const calendarDays = document.querySelector('#calendar-days');
const calendarMonth = document.querySelector('#calendar-month');
const previousMonthButton = document.querySelector('#calendar-previous');
const nextMonthButton = document.querySelector('#calendar-next');
const selectedDateInput = document.querySelector('#reservation-date');
const calendarSelection = document.querySelector('#calendar-selection');
const sessionOptions = document.querySelector('#session-options');
const sessionHelp = document.querySelector('#session-help');
const weekdayTimeOptions = document.querySelector('#weekday-time-options');
const weekdayStartTime = document.querySelector('#weekday-start-time');
const reservationPackage = document.querySelector('#reservation-package');
const airsoftRentalOption = document.querySelector('#airsoft-rental-option');
const reservationPackageHelp = document.querySelector('#reservation-package-help');
const reservationForm = document.querySelector('#reservation-request-form');
const reservationStatus = document.querySelector('#reservation-status');
const reservationStatusDialog = document.querySelector('#reservation-status-dialog');
const reservationDialogMessage = document.querySelector('#reservation-dialog-message');
const reservationDialogClose = document.querySelector('#reservation-dialog-close');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');

const today = new Date();
const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = null;

/* Requires an @ and dot while allowing modern domain endings such as .org, .io, or .museum. */
const emailAddressPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
let emailHasBeenTouched = false;

function updateEmailValidation() {
  const emailIsValid = emailAddressPattern.test(emailInput.value.trim());
  const showInvalidState = emailHasBeenTouched && !emailIsValid;

  emailInput.classList.toggle('is-valid', emailIsValid);
  emailInput.classList.toggle('is-invalid', showInvalidState);
  emailInput.setAttribute('aria-invalid', String(showInvalidState));
}

emailInput.addEventListener('input', () => {
  emailHasBeenTouched = true;
  updateEmailValidation();
});

emailInput.addEventListener('blur', () => {
  emailHasBeenTouched = true;
  updateEmailValidation();
});

/* Formats ten entered digits as a familiar U.S. phone number while the visitor types. */
function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 3) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

phoneInput.addEventListener('input', () => {
  phoneInput.value = formatPhoneNumber(phoneInput.value);
});

/* Shows every reservation message in a clear pop-up while preserving screen-reader status text. */
function showReservationMessage(message) {
  reservationStatus.textContent = message;
  reservationDialogMessage.textContent = message;

  if (reservationStatusDialog.open) reservationStatusDialog.close();
  reservationStatusDialog.showModal();
  reservationDialogClose.focus();
}

reservationDialogClose.addEventListener('click', () => reservationStatusDialog.close());

/* Uses local date parts so a visitor's timezone does not move their selected date. */
function dateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* Enables one time-choice section and disables the other after a date is selected. */
function setTimeSectionAvailability(section, isAvailable) {
  section.disabled = !isAvailable;
  section.hidden = !isAvailable;
  section.querySelectorAll('input, select').forEach((control) => {
    control.disabled = !isAvailable;
  });
}

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  calendarMonth.textContent = displayedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  previousMonthButton.disabled = displayedMonth <= new Date(todayAtMidnight.getFullYear(), todayAtMidnight.getMonth(), 1);
  calendarDays.replaceChildren();

  for (let emptyDay = 0; emptyDay < firstDay; emptyDay += 1) {
    const blank = document.createElement('span');
    blank.className = 'calendar-empty-day';
    calendarDays.append(blank);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const button = document.createElement('button');
    const isPastDate = date < todayAtMidnight;

    button.type = 'button';
    button.className = 'calendar-day';
    button.textContent = day;
    button.disabled = isPastDate;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));

    if (selectedDate && dateValue(date) === dateValue(selectedDate)) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    }

    button.addEventListener('click', () => selectDate(date));
    calendarDays.append(button);
  }
}

/* Weekend dates unlock the required morning or afternoon session selection. */
function selectDate(date) {
  selectedDate = date;
  selectedDateInput.value = dateValue(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  calendarSelection.textContent = `Selected: ${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`;
  /* Airsoft rentals are offered only on Saturdays and Sundays. */
  airsoftRentalOption.disabled = !isWeekend;
  reservationPackageHelp.textContent = isWeekend
    ? 'Airsoft rental requests are available for weekend dates.'
    : 'Airsoft rental requests are available on weekends only.';

  /* Clear an Airsoft selection if the visitor switches from a weekend to a weekday. */
  if (!isWeekend && reservationPackage.value === 'airsoft-rental') {
    reservationPackage.value = '';
  }

  setTimeSectionAvailability(sessionOptions, isWeekend);
  setTimeSectionAvailability(weekdayTimeOptions, !isWeekend);
  weekdayStartTime.required = !isWeekend;
  sessionHelp.textContent = isWeekend
    ? 'Choose the morning or afternoon session for your weekend request.'
    : 'Weekday requests are subject to owner approval; the owner will confirm the time.';

  if (!isWeekend) {
    sessionOptions.querySelectorAll('input').forEach((input) => { input.checked = false; });
  } else {
    weekdayStartTime.value = '';
  }

  renderCalendar();
}

previousMonthButton.addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar();
});

reservationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  emailHasBeenTouched = true;
  updateEmailValidation();

  if (!selectedDate) {
    showReservationMessage('Please choose a reservation date from the calendar.');
    return;
  }

  if (!reservationForm.reportValidity()) return;

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  const selectedSession = reservationForm.querySelector('input[name="session"]:checked');
  if (!isWeekend && reservationPackage.value === 'airsoft-rental') {
    showReservationMessage('Airsoft rental requests are available on weekends only.');
    return;
  }

  if (isWeekend && !selectedSession) {
    showReservationMessage('Please select a morning or afternoon session for your weekend request.');
    return;
  }

  /* This message will be replaced by an API request when the AWS backend is connected. */
  showReservationMessage('Your request details are ready. Online submission will be activated after the reservation service is connected.');
});

renderCalendar();
