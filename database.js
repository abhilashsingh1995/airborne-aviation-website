// database.js
// ─────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE DOES (plain English):
// We need a place to STORE the form submissions from the website
// (demo bookings, contact messages, etc). That place is a database.
// We use SQLite — it's just one file on disk (data/airborne.db).
// No server to install, no password, no setup. Perfect to start with.
//
// A "table" inside the database is like a sheet in Excel:
//   • Each ROW = one student inquiry
//   • Each COLUMN = one field of info (name, phone, email...)
// ─────────────────────────────────────────────────────────────────────────

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Make sure the /data folder exists. If first run, create it.
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Open (or create) the database file.
const db = new Database(path.join(dataDir, 'airborne.db'));
db.pragma('journal_mode = WAL'); // faster + safer

// ─── Create tables (only if they don't already exist) ───────────────────

// 1) LEADS — every demo-class booking & syllabus PDF request
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL,
    email       TEXT,
    course      TEXT,                          -- 'CPL' | 'Cadet' | 'ATPL' | 'Online'
    source      TEXT,                          -- 'demo-form' | 'syllabus' | 'newsletter'
    message     TEXT,
    status      TEXT DEFAULT 'new',            -- new | contacted | enrolled | dropped
    created_at  TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

// 2) CONTACTS — general contact-form submissions
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    subject     TEXT,
    message     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

// ─── Helper functions that the server will use ──────────────────────────
// These are just SQL queries wrapped in JS functions so server.js looks clean.

const queries = {
  // INSERT a new lead and return its id
  insertLead: db.prepare(`
    INSERT INTO leads (name, phone, email, course, source, message)
    VALUES (@name, @phone, @email, @course, @source, @message)
  `),

  // SELECT all leads (most recent first) — used by admin dashboard
  getAllLeads: db.prepare(`
    SELECT * FROM leads ORDER BY id DESC
  `),

  // INSERT a contact form submission
  insertContact: db.prepare(`
    INSERT INTO contacts (name, email, phone, subject, message)
    VALUES (@name, @email, @phone, @subject, @message)
  `),

  // SELECT all contact messages (most recent first)
  getAllContacts: db.prepare(`
    SELECT * FROM contacts ORDER BY id DESC
  `),

  // Update lead status (e.g. mark as 'contacted')
  updateLeadStatus: db.prepare(`
    UPDATE leads SET status = @status WHERE id = @id
  `),

  // Quick stats for the admin dashboard
  countLeadsByStatus: db.prepare(`
    SELECT status, COUNT(*) as count FROM leads GROUP BY status
  `),

  totalLeads: db.prepare(`SELECT COUNT(*) as count FROM leads`),
  totalContacts: db.prepare(`SELECT COUNT(*) as count FROM contacts`)
};

module.exports = { db, queries };
