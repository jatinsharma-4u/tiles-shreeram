import { qa, q } from './utils';
import { CONFIG } from './config';

const rules = {
  required: (v) => v.trim().length > 0 || 'This field is required.',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
  tel: (v) => v.replace(/\D/g, '').length >= 8 || 'Enter a valid phone number.',
};

function validate(field) {
  const input = field.querySelector('input, select, textarea');
  if (!input || input.readOnly) return true;
  const err = field.querySelector('.field__err');
  let msg = true;
  if (input.required) msg = rules.required(input.value);
  if (msg === true && input.value) {
    if (input.type === 'email') msg = rules.email(input.value);
    if (input.type === 'tel') msg = rules.tel(input.value);
  }
  const ok = msg === true;
  input.setAttribute('aria-invalid', String(!ok));
  if (err) err.textContent = ok ? '' : msg;
  return ok;
}

export function initForms(scope = document, extra = {}) {
  qa('[data-form]', scope).forEach((form) => {
    const status = q('[data-form-status]', form);
    const fields = qa('.field', form);

    fields.forEach((f) => {
      const input = f.querySelector('input, select, textarea');
      input?.addEventListener('blur', () => input.value && validate(f));
      input?.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && validate(f));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';
      const results = fields.map(validate);
      if (results.includes(false)) {
        status.textContent = 'Please check the highlighted fields.';
        status.classList.add('is-error');
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      data.type = form.dataset.form;
      if (extra.productName) data.product = extra.productName;
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;

      try {
        if (CONFIG.formEndpoint) {
          const res = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('Request failed');
          status.textContent = 'Thank you, your enquiry has been sent. We will be in touch shortly.';
          form.reset();
        } else {
          // No backend configured yet: open a pre-filled email so the enquiry is never lost.
          const lines = Object.entries(data)
            .filter(([k, v]) => v && k !== 'type')
            .map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`)
            .join('\n');
          const subject = data.product ? `Enquiry: ${data.product}` : 'Website enquiry';
          location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
          status.textContent = 'Your email app has opened with your enquiry, just press send.';
        }
      } catch {
        status.textContent = 'Sorry, something went wrong. Please try again or contact us on WhatsApp.';
        status.classList.add('is-error');
      } finally {
        btn.disabled = false;
      }
    });
  });
}
