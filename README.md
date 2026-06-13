# klimarisk

This repository contains the source code for a master thesis project in Geomatics at NTNU. The project develops a web-based dashboard for exploring municipal climate risk data for Norway, based on climate risk data from the NORADAPT climate service.

The dashboard is built to make climate risk data easier to inspect, compare, and understand through linked views such as maps, tables, charts, rankings, and indicator-level controls.

## Repository structure

```text
klimarisk/
├── frontend/   # React, TypeScript, and Vite dashboard application
└── scripts/    # Python preprocessing script and source data
```

## Running the frontend locally

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will usually start at:

```text
http://localhost:5173/
```

## Local data when running locally

When running the app locally, the dashboard should use the local data files from the checked-out commit. This is especially important when inspecting older commits, because the external data repository may have been updated to a newer format that is not compatible with older versions of the application.

The data URL is defined in:

```text
frontend/src/hooks/getPublicUrl.ts
```

In the `getDataUrl` function, use the local data URL for development:

```ts
export const getDataUrl = (fileName: string) => {
  return getPublicUrl(`data/${fileName}`); // For local development, place data files in public/data/
  // return `https://tiltobias.github.io/klimarisk-data/${fileName}`; // For production, fetch from GitHub Pages
}
```

This ensures that the app uses the data version that belongs to the commit being tested.

## Running the Python preprocessing script

From the project root:

```bash
python -m venv .venv
```

Activate the virtual environment.

On Windows:

```bash
.venv\Scripts\activate
```

On Unix or macOS:

```bash
source .venv/bin/activate
```

Install dependencies and run the script:

```bash
pip install -r scripts/requirements.txt
python scripts/prepare_data.py
```

## Thesis context

The project is part of a master thesis on the design and implementation of an interactive climate risk dashboard for Norwegian municipalities. The dashboard is a thesis prototype and is intended to demonstrate how climate risk data can be structured, visualized, and explored in a web-based interface.
