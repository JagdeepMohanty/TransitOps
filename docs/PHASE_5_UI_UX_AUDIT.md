# Phase 5 – UI/UX Design Audit

**Goal:** Identify the 10 most significant visual and usability problems across the current TransitOps application before we begin the redesign.  The audit looks at the main pages used daily by operators and administrators.

---

## 1️⃣ Global Issues (affect every page)
| # | Problem | Why it hurts UX | Evidence (code snippet / description) |
|---|---------|----------------|--------------------------------------|
| G1 | **Inconsistent typography hierarchy** – headings, sub‑headings, body text, labels, and button text use a mixture of `text‑xs`, `text‑sm`, `text‑base` and custom `tracking‑wide` classes without a defined scale. | Users scan pages for information; mismatched font sizes break the visual scan path and make important information hard to locate. | Example: In `LoginPage.jsx` the brand tagline uses `text‑xs` while the main heading uses `text‑2xl`; in `VehiclesPage.jsx` table column headers are rendered by the generic `Table` component with `text‑xs`, while KPI cards use `text‑sm` for labels and `text‑xl` for values.
| G2 | **Low colour contrast on dark backgrounds** – the login screen uses a deep `bg‑slate‑950` with white text, but several overlay elements (`bg‑brand‑600/15`, `bg‑indigo‑600/10`) rely on low‑opacity colours that reduce legibility, especially for users with visual impairments. | Fails WCAG AA contrast; reduces readability on low‑light monitors. | `className="min-h-screen bg-slate-950 ..."` and inner glows `bg-brand-600/15` produce insufficient contrast for the white text inside the left column.
| G3 **Missing focus indicators** – interactive elements (links, buttons, table rows) rely on `:hover` styles only. Keyboard users cannot see which element is focused. | Accessibility regression; keyboard navigation becomes invisible. | No `focus:outline` utilities present in any component (e.g., `Button` component does not expose a focus ring). 
| G4 | **Overly dense tables on small screens** – `VehiclesPage` and `DriversPage` render a table with 8+ columns. When the viewport shrinks below ~768 px the table overflows horizontally, causing a horizontal scroll that hides column headers. | Mobile and tablet users cannot read data without scrolling far; reduces efficiency. | The `<Table>` wrapper has `className="border-0 shadow-none rounded-none"` but no responsive handling; the container `<div className="rounded-xl border... overflow-hidden">` does not set `overflow-x:auto`.
| G5 | **CTA hierarchy weak** – primary actions (e.g., *Add Vehicle*, *Add Driver*) are rendered as small secondary buttons with icon‑only labels inside a dense toolbar, making them less discoverable. | Users may miss critical actions, leading to extra clicks. | In `VehiclesPage.jsx` the *Add Vehicle* button is `size="sm" variant="primary"` placed next to a *Refresh* button of the same visual weight.
| G6 | **Modals not standardized** – `ConfirmModal` is used for delete confirmations but its width, padding, and button ordering differ across pages. | Inconsistent modal experience confuses users and can cause accidental clicks. | `ConfirmModal` usage shows different `variant` values (`danger` vs default) but no consistent `max‑width` or `aria‑label` handling.
| G7 | **Form field spacing and labels** – login form fields have large vertical padding but the label‑to‑input spacing is inconsistent (labels `mb‑1.5`, inputs `px‑3.5 py‑2.5`). Error messages appear directly below without a clear visual separation. | Forms feel cramped or uneven; error messages blend with surrounding content. | `LoginPage.jsx` error block uses `px‑4 py‑3` whereas normal inputs use `px‑3.5 py‑2.5`.
| G8 | **Chart legends and tooltips** – Recharts charts on the Dashboard embed custom `TOOLTIP_STYLE` but the legends use small `text‑xs` and colour‑only markers. On a dark background the legend text can be hard to read. | Users cannot quickly interpret chart data, especially on high‑contrast monitors. | Example: `DashboardPage.jsx` `PieChart` legend `iconSize={8}` and `wrapperStyle={{ fontSize: '11px' }}`.
| G9 | **Responsive layout gaps** – several page containers use `grid` with fixed column counts (`grid-cols-1 lg:grid-cols-2`) but lack responsive padding adjustments, causing large empty gutters on medium screens. | The UI looks uneven and wastes screen real‑estate. | Dashboard visualizations `grid grid-cols-1 lg:grid-cols-2 gap-5` leave a big blank area on a 1024 px width screen.
| G10 | **Navigation feedback** – the sidebar (presumed in `AppLayout`) does not highlight the active route, and there is no breadcrumb consistency across pages (some pages use `PageHeader` with a subtitle, others rely on URL). | Users lose context of where they are in the workflow. | `AppRoutes.jsx` defines routes but no `active` prop passed to navigation items.

