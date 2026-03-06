document.getElementById('scrollToForm')?.addEventListener('click', () => {
  document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('mockForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  status.textContent = '✅ Success! Your request is saved locally (mock submit, no network call).';
  status.classList.add('success');
  form.reset();
});
