# MGNREGA-
🌾 MGNREGA Maharashtra District Dashboard

A simple, user-friendly web application that allows citizens of Maharashtra to view district-wise performance data of the Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) program.

This project aims to make government data accessible and understandable for every citizen — especially rural populations with low digital and data literacy.

🧭 Objective

The Government of India provides open APIs on data.gov.in
 for MGNREGA performance.
However, this data is difficult to interpret for non-technical users.
This project converts that data into visual insights — using graphs, cards, and simple Marathi + English text.

🏗️ Features

✅ Select any district of Maharashtra to view its MGNREGA performance
✅ Simple green-themed interface designed for low-literacy users
✅ Bilingual support (English + Marathi)
✅ Option to auto-detect user district (using location API)
✅ Works even if the data.gov.in API is temporarily down
✅ Responsive layout for both mobile and desktop users

🧩 Tech Stack

Frontend: HTML5, CSS3, JavaScript (Vanilla)

Charting: Chart.js

Backend (optional): Node.js / Flask (for caching API data)

Database: SQLite / MySQL (to store cached results)

Hosting: VM or VPS (production-ready, scalable)

⚙️ How It Works

User selects a district from the dropdown (e.g., Pune, Nashik, Nagpur).

The app fetches MGNREGA data (from API or local cache).

It displays clear visual summaries:

Total households benefited

Total work generated

Fund utilization

Yearly comparison

Users can also switch to Marathi view for better understanding.

🎨 Design Principles

Green color theme → Symbolic of rural India & sustainability 🌱

Large buttons + clear Marathi labels → for easy navigation

Simple icons instead of text wherever possible

Offline fallback → data loads from cached JSON when API fails


🚀 Hosting Setup (for Production)

Host on a VPS (like Linode, DigitalOcean, AWS)

Serve static files (HTML, CSS, JS) via Nginx or Apache

Run a backend service to periodically fetch and cache API data

Connect domain (optional)

💡 Future Improvements

Add voice assistant in Marathi for rural accessibility

Allow district comparison side-by-side

Add graph-based historical analysis

Integrate mobile-friendly PWA version

🧑‍💻 Developer

Created by: Bhakti Dadaso Ghadage
Purpose: Take Home Project – Our Voice, Our Rights
Year: 2025
Location: Maharashtra, India 🇮🇳
