# Airborne Aviation — Website (Frontend + Backend + Database)

A complete, working website for Airborne Aviation Academy. **Frontend** (what visitors see), **backend** (the brain), and **database** (the memory) — all in one project.

If you have never touched code before, this README will walk you through it. Read it once top-to-bottom.

---

## Table of contents

1. [What you are looking at](#1-what-you-are-looking-at)
2. [The 3 parts of any modern website](#2-the-3-parts-of-any-modern-website)
3. [How a single visit flows through this project](#3-how-a-single-visit-flows-through-this-project)
4. [Folder structure](#4-folder-structure)
5. [How to run it on your laptop (5 minutes)](#5-how-to-run-it-on-your-laptop-5-minutes)
6. [How to see leads coming in](#6-how-to-see-leads-coming-in)
7. [How to make small edits (text, phone, colour)](#7-how-to-make-small-edits-text-phone-colour)
8. [How to launch it on the internet](#8-how-to-launch-it-on-the-internet)
9. [What to add next](#9-what-to-add-next)

---

## 1. What you are looking at

This project is the foundation of a real, modern business website. The current Airborne site is hosted on Google Sites — that's a closed system where you cannot add a database, cannot run server code, cannot do proper SEO, and cannot collect leads into a system you control. **This project replaces that.**

What this site does:

- **Public pages** (Home, Courses, About, Contact) — what students see on Google.
- **Lead capture form** on the homepage and a contact form on the contact page. When a student submits, their info is saved into your own database.
- **Admin dashboard** — a private page (`/admin.html?key=...`) where you see every lead, every message, change their status (`new → contacted → enrolled`), and never lose a contact.
- **WhatsApp button** that opens directly to your number with a pre-filled message.
- **SEO-friendly** structure with a separate page per topic, schema.org markup, real meta titles and descriptions.

---

## 2. The 3 parts of any modern website

Every website like Amazon, BookMyShow, IRCTC — and now yours — is built on three parts:

### Part A — Frontend (what the visitor sees in their browser)

The frontend is **HTML, CSS and JavaScript**.
- **HTML** is the structure (what is text, what is a button, what is an image).
- **CSS** is the appearance (colours, fonts, spacing, layout).
- **JavaScript** is the behaviour (when you click "Submit", what happens).

In this project: every file inside `/website/public/` is frontend. Anyone can open these files in a browser and see them. No secrets here.

### Part B — Backend (the server / the brain)

The backend runs on **a computer somewhere** (your laptop while testing; a hosting server like Render once live). The browser cannot see backend code — only the *output* it sends back.

The backend's job in this project:

1. Receive form submissions when a student presses Submit.
2. Validate them (is the phone really 10 digits? is the email real?).
3. Save them to the database.
4. Send back a "yes, saved" or "no, error" message to the browser.

Built with **Node.js** (the engine) + **Express** (a tiny library that makes Node easy to use as a web server). All in one file: `server.js`.

### Part C — Database (the memory)

The database is where data **lives forever**, even when the server restarts. We use **SQLite**, which is a database that is just one file on disk — `data/airborne.db`. No installation, no password, no separate server. For small to medium businesses (under ~100,000 monthly visitors), SQLite is perfectly fine and many shipping production sites use it.

Inside the database we have two **tables** — like sheets in Excel:

```
leads
┌────┬──────────────┬─────────────┬────────────────┬──────────┬──────────────┬─────────┬────────────┐
│ id │ name         │ phone       │ email          │ course   │ source       │ status  │ created_at │
├────┼──────────────┼─────────────┼────────────────┼──────────┼──────────────┼─────────┼────────────┤
│  1 │ Riya Sharma  │ 9876543210  │ riya@gmail.com │ CPL      │ homepage     │ new     │ 2026-05-10 │
│  2 │ Amit Khanna  │ 9988776655  │                │ Cadet    │ homepage     │ enrolled│ 2026-05-09 │
└────┴──────────────┴─────────────┴────────────────┴──────────┴──────────────┴─────────┴────────────┘

contacts
┌────┬──────────────┬─────────────────────┬──────────┬──────────────┬───────────────┬────────────┐
│ id │ name         │ email               │ phone    │ subject      │ message       │ created_at │
└────┴──────────────┴─────────────────────┴──────────┴──────────────┴───────────────┴────────────┘
```

You can later export this data to Excel, sync it to a CRM, or just view it in the admin dashboard.

---

## 3. How a single visit flows through this project

A student opens `airborneaviation.in`, fills the form, presses Submit. Here is exactly what happens:

```
   STUDENT'S BROWSER                   YOUR SERVER                  DATABASE
   ─────────────────                   ───────────                  ────────

   1. Visits airborneaviation.in
        │
        │   GET request
        ├──────────────────────────────►  Express receives request
        │                                  │
        │                                  │  Looks in /public/
        │                                  │  Finds index.html
        │                                  │
        │  ◄────────────── HTML, CSS, JS ──┤
        │                                  
   2. Page renders. Student fills form.

   3. Student clicks "Submit".
        │
        │  main.js intercepts the click
        │  Stops normal page reload
        │  Sends data via fetch() as JSON
        │
        │   POST /api/leads {name, phone, email, course}
        ├──────────────────────────────►  Express matches POST /api/leads route
        │                                  │
        │                                  │  Validates data
        │                                  │
        │                                  │  Calls queries.insertLead.run(...)
        │                                  ├──────────────────────────► INSERT INTO leads...
        │                                  │  ◄─────────────────────── Saved as row #4
        │                                  │
        │  ◄──────── { ok: true, msg: "We will call you..." } ──┤
        │
   4. main.js shows green success message inside the form.
```

That's the whole loop. Once you understand this, you understand every modern web app on the planet.

---

## 4. Folder structure

```
airborne/website/
├── package.json              ← Lists which Node libraries to install
├── server.js                 ← BACKEND. The Express server. Receives form data.
├── database.js               ← Sets up the SQLite database tables and queries.
├── data/
│   └── airborne.db           ← The database FILE itself (auto-created on first run).
├── public/                   ← FRONTEND. Everything in here is what visitors see.
│   ├── index.html            ← Homepage
│   ├── courses.html          ← Courses page
│   ├── about.html            ← About page
│   ├── contact.html          ← Contact page
│   ├── admin.html            ← Private admin dashboard
│   ├── css/
│   │   └── style.css         ← All visual styling for every page
│   └── js/
│       ├── main.js           ← Handles forms, mobile menu (visitor-facing)
│       └── admin.js          ← Powers the admin dashboard (only loads on admin.html)
└── README.md                 ← This file.
```

Why this structure?
- **One CSS file** so the brand looks identical on every page.
- **One main.js** because all pages need the same form-submit behaviour.
- **Separate admin.js** so visitors never download the admin code.
- **Public folder is everything-public** — Express auto-serves it.
- **No secrets in /public/** — the database key, the database file, and `server.js` all live outside it.

---

## 5. How to run it on your laptop (5 minutes)

You'll need **Node.js** installed once on your computer. Free, takes 2 minutes:

1. **Install Node.js** (LTS version) from <https://nodejs.org>.
   To check it worked, open Terminal (Mac) or Command Prompt (Windows) and type:
   ```bash
   node -v
   ```
   You should see something like `v20.10.0`. If yes, continue.

2. **Open a terminal in this project folder.** On Mac: open the folder in Finder, right-click → "New Terminal at Folder". On Windows: in File Explorer, click into the address bar and type `cmd`, press Enter.

3. **Install the dependencies** (Express, SQLite library — listed in `package.json`):
   ```bash
   npm install
   ```
   This creates a `node_modules/` folder. Don't touch it. Don't upload it. (It's huge — 100+ MB — and rebuilds itself anywhere with `npm install`.)

4. **Start the server:**
   ```bash
   npm start
   ```
   You'll see:
   ```
     ✈  Airborne Aviation website running
        Local:  http://localhost:3000
        Admin:  http://localhost:3000/admin.html?key=airborne-2026
   ```

5. **Open your browser** and visit **<http://localhost:3000>**. The site is live on your machine. Fill the form. Open the admin URL. You'll see your test submission.

Press `Ctrl+C` in the terminal to stop the server.

---

## 6. How to see leads coming in

Open the admin dashboard:

```
http://localhost:3000/admin.html?key=airborne-2026
```

You'll see:
- Total leads count
- Each lead's name, phone (clickable to dial / WhatsApp), email, course interest, source, message, status
- A status dropdown for each — change `new → contacted → enrolled → dropped` as you work the pipeline
- A separate tab for general contact messages

> **Important:** The default key `airborne-2026` is for development only. Before going live, **change it** to a long random string. See [section 8](#8-how-to-launch-it-on-the-internet) below.

---

## 7. How to make small edits (text, phone, colour)

You don't need to be a developer for these.

### Change phone number, email, address

These are repeated across pages. Open each `.html` file in `/public/` in a code editor (VS Code is free: <https://code.visualstudio.com>) and do a Find & Replace:

- Search for `9953777320` → replace with the new number.
- Search for `info@airborneaviation.in` → replace with new email.
- Search for `E-549, 2nd Floor, Ramphal Chowk, Sector-7 Dwarka` → replace with new address.

Save. Refresh browser. Done.

### Change brand colour or fonts

Open `/public/css/style.css`. The first ~25 lines define every colour and font in `:root { ... }`. Change one variable and the entire site updates. For example, to switch the gold accent from brass to true gold, change `--c-brass: #b88a3e;` to `--c-brass: #d4a017;`.

### Change page text

Open the relevant `.html` file. The text is plain English between the tags. Edit it. Save. Refresh.

### Add a new course

Open `/public/courses.html`. Find an existing `<article class="course">` block. Copy-paste it. Change the text inside. Save.

---

## 8. How to launch it on the internet

You have three solid options. Pick the one that fits your skill level.

### Option A — **Render.com** (free tier, simplest, recommended)

1. Sign up at <https://render.com>
2. Push this project to a GitHub repository (free GitHub account at <https://github.com>)
3. In Render, click **New → Web Service** → connect your GitHub repo.
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment variables:** add `ADMIN_KEY` with a long random string of your choice.
5. Click **Create Web Service**. In ~3 minutes you get a URL like `https://airborne-website.onrender.com`.
6. To use your real domain, in your domain registrar (GoDaddy, Hostinger, Namecheap), point `airborneaviation.in` to Render's CNAME they give you.

Free tier note: Render free instances "sleep" after 15 min of inactivity and take ~30 seconds to wake up on the first request. For ₹600/month you get an always-on instance.

### Option B — **Hostinger VPS / DigitalOcean** (₹400–800/month, full control)

1. Buy a small VPS (1 GB RAM is plenty).
2. SSH in. Install Node.js. Upload your project (via SFTP or `git clone`).
3. Run `npm install`.
4. Use **PM2** to keep it running: `npm install -g pm2`, then `pm2 start server.js --name airborne`.
5. Install **nginx** as a reverse proxy in front. Add SSL via Let's Encrypt (free).
6. Point your domain at the VPS IP.

This is more work but you own everything. Cheapest long-term.

### Option C — **Railway / Fly.io** (similar to Render, slightly more flexible)

Same flow as Render. Both have free tiers and both work fine.

### Before you launch — checklist

- [ ] Change the `ADMIN_KEY` from `airborne-2026` to a long random string (20+ characters). On Render/Railway: set as environment variable. On VPS: edit your start command.
- [ ] Buy and install an **SSL certificate** (free via Let's Encrypt; Render does this automatically). Your URL must be `https://`, not `http://`.
- [ ] Update the schema.org `url` in `index.html` from `https://www.airborneaviation.in` to your real domain.
- [ ] Set up **Google Analytics 4** — paste the tracking snippet in `<head>` of all pages.
- [ ] Create a **Google Search Console** account, add your domain, submit a sitemap.
- [ ] Take a fresh **photo of Capt. Navrang** and put it where the placeholder circle is in `about.html` and `index.html` (the `.faculty-pic` div). Replace the letter "N" with `<img src="/images/navrang.jpg" alt="Capt. Navrang Singh">` and add `width:100%;height:100%;object-fit:cover;border-radius:50%` to the image.
- [ ] **Backup the database** weekly: just download `data/airborne.db`. That one file is your entire customer database.

---

## 9. What to add next (in this order)

When you're ready to grow, here's the natural next-build order:

1. **Email notifications** — when a new lead comes in, get an email instantly.
   Use [nodemailer](https://nodemailer.com/) with Gmail SMTP. Add ~15 lines to `server.js`.
2. **WhatsApp notifications** — same idea, via [Twilio](https://www.twilio.com/) or AiSensy India.
3. **Newsletter signup** — add a simple email-only field in the footer; create a `subscribers` table.
4. **Blog** — add a `blog/` folder, write posts as markdown files, render with a tiny library like `marked`. Each post = one URL Google can rank.
5. **Free PDF download** — add a "Download Free DGCA Syllabus" form. After submit, server emails them the PDF and you keep their email.
6. **Google reCAPTCHA** — once you start getting spam.
7. **Move from SQLite to PostgreSQL** — only when you cross ~50,000 leads or want multi-server hosting.
8. **CMS layer** — if you ever want non-technical staff to edit pages, swap to **WordPress** or add a small admin editor.

---

## Where to ask for help

- **Node.js / Express docs:** <https://expressjs.com>
- **SQLite docs:** <https://www.sqlite.org/lang.html>
- **Render deployment guide:** <https://render.com/docs/deploy-node-express-app>
- **Stack Overflow:** for any specific error, paste the exact message into Google + "stack overflow" — 99% of problems someone has already hit.

---

That's it. You now have a real, professional website with a backend you control and a database that is your business asset. The next 100 leads in `data/airborne.db` belong to you, not to Google Sites, not to JustDial, not to any third party.

Good luck. ✈
