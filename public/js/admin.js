// admin.js
// ─────────────────────────────────────────────────────────────────────────
// Reads the admin key from the URL (?key=...) and uses it to call
// protected API routes. Renders leads + contacts in tables.
// In production, replace the key-in-URL with proper login + cookies.
// ─────────────────────────────────────────────────────────────────────────

const params = new URLSearchParams(location.search);
const KEY = params.get('key') || '';

if (!KEY) {
  document.body.innerHTML = `
    <div style="max-width:480px;margin:5rem auto;font-family:Geist,sans-serif;text-align:center;">
      <h1 style="font-family:Fraunces,serif;font-style:italic;">Admin access</h1>
      <p>Add <code>?key=YOUR_ADMIN_KEY</code> to the URL.</p>
      <p style="color:#5a6678;font-size:.9rem;">Default key during development: <code>airborne-2026</code></p>
    </div>`;
}

async function load() {
  try {
    const res = await fetch('/api/admin/leads', {
      headers: { 'x-admin-key': KEY }
    });
    if (res.status === 401) {
      document.body.innerHTML = '<p style="text-align:center;margin:5rem;font-family:sans-serif;">Wrong key. Access denied.</p>';
      return;
    }
    const { leads, contacts, stats } = await res.json();
    renderStats(stats);
    renderLeads(leads);
    renderContacts(contacts);
    document.querySelector('#last-refresh').textContent =
      'Last refresh ' + new Date().toLocaleTimeString();
  } catch (e) {
    console.error(e);
  }
}

function renderStats({ totalLeads, totalContacts, byStatus }) {
  const counts = Object.fromEntries(byStatus.map(r => [r.status, r.count]));
  const html = [
    ['Total leads',       totalLeads],
    ['New',               counts['new']       || 0],
    ['Contacted',         counts['contacted'] || 0],
    ['Enrolled',          counts['enrolled']  || 0],
    ['Contact messages',  totalContacts]
  ].map(([lbl, n]) => `
    <div class="stat">
      <div class="num">${n}</div>
      <div class="lbl">${lbl}</div>
    </div>`).join('');
  document.querySelector('#stats').innerHTML = html;
}

function renderLeads(leads) {
  const body = document.querySelector('#leads-rows');
  if (!leads.length) {
    body.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#5a6678;">No leads yet. Submissions will appear here.</td></tr>';
    return;
  }
  body.innerHTML = leads.map(l => `
    <tr>
      <td>${l.id}</td>
      <td style="white-space:nowrap;font-family:var(--f-mono);font-size:.82rem;">${(l.created_at || '').replace('T',' ').slice(0,16)}</td>
      <td>${escape(l.name)}</td>
      <td><a href="tel:${l.phone}">${escape(l.phone)}</a><br>
          <a href="https://wa.me/91${(l.phone||'').replace(/\D/g,'').slice(-10)}" target="_blank" style="font-size:.78rem;color:#25d366;">WhatsApp →</a></td>
      <td>${escape(l.email || '—')}</td>
      <td>${escape(l.course || '—')}</td>
      <td>${escape(l.source || '—')}</td>
      <td style="max-width:240px;font-size:.88rem;">${escape(l.message || '—')}</td>
      <td>
        <select class="status-select" data-id="${l.id}">
          ${['new','contacted','enrolled','dropped'].map(s =>
            `<option value="${s}" ${s===l.status?'selected':''}>${s}</option>`
          ).join('')}
        </select>
      </td>
    </tr>`).join('');

  // attach status-change handlers
  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;
      await fetch('/api/admin/leads/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': KEY },
        body: JSON.stringify({ status })
      });
      load();
    });
  });
}

function renderContacts(contacts) {
  const body = document.querySelector('#contacts-rows');
  if (!contacts.length) {
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#5a6678;">No contact messages yet.</td></tr>';
    return;
  }
  body.innerHTML = contacts.map(c => `
    <tr>
      <td>${c.id}</td>
      <td style="white-space:nowrap;font-family:var(--f-mono);font-size:.82rem;">${(c.created_at || '').replace('T',' ').slice(0,16)}</td>
      <td>${escape(c.name)}</td>
      <td><a href="mailto:${c.email}">${escape(c.email)}</a></td>
      <td>${escape(c.phone || '—')}</td>
      <td>${escape(c.subject || '—')}</td>
      <td style="max-width:380px;font-size:.92rem;">${escape(c.message)}</td>
    </tr>`).join('');
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

// Tab switching
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.querySelector('#tab-leads').style.display    = t.dataset.tab === 'leads'    ? '' : 'none';
    document.querySelector('#tab-contacts').style.display = t.dataset.tab === 'contacts' ? '' : 'none';
  });
});

document.querySelector('#refresh-btn')?.addEventListener('click', load);

if (KEY) load();
