# Wayfarer — Van & Car Rental Website

A responsive React site for a small van/car rental business:

- Public site: browse the fleet, view photo galleries, send a reservation request
- Admin panel: password-protected — add/edit/delete vehicles (with photos), review and update reservation status
- Data store: a Google Sheet, read and written through a small Google Apps Script backend (no server to host or pay for)
- Works out of the box in **demo mode** (browser-only storage) so you can try everything before connecting a real sheet

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The site starts in **demo mode**: sample vans/cars are preloaded, reservations and any admin changes are saved in your browser's `localStorage`, and the admin password is `admin123`. This is only for trying the site — it resets if you clear browser storage and isn't shared between visitors.

## 2. Connect a real Google Sheet (production data)

### a. Create the spreadsheet

Make a new Google Sheet with two tabs, named exactly:

**`Vehicles`** — header row:
```
id | name | type | seats | transmission | pricePerDay | description | images | available
```
- `images`: comma-separated direct image URLs (e.g. `https://.../van1.jpg, https://.../van2.jpg`)
- `available`: `TRUE` or `FALSE`
- Leave `id` blank for new rows added through the admin panel — it's generated automatically. You can add a couple of rows by hand to start, just make sure `id` is unique text.

**`Bookings`** — header row:
```
id | vehicleId | vehicleName | customerName | email | phone | startDate | endDate | notes | status | createdAt
```
Leave this sheet with just the header row — it fills up as customers submit requests.

### b. Add the backend script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste in the contents of `google-apps-script/Code.gs` from this project.
3. Go to **Project Settings** (gear icon) → **Script Properties** → **Add script property**:
   - Property: `ADMIN_TOKEN`
   - Value: a password of your choice (this is what admins type in to log in)
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the permissions Google asks for, and copy the **Web app URL** (ends in `/exec`).

### c. Point the React app at it

Open `src/config.js` and set:

```js
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

Save, restart `npm run dev` (or rebuild), and the site now reads/writes the Google Sheet directly. The admin password is whatever you set as `ADMIN_TOKEN`.

**Important:** any time you edit `Code.gs`, go to **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**. Apps Script does not update a live URL from saved-but-undeployed edits.

### Adding vehicle photos

Direct image URLs are simplest (any public image host works). To use Google Drive:
1. Upload the photo to Drive, right-click → **Share** → set to "Anyone with the link".
2. Get the file ID from the share link (the long string between `/d/` and `/view`).
3. Use this URL format in the admin panel's photo field: `https://drive.google.com/uc?export=view&id=FILE_ID`

## 3. Build for deployment

```bash
npm run build
```

This outputs static files to `dist/`. Deploy `dist/` to any static host — Netlify, Vercel, GitHub Pages, Cloudflare Pages, or your own server. No Node server is needed at runtime; all data access happens client-side against the Apps Script URL.

The project is already configured for GitHub Pages: `vite.config.js` uses a relative `base: './'` so assets resolve correctly under a repo subpath, and the app uses `HashRouter` (URLs like `/#/admin`) so the `/admin` route works without server-side rewrite rules.

### Deploying to GitHub Pages

1. Push the project to a GitHub repo (see the earlier steps if you haven't already).
2. From the project folder, run:
   ```bash
   npm run deploy
   ```
   This builds the site and pushes `dist/` to a `gh-pages` branch (via the `gh-pages` package, already in `package.json`).
3. In your GitHub repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set the branch to `gh-pages` and folder to `/ (root)`, then **Save**.
6. GitHub shows the live URL at the top of that page after a minute or two — typically `https://<your-username>.github.io/<repo-name>/`.

Run `npm run deploy` again any time you want to push a new version live.

## 4. Project structure

```
src/
  api.js              Data layer — demo (localStorage) or live (Google Sheets) mode
  config.js           Set APPS_SCRIPT_URL here to go live
  components/
    Home.jsx          Landing page: hero, fleet grid, filters
    VehicleCard.jsx    Card shown in the fleet grid
    VehicleModal.jsx   Photo gallery + booking form, opened per vehicle
    BookingForm.jsx    Reservation request form with validation
    AdminLogin.jsx     Password gate for /admin
    AdminDashboard.jsx Tabs: manage fleet / review reservations
    AdminVehicleForm.jsx  Add/edit a vehicle, including photo URLs
    BookingsTable.jsx  Reservation list with status dropdown
google-apps-script/
  Code.gs             Paste into Apps Script — the Sheets-backed API
```

## 5. Notes & things you may want to customize

- **Email notifications:** `Code.gs` has a commented-out `MailApp.sendEmail(...)` line inside `createBooking_` — uncomment and add your address to get an email on every new request.
- **Currency/copy:** prices are shown as `$` — change the symbol in `VehicleCard.jsx` and `VehicleModal.jsx` if needed.
- **Security:** the admin token is a shared password, sent with each admin request — fine for a small single-operator site. For multiple admin users or stronger security, put Apps Script behind Google OAuth instead (a bigger change).
- **Availability conflicts:** this build doesn't auto-block double-booked dates; the admin reviews and confirms each request manually via the status dropdown. Ask if you'd like date-conflict checking added.
