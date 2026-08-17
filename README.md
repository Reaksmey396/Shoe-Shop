# SoleStyle — React + Tailwind + Firebase

This is a React conversion of the original static HTML/Tailwind/vanilla-JS
"SoleStyle" shoe shop project. All pages, the navbar/mobile menu, the
localStorage-backed shopping cart, and the search dropdown have been rebuilt
as React components with React Router, and Login/Register now run through
Firebase Authentication.

## Stack

- **React 18** + **Vite** (dev server / bundler)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router v6** for client-side routing
- **Firebase** (Authentication now, Firestore wired up and ready if you want
  to move products/cart/orders to the cloud)

## Project structure

```
src/
  components/     Navbar, Footer, CartDrawer, SiteSearch, Layout
  context/        CartContext (cart state + localStorage), AuthContext (Firebase auth)
  lib/            firebase.js (Firebase init), data.js (service/product catalog)
  pages/          Home, Services, DetailCard, About, Contact, Login, Register
  App.jsx         Route definitions
  main.jsx        React entry point
public/
  images/         Local images (About page profile photos)
```

## Page → route mapping

| Old file                        | New route             |
| -------------------------------- | ---------------------- |
| `index.html` / `Pages/Home.html` | `/`                     |
| `Pages/Services.html`            | `/services`             |
| `Pages/Detail_card.html?service=x` | `/services/:serviceId` |
| `Pages/About.html`               | `/about`                |
| `Pages/Contact.html`             | `/contact`              |
| `Components/Login.html`          | `/login`                |
| `Components/Register.html`       | `/register`             |

The Navbar, mobile menu, and cart drawer used to be copy-pasted into every
page — they're now single shared components rendered once through
`Layout.jsx`.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Firebase config (see below)
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Firebase setup (required for Login/Register to work)

1. Go to the [Firebase console](https://console.firebase.google.com) and
   create a project.
2. Add a **Web App** to the project and copy the config values shown into
   your local `.env` file (copied from `.env.example`):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. In the console, go to **Authentication → Sign-in method** and enable the
   **Email/Password** provider.
4. Restart `npm run dev` after editing `.env` (Vite only reads env vars at
   startup).

Once that's done, `/register` creates a real Firebase user (with the
username saved as their display name) and `/login` signs them in. The
Navbar shows "Hi, {name}" and a Log Out button once a user is signed in.

### Optional: move the cart to Firestore

Right now the cart (`CartContext.jsx`) still uses `localStorage`, exactly
like the original `cart.js`. `src/lib/firebase.js` already exports a `db`
(Firestore) instance if you'd like to swap the cart, orders, or the product
catalog itself over to Firestore collections instead — that wasn't required
by the original app, so it's left as straightforward follow-up work.

## What was preserved from the original

- Same Tailwind visual design (colors, layout, `text-clifford` custom
  theme color, Poppins font, Font Awesome icons).
- Same cart behavior: add/remove/±quantity, running totals, "Order Now"
  clears the cart with a confirmation alert, cart badge count in the navbar.
- Same live search dropdown across shoes/services.
- Same Services page category filters + "See More" reveal.
- Same Detail page layout, driven by the same service data (now a shared
  `src/lib/data.js` module instead of being duplicated inline).

## What changed / improved

- No more duplicated HTML across `index.html`, `Pages/Home.html`,
  `Components/Navbar.html`, `Components/Footer.html`, etc. — one Navbar,
  one Footer, one CartDrawer.
- Cart state and auth state are shared via React Context instead of
  `document.querySelector` + manual DOM manipulation.
- Login/Register are real authentication now (Firebase) instead of static
  forms with no backend.
- Client-side routing (React Router) instead of full page reloads between
  `.html` files.

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```
