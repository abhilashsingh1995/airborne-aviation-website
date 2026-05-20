// server.js
// ─────────────────────────────────────────────────────────────────────────
// THIS IS THE "BACKEND" — the part of the website you can't see.
// Job: listen for requests from the browser, talk to the database,
// send back HTML pages or JSON responses.
//
// Express is just a small library that makes Node.js easy to use as a
// web server. Without Express, you'd have to write 200+ lines of low-level
// code just to handle a form. With Express, you write 5.
// ─────────────────────────────────────────────────────────────────────────

const express = require('express');
const path = require('path');
const { queries } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────
// "Middleware" runs on every request. Two things we always need:

// 1) Parse JSON in incoming request bodies (so req.body works)
app.use(express.json());

// 2) Serve everything in /public as static files (HTML, CSS, JS, images)
//    This means visiting "/" will automatically serve public/index.html
app.use(express.static(path.join(__dirname, 'public')));

// ─── API ROUTES ────────────────────────────────────────────────────────
// API routes are URLs the FRONTEND calls in the background (via fetch())
// to send/receive data. They return JSON, not HTML.
// We prefix them all with /api/ so they don't collide with page URLs.

// POST /api/leads — called when the demo-booking / lead form is submitted
app.post('/api/leads', (req, res) => {
  try {
    const { name, phone, email = '', course = '', source = 'website', message = '' } = req.body;

    // Basic validation — never trust the browser
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s|-/g, ''))) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
    }

    const result = queries.insertLead.run({ name, phone, email, course, source, message });

    res.json({
      ok: true,
      id: result.lastInsertRowid,
      message: 'Thank you! We will call you within 24 hours.'
    });
  } catch (err) {
    console.error('Lead insert error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try WhatsApp.' });
  }
});

// POST /api/contacts — called when the contact form is submitted
app.post('/api/contacts', (req, res) => {
  try {
    const { name, email, phone = '', subject = '', message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    queries.insertContact.run({ name, email, phone, subject, message });
    res.json({ ok: true, message: 'Message received. We will reply within 24 hours.' });
  } catch (err) {
    console.error('Contact insert error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// ─── ADMIN API (protected by a simple key) ────────────────────────────
// In production, replace this with proper login. For now: a shared key.
const ADMIN_KEY = process.env.ADMIN_KEY || 'airborne-2026';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// GET /api/admin/leads — admin dashboard fetches all leads
app.get('/api/admin/leads', requireAdmin, (req, res) => {
  res.json({
    leads: queries.getAllLeads.all(),
    contacts: queries.getAllContacts.all(),
    stats: {
      totalLeads: queries.totalLeads.get().count,
      totalContacts: queries.totalContacts.get().count,
      byStatus: queries.countLeadsByStatus.all()
    }
  });
});

// PATCH /api/admin/leads/:id — change a lead's status
app.patch('/api/admin/leads/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);
  if (!['new', 'contacted', 'enrolled', 'dropped'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  queries.updateLeadStatus.run({ id, status });
  res.json({ ok: true });
});

// ─── 404 fallback (anything else) ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start the server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✈  Airborne Aviation website running`);
  console.log(`     Local:  http://localhost:${PORT}`);
  console.log(`     Admin:  http://localhost:${PORT}/admin.html?key=${ADMIN_KEY}\n`);
});
