# Data Center Buildout Tracker ⚡

An interactive web application mapping operational, under-construction, and planned data center campuses globally. Track hyperscale and enterprise facilities with real-time capacity metrics (MW), location coordinates, cooling specifications, and construction timelines.

---

## Features

- **Interactive Map Visualization**: Powered by Leaflet.js with an Esri Dark Gray canvas. Data centers are rendered with circle markers whose radius scales dynamically with power capacity (MW).
- **Status Classification**:
  - 🟢 **Operational**: Live and powered facilities.
  - 🟡 **In Construction**: Active buildouts breaking ground or fitting out.
  - 🔵 **Planned**: Permitting, site acquisition, or pipeline stages.
- **Live Aggregated Metrics**: Instant dashboard counters displaying total facility count and aggregate power capacity (MW) split across operating, in-construction, and planned pipelines.
- **Real-Time Search & Filters**: Filter instantly by status and query campuses by operator (*AWS, Microsoft, Google, Meta, Equinix, etc.*), facility name, city, state, or notes.
- **Detailed Metadata Drawer**: Click any campus marker to fly to the site and inspect detailed metadata:
  - Power capacity (MW) & gross floor area (sq ft)
  - Operator & developer
  - Announced and projected completion dates
  - Geographic coordinates & city/state
  - Cooling architecture (e.g., closed-loop chilled water, direct-to-chip liquid cooling)
  - Source links & documentation notes
- **Add New Campuses**: Interactive form modal to test and add new facilities to the active session.
- **Export & Download**: Export dataset to formatted JSON or copy to clipboard for external analysis.
- **Zero API Key Requirement**: Uses free, public tile layers and open web standards without third-party API key configurations.

---

## Tech Stack

- **HTML5 & Vanilla CSS3**: Custom dark-mode design system with responsive overlays, drawers, and modal dialogs.
- **JavaScript (ES6+)**: Modular clientside logic with `async/await` data fetching and event-driven architecture.
- **[Leaflet.js](https://leafletjs.com/) (v1.9.4)**: Lightweight open-source mobile-friendly interactive map library.
- **Esri Canvas Tiles**: High-contrast dark gray base and reference layers.
- **JSON Dataset**: [`data.json`](data.json) serves as the primary dataset.

---

## Quick Start (Running Locally)

Because the application fetches [`data.json`](data.json) dynamically using the Fetch API, modern browsers block cross-origin requests over the `file://` protocol. The application should be served via a local HTTP server.

### Option 1: Python (Built-in)

```bash
# Python 3
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js (npx)

```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click on [`index.html`](index.html) and select **Open with Live Server**.

---

## Dataset Schema

The dataset is stored in [`data.json`](data.json) as an array of facility objects with the following schema:

```json
{
  "id": "dc-us-va-01",
  "name": "AWS US-East-1 Mega Campus",
  "operator": "Amazon Web Services",
  "developer": "AWS / Hyperscale",
  "status": "operational",
  "lat": 39.0438,
  "lng": -77.4874,
  "city": "Ashburn",
  "state": "Virginia",
  "country": "USA",
  "powerCapacityMW": 250,
  "sqft": 650000,
  "announcedYear": 2014,
  "completionYear": 2017,
  "cooling": "Closed-loop chilled water & evaporative",
  "notes": "Cornerstone of 'Data Center Alley' in Loudoun County.",
  "sourceUrl": "https://aws.amazon.com/about-aws/global-infrastructure/"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the campus |
| `name` | `string` | Name of the facility or campus |
| `operator` | `string` | Primary operator or tenant (e.g. AWS, Microsoft, Vantage) |
| `developer` | `string` | Real estate developer or REIT |
| `status` | `string` | `"operational"`, `"construction"`, or `"planned"` |
| `lat` / `lng` | `number` | Geographic latitude and longitude coordinates |
| `city` / `state` / `country` | `string` | Location hierarchy |
| `powerCapacityMW` | `number` | Power capacity in Megawatts (MW) |
| `sqft` | `number` | Gross building area in square feet |
| `announcedYear` | `number` | Year the project was announced |
| `completionYear` | `number` | Commissioning or expected completion year |
| `cooling` | `string` | Cooling infrastructure / heat rejection design |
| `notes` | `string` | Summary notes, connectivity, or regional significance |
| `sourceUrl` | `string` | Public news release or infrastructure reference |

---

## Project Structure

```text
├── index.html     # Application layout, UI overlays, modals, and Leaflet setup
├── styles.css     # Dark-theme styling, glassmorphism cards, and responsive drawer
├── app.js         # Map initialization, data rendering, search/filter, and modal handlers
├── data.json      # Structured global data center facility records
└── LICENSE        # GNU General Public License v3.0
```

---

## License

This project is licensed under the terms of the [GNU General Public License v3.0](LICENSE).
