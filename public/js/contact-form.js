(function () {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const parameters = new URLSearchParams(window.location.search);
  const roomName = parameters.get('room');
  const kind = document.querySelector('#contact-kind');
  const roomField = document.querySelector('#contact-room');
  const subject = document.querySelector('#contact-subject');
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('input[type="submit"]');

  if (roomName) {
    kind.value = 'room';
    roomField.value = roomName;
    subject.value = `Room availability for ${roomName}`;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    status.textContent = '';
    status.classList.remove('is-success');
    submit.disabled = true;
    submit.value = 'Sending…';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : {};
      if (!response.ok) throw new Error(result.message || 'Unable to send your message.');

      form.reset();
      kind.value = roomName ? 'room' : 'contact';
      roomField.value = roomName || '';
      if (roomName) subject.value = `Room availability for ${roomName}`;
      status.textContent = 'Your message is on its way. We’ll be in touch shortly.';
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = error.message || 'Unable to send your message. Please try again.';
      status.classList.remove('is-success');
    } finally {
      submit.disabled = false;
      submit.value = 'Send';
    }
  });
}());
