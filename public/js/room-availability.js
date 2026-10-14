(function () {
  const roomDetails = Array.from(document.querySelectorAll('#rooms .room-details'));

  const restoreDetails = (details, notice) => {
    details.innerHTML = details.dataset.originalContent;
    details.classList.remove('is-requesting');
    bindAvailabilityButtons(details);
    if (notice) {
      details.querySelector('h2').insertAdjacentHTML('afterend',
        `<p class="room-request-notice" role="status">${notice}</p>`);
    }
  };

  const openAvailabilityForm = (details, roomName) => {
    roomDetails.filter((item) => item !== details && item.classList.contains('is-requesting'))
      .forEach(restoreDetails);

    details.classList.add('is-requesting');
    details.innerHTML = `
      <form class="room-request-form">
        <h2>Check availability</h2>
        <p>Tell us about your stay at ${roomName}.</p>
        <label for="room-name">Your name</label>
        <input id="room-name" name="name" required autocomplete="name">
        <label for="room-email">Email address</label>
        <input id="room-email" name="email" type="email" required autocomplete="email">
        <label for="room-dates">Preferred stay dates</label>
        <input id="room-dates" name="dates" placeholder="For example, June 12–15">
        <label for="room-note">Anything we should know?</label>
        <textarea id="room-note" name="note" rows="3"></textarea>
        <p class="room-form-status" aria-live="polite"></p>
        <div class="room-form-actions"><button class="room-form-submit" type="submit">Request availability</button><button class="room-form-cancel" type="button">Cancel</button></div>
      </form>`;

    const form = details.querySelector('.room-request-form');
    const cancel = details.querySelector('.room-form-cancel');
    const status = details.querySelector('.room-form-status');
    const submit = details.querySelector('.room-form-submit');

    cancel.addEventListener('click', () => restoreDetails(details));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const dates = data.get('dates').trim();
      const note = data.get('note').trim();
      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.textContent = '';

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'room',
            roomName,
            subject: `Room availability for ${roomName}`,
            name: data.get('name'),
            email: data.get('email'),
            message: `${dates ? `Preferred stay: ${dates}. ` : ''}${note || 'No additional notes.'}`
          })
        });
        const type = response.headers.get('content-type') || '';
        const result = type.includes('application/json') ? await response.json() : {};
        if (!response.ok) throw new Error(result.message || 'Unable to send your request.');
        restoreDetails(details, `Availability request sent for ${roomName}. We’ll be in touch shortly.`);
      } catch (error) {
        status.textContent = error.message || 'Unable to send your request. Please try again.';
        submit.disabled = false;
        submit.textContent = 'Request availability';
      }
    });
  };

  const bindAvailabilityButtons = (details) => {
    details.querySelectorAll('.room-availability').forEach((button) => {
      button.addEventListener('click', () => openAvailabilityForm(details, button.dataset.room));
    });
  };

  roomDetails.forEach((details) => {
    details.dataset.originalContent = details.innerHTML;
    bindAvailabilityButtons(details);
  });
}());
