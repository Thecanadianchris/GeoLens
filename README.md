# GeoLens

A photography location app built for [bootcamp/course name] final group project. GeoLens lets users upload photos tagged with location, weather, and camera details, browse a map of photo spots, and interact with other users' uploads through likes and comments.

Built by Christian Richard, Melody Spring, Nadine Hocking 


## Layout & design

Every screen was built from wireframes first, so the app follows a mobile app layout — each page is capped at 420px wide and centred on screen, styled to look and behave like a phone app rather than a traditional website, with a fixed bottom navigation bar shared across every page.

Styling is organised through a shared Sass "abstracts" system rather than one-off values scattered through each component: colours, font sizes, border radii, and breakpoints are all defined once and reused everywhere. Spacing in particular goes through a `spacer()` function tied to a shared spacing scale, so margins and padding stay consistent across pages instead of every component picking its own numbers. Reusable patterns like buttons and flex layouts are pulled in through Sass mixins rather than repeated by hand in each stylesheet.

Because three people wher on the project this was standardised the styling keeping styling consistent going forward from the very start. 


## What it does

Sign up, log in, and manage your account (JWT-based auth)
Upload photos through a 3-step flow: pick photos, set location (GPS auto-detect, drag a pin on the map, or search by address/postcode), then confirm weather, camera details, and a caption
Weather for a photo is pulled automatically based on location and the date you took it (works for past, current, or near-future dates)
Camera/lens and settings are picked from a dropdown that anyone can add new options to — new entries get saved for the whole team, not just your own device
View your uploads in your profile, edit or delete your own photos
Like and comment on other users' photos
Browse a home map showing pins for uploaded photos, with sections for top-liked spots, nearby photos, popular locations, and recently added photos
Search by location, landmark, or county

## What's not built yet

No desktop-specific layout — everything's designed mobile-first
Not deployed yet — currently runs locally only


## Tech stack

Frontend: React (Vite), React Router, Axios, React Hook Form, Sass, Leaflet / React-Leaflet

Backend:Node.js, Express, Sequelize, PostgreSQL (hosted on Supabase), Supabase Storage (image uploads), Multer for file handling

Authentication  uses JWT (JSON Web Token) 

**Third-party APIs (all free, no paid tier required):**
[Open-Meteo](https://open-meteo.com/) — weather data, no API key needed
[Nominatim (OpenStreetMap)](https://nominatim.org/) — address search and reverse geocoding
[OpenStreetMap tile server](https://www.openstreetmap.org/) — map tiles via Leaflet

## Running it locally

You'll need two terminals — one for the backend, one for the frontend.

**Backend:**
```bash
cd Backend
npm install
```
Create a `.env` file in `Backend/` with:

DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=5432
PORT=5000
JWT_SECRET=...
SUPABASE_URL=...
SUPABASE_KEY=...

Then:
```bash
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/` with:

VITE_API_URL=http://localhost:5000/api

Then:
```bash
npm run dev
```

The backend runs on `http://localhost:5000`, the frontend on whatever port Vite prints (usually `http://localhost:5173`). Database tables are created automatically on first run — no manual migration needed.

## Project structure

GeoLens/
├── Backend/
│ ├── config/ # database + Supabase connection
│ ├── middleware/ # JWT auth check
│ ├── models/ # Sequelize models
│ ├── routes/ # API routes
│ └── server.js


|── frontend/
└── src/
├── api/ # axios instance
├── components/ # shared components (BottomNav, etc.)
├── pages/ # route-level pages
└── styles/ # Sass abstracts, base, components, layout, pages
