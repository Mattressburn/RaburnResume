# Matthew Raburn - Interactive Resume & Vinyl Dashboard

A Matrix-themed interactive resume and data visualization dashboard built with **React 19** and **Vite**.

## 🚀 Features

* **Interactive Resume:** Terminal-style interface with "Hacker Mode" (Konami Code easter egg).
* **Vinyl Dashboard:** A data visualization of my top 500 records, built with Recharts.
* **Performance:**
    * Migrated from CRA to **Vite** for instant HMR and optimized builds.
    * **Parallelized API Fetching:** Custom Netlify Function fetches Discogs data in concurrent batches (respecting rate limits) to reduce load time by ~80%.
* **Cyberpunk UI:** Custom "Boot Sequence" loader and Matrix rain canvas effects.

## 🛠️ Tech Stack

* **Frontend:** React 19, Tailwind CSS, Framer Motion, Recharts
* **Backend:** Netlify Functions (TypeScript) for API proxying and caching
* **Tooling:** Vite, ESLint

## 🏃‍♂️ Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the dev server:**
    ```bash
    npm start
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```