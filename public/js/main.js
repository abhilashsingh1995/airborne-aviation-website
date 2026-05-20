// main.js
// ─────────────────────────────────────────────────────────────────────────
// FRONTEND JAVASCRIPT — runs in the visitor's browser.
// It does three jobs:
//   1) Toggle the mobile menu
//   2) When the lead form is submitted, send the data to the backend
//      via fetch() (no page reload), then show a success/error message
//   3) Same for the contact form
// ─────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1) Mobile menu toggle ─────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // ─── 2) Lead form (Book a Demo / Free Counselling) ─────────────
  const leadForm = document.querySelector('#lead-form');
  if (leadForm) handleForm(leadForm, '/api/leads');

  // ─── 3) Contact form (on contact.html) ─────────────────────────
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) handleForm(contactForm, '/api/contacts');

  // ─── 4) Year in footer ─────────────────────────────────────────
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});


// Generic form handler — works for any form that has a [data-msg] message box.
function handleForm(form, endpoint) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();                // stop the default page reload

    const btn = form.querySelector('button[type="submit"]');
    const msg = form.querySelector('[data-msg]');
    const data = Object.fromEntries(new FormData(form));

    // Reset state
    msg.className = 'form-msg';
    msg.textContent = '';
    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = 'Sending…';

    try {
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (res.ok) {
        msg.className = 'form-msg ok';
        msg.textContent = json.message || 'Submitted successfully.';
        form.reset();
      } else {
        msg.className = 'form-msg err';
        msg.textContent = json.error || 'Something went wrong.';
      }
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = 'Network error — please try WhatsApp or call us.';
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
}