---

## 2️⃣ Page‑Specific Findings
### 🔐 Login (`pages/auth/LoginPage.jsx`)
1. Dark‑gradient background reduces contrast for the white text block on the left.
2. The “Quick Role Access” card uses low‑opacity background (`bg‑slate‑800/60`) making the small button text hard to read.
3. Missed `autocomplete` attributes for the email field (`autocomplete="email"` present, but not for role cards).
4. No visual focus ring for the demo role buttons – they rely on hover only.
5. The brand badge (`bg‑brand‑500/10`) uses a thin border that blends into the background.

### 📊 Dashboard (`pages/dashboard/index.jsx`)
1. KPI cards use a mix of `text‑sm` for titles and `text‑xl` for values, but the card height varies because of conditional loading skeletons; layout shifts on load.
2. “Pending Trips” and “Vehicles In Maintenance” attention bars stack vertically on mobile, losing the side‑by‑side layout intended for widescreen.
3. Chart titles are omitted – users must infer chart purpose from surrounding text.
4. Colour palette combines bright blues with pastel teals; not aligned with the intended “deep navy / transportation blue”.
5. The filter bar has dense select elements with minimal spacing, causing cramped appearance.

### 🚚 Vehicles (`pages/vehicles/VehiclesPage.jsx`)
1. Table column *Asset / Vehicle* combines registration number and name in a single cell, but the truncation (`block truncate`) hides crucial info on narrow screens.
2. Status badges (`StatusBadge`) use many colours but the contrast for the “RETIRED” grey badge is low on a white background.
3. Action icons are very small (14 px) and have no textual label – discoverability suffers.
4. Pagination bar sits directly under the table without a clear visual separation (same background colour).
5. Empty state shows a plain message without an illustration or CTA.

### 👷‍♀️ Drivers (`pages/drivers/DriversPage.jsx`)
1. Driver avatar initials use a light grey background (`bg‑slate‑100`) that offers low contrast for white text when the driver name is short.
2. Safety score badge mixes background (`bg‑slate‑50`) and coloured star icons – the colour‑only indication (amber vs blue) is not accessible.
3. The “License Number” column shows a long monospaced block that forces the table to be wider than the viewport.
4. Similar to Vehicles, action icons lack text labels.
5. Search bar width is fixed (`w‑full sm:w‑80`), leading to a narrow input on large screens.

### 📅 Trips (`pages/trips/*` – placeholder)
*Only the route exists, but based on existing patterns we can anticipate the same table density issues, missing column sorting, and lack of inline status colour coding.*

### 🛠️ Maintenance, Fuel, Expenses, Reports, User Management, Settings
*These pages are currently thin wrappers around generic list components. Likely they inherit the same table density, colour, and spacing problems observed in Vehicles/Drivers.*

---

## 3️⃣ Prioritised Action List (Top 10 issues to address first)
1. **Establish a design system** – define a typographic scale, colour palette, spacing token, and component variants (buttons, inputs, tables, modals).
2. **Increase colour contrast** – adjust dark‑mode backgrounds and low‑opacity glows to meet WCAG AA.
3. **Add focus indicators** – extend the `Button`, `Link`, and table row components with a visible `focus:ring` style.
4. **Responsive tables** – enable horizontal scrolling (`overflow‑x:auto`) and consider collapsing secondary columns on mobile.
5. **Standardise CTA hierarchy** – make primary actions larger, more prominent, and consistently placed (top‑right of page header).
6. **Unify modal styling** – set a shared `max‑width`, consistent padding, and clear primary/secondary button ordering.
7. **Refine form layouts** – consistent label‑to‑input spacing, error message styling, and accessible `aria‑describedby` links.
8. **Improve chart accessibility** – larger legends, high‑contrast colours, and optional data tables for screen readers.
9. **Navigation feedback** – highlight the active route, add breadcrumbs, and ensure the sidebar collapses gracefully.
10. **Refresh visual identity** – replace the current glowing gradients with subtle transportation‑themed motifs (route line SVGs, map‑grid background) that align with the deep navy palette.

---

## 4️⃣ Next Steps
- Draft the **Design System** (palette, typography, component library) – see the *Transportation Visual Identity* section in the Phase 5 brief.
- Create a **style guide** (`docs/DESIGN_SYSTEM.md`) that documents the new token values.
- Update the shared UI components (`components/common/*`) to use the design system.
- Iterate page‑by‑page redesign using the audit findings as a checklist.

*All findings are captured in this document; the redesign work can now proceed with a clear problem list.*
