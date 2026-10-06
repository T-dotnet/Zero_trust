# UI Design System Specification

## Overview
This document defines the core standards for UI components to ensure visual consistency, maintainability, and accessibility across the application.

## Design Philosophy
*   **Consistency:** All interactive elements and data views must adhere to defined variants.
*   **Maintainability:** Styling is centralized in component definitions, not inline.
*   **Accessibility:** All interactive elements must have clear states (hover, focus, disabled).

## Architecture & Implementation
*   **Unified Components:** All `button`-like interactions MUST use the `<Button />` component from `src/components/ui/Button.tsx` (or standardized button implementations as specified).
*   **Variant-Based Styling:** Use `variant` and `size` props for consistent styling.

## Component Registry

### Buttons
| Style | Intended Variant | Implementation |
| :--- | :--- | :--- |
| **Primary** | `primary` | `<Button variant="primary">...</Button>` |
| **Secondary**| `secondary` | `<Button variant="secondary">...</Button>` |
| **Tinted** | `primary` (+mod) | `<Button variant="primary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">` |
| **Ghost** | `ghost` | `<Button variant="ghost">...</Button>` |
| **Destructive**| `destructive`| `<Button variant="destructive">...</Button>` |
| **Outlined** | `outline` | `<Button variant="outline">...</Button>` |

### Tables
All tables in the application MUST use these standardized components/class strings. 

**Container Structure:**
```tsx
<div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm w-full">
   <table className="w-full text-sm text-left border-collapse">
       {/* content */}
   </table>
</div>
```

**Table Variants:**

**1. Standard Compact (Default for Data Intensive Views)**
*   **Header (`<thead>`):** `<thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium font-mono text-[10px] uppercase tracking-wider">`
*   **Header Cell (`<th>`):** `<th className="px-4 py-3">`
*   **Body Cell (`<td>`):** `<td className="px-4 py-3 text-slate-600">`
*   **Row (`<tr>`):** `<tr className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">`

**2. Standard (Default for Simple Dashboards / Settings)**
*   **Header (`<thead>`):** `<thead className="bg-slate-50 border-b border-slate-200 text-slate-500">`
*   **Header Cell (`<th>`):** `<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">`
*   **Body Cell (`<td>`):** `<td className="px-6 py-4 text-sm text-slate-600">`
*   **Row (`<tr>`):** `<tr className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">`

**3. Nested Expanded Table (For child groups/relationships)**
*   **Container wrapper inside a full-width `td`:** `<div className="ml-8 my-2 overflow-hidden bg-white border border-slate-200 rounded-l-xl border-r-0 rounded-r-none">`
*   **Header (`<thead>`):** `<thead className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">`
*   **Header Cell (`<th>`):** `<th className="px-4 py-3">`
*   **Row (`<tr>`):** `<tr className="hover:bg-white transition-colors cursor-pointer border-l-4 border-transparent hover:border-l-4 hover:border-indigo-500">` (Use accent color borders for status changes on hover).

### Cell Patterns
*   **Cell with Icon & Monospace Text (e.g. Git Branch):** 
    `<div className="flex items-center gap-1.5 text-sm"><GitBranch className="w-4 h-4 text-slate-400" /><span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">feature/branch</span></div>`
*   **Cell with Colored Status Pill:** 
    `<span className="text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-100">Clean</span>`
*   **Cell with Inline Icon (e.g. Check/Cross within status):**
    `<span className="text-[10px] font-bold flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Clean</span>`

### Surfaces & Cards
To maintain depth and grouping across the UI (especially inside Modals and detail panes), apply these specific structural containers:

**1. Base Standard Card (Top-level blocks)**
*   **Classes:** `bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden`
*   **Usage:** Table wrappers, major stat grids, primary layout cards.

**2. Sub-Surface Panel (Nested sections & Forms)**
*   **Classes:** `bg-slate-50 border border-slate-200 rounded-xl p-5`
*   **Usage:** For inline content sections like pipeline descriptions, embedded form blocks, or nested data groups.
*   **Note:** Do not use `border-slate-100` for `bg-slate-50` panels. Keep contrast with `border-slate-200`.
*   **Complex Variation Structure:**
    ```tsx
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="mb-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-100">Version v2.1.0</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">Description text...</p>
      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4">
        {/* Footer actions or links */}
      </div>
    </div>
    ```

**3. Empty State Panel**
*   **Classes:** `bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center`
*   **Usage:** Inside tables or lists when no data is available.

**4. Dashboard Stat Card (Clickable)**
*   **Active (Selected):** `bg-white border-2 border-slate-400 rounded-xl p-5 shadow-md cursor-pointer`
*   **Inactive/Hover:** `bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer`
*   **Semantic Border (Error):** `border-rose-400 shadow-sm ring-1 ring-rose-50`
*   **Support Metrics:** `bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col` (compact version used in support tabs).
*   **Structure:**
    ```tsx
    <div className="bg-white border border-slate-200 rounded-xl p-5 ... cursor-pointer">
      <div className="text-xs font-medium text-slate-500 mb-1 font-bold">Label</div>
      <div className="text-2xl font-semibold text-slate-900 leading-none">Value</div>
      <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Support Text</div>
    </div>
    ```

**5. Task / History Activity Card**
*   **Classes:** `bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full`
*   **Structure:**
    ```tsx
    <div className="bg-white border border-slate-200 rounded-xl p-4 ...">
      <div className="flex justify-between items-start mb-3">
        <h5 className="text-sm font-bold text-slate-900 leading-snug">Description text...</h5>
        <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap ml-4">Timestamp</span>
      </div>
      {/* Optional: Nested Automated Change Log (bg-indigo-50) */}
    </div>
    ```

**6. Global Feedback Banner**
*   **Classes:** `bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-300`
*   **Structure:**
    ```tsx
    <div className="...">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600" />
        <div>
          <p className="text-sm font-bold text-slate-900">Title text</p>
          <p className="text-xs text-slate-500">Subtitle or description...</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Action</button>
        <button className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
      </div>
    </div>
    ```

**7. Code / Artifact Card**
*   **Structure:**
    ```tsx
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
       <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700">Header</div>
       <div className="bg-slate-900 p-4 font-mono text-xs overflow-x-auto text-emerald-400">Content</div>
    </div>
    ```

**8. Modal Messages**
*   **Classes (Guidance/Primary):** `bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3 shadow-sm`
*   **Classes (Success/Final):** `bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex gap-3 shadow-sm`
*   **Classes (Neutral/Info):** `bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3 shadow-sm`
*   **Usage:** Used inside creation modals or wizards to guide users through steps or confirm completion.

**9. Review Timeline Component**
*   **Purpose:** Sequential visualization of multi-stage approval workflows.
*   **Structure:**
    *   **Container:** `bg-white border border-slate-200 rounded-xl p-5`
    *   **Timeline Line:** `absolute left-[11px] w-0.5 bg-slate-100` (within a relative container).
    *   **Node Points:** `w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10`.
    *   **Node Variants:**
        *   `Complete`: `bg-indigo-600 text-white` with `CheckCircle2` icon.
        *   `Active (Reviewer)`: `bg-indigo-600 text-white` with pulsed dot.
        *   `Active (Author Action)`: `bg-indigo-600 text-white` with pulsed dot + Amber Action Badge.
        *   `Rejected`: `bg-rose-500 text-white` with `X` icon + Rose Error Badge.
        *   `Upcoming`: `bg-slate-100 text-slate-400`.
    *   **Action Badges:** `text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-1.5 border`.
        *   Reviewer: `bg-blue-50 text-blue-700 border-blue-200`.
        *   Author: `bg-amber-50 text-amber-700 border-amber-200`.
        *   Rejected: `bg-rose-50 text-rose-600 border-rose-100`.

**10. Incident Report Panel**
*   **Purpose:** High-visibility error reporting and resolution tracking within detail modals.
*   **Structure:**
    *   **Main Container:** `p-5 rounded-xl border bg-red-50 border-red-100` (Red semantic tint).
    *   **Resolution Buttons (Nested):** `w-full p-3 rounded-lg flex flex-col gap-3 transition-all text-left`.
        *   **Bug Fix Node:** `bg-indigo-50/50 border border-indigo-100`.
        *   **Support Node:** `bg-slate-100/50 border border-slate-200`.
    *   **Labels:** Use `text-[10px] font-bold uppercase tracking-wider` for "Bug Fix Submitted" or "Support Ticket".
    *   **Badges:** High-density status capsules using `text-[9px] font-bold px-1.5 py-0.5 rounded`.

### Git Health Component
Used to represent the merge status and source integrity of a pipeline branch relative to the main repository. Exact reproductions are found in the Pipeline Details modal.

**Standard Pattern Combinations:**
*   **Ready to Merge (`Clean`):** `CheckCircle2` (Emerald-600) + `text-emerald-700` label.
*   **Out of Sync (`Behind`):** `AlertCircle` (Amber-600) + `text-amber-700` label + Amber Info Banner.
*   **Merge Conflict (`Conflict`):** `AlertCircle` (Rose-600) + `text-rose-700` label + Rose `ShieldAlert` Banner.
*   **Ahead of Main (`Ahead`):** `UploadCloud` (Blue-600) + `text-blue-700` label + Blue Info Banner.
*   **Initialising / Syncing (`Syncing`):** `RefreshCw` (Indigo-600, animate-spin) + `text-indigo-700` label.
*   **Repo Unreachable (`Disconnected`):** `AlertTriangle` (Slate-600) + `text-slate-700` label + Slate Warning Banner.

**Visual Container Properties:**
*   **Header:** Flex row with `text-[10px]` uppercase label and `text-sm` font-bold status title.
*   **Buttons:** `text-[11px]` font-bold indigo buttons for "Sync Now", "View Conflicts", or "View Diff".
*   **Tags:** `bg-slate-50` font-mono rounded-md tags for the Branch reference.
*   **Alert Banners:** High-density `bg-[color]-50` blocks with `text-[11px]` leading-relaxed descriptions.

### Forms & Inputs
Consistent form layouts minimize user effort and prevent errors during data entry. All inputs must have associated labels and clear focus states.

**1. Standard Text Input**
*   **Container:** `space-y-1.5`
*   **Label:** `<label className="block text-sm font-bold text-slate-900 mb-1">`
*   **Input:** `<input className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm bg-white" />`
*   **Error State:** `border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/50`

**2. Select Dropdown**
*   **Container:** `relative`
*   **Select:** `<select className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-xl appearance-none bg-white text-sm outline-none cursor-pointer font-medium text-slate-700">`
*   **Icon (Chevron Down):** `absolute right-4 top-3.5 pointer-events-none text-slate-400`

**3. Selection Controls (Checkboxes & Radios)**
*   **Card-style Selector (Preferred for detailed choices):**
    ```tsx
    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
      <input type="checkbox" className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5" />
      <div>
        <div className="font-semibold text-sm text-slate-900">Name</div>
        <div className="text-[10px] text-slate-500 font-medium">Description or metadata...</div>
      </div>
    </label>
    ```

**4. Complex Item Selector (Grid/List with Meta)**
*   **Purpose:** Used for selecting from lists of datasets or resources (e.g., Run Pipeline modal).
*   **Structure:**
    *   **Row:** `flex items-start gap-3 p-3 border border-slate-200 rounded-lg`
    *   **Left:** Checkbox input (`mt-1` ignored if using `items-start` + `mt-0.5` internally). Default to `emerald-600` theme.
    *   **Middle:** Vertical stack with `text-sm font-medium` title and `text-xs text-slate-500` truncated metadata.
    *   **Processed State:** `bg-slate-50 opacity-75 cursor-not-allowed` for the row. Include a nested `bg-white p-2 rounded border border-slate-200` info panel with `text-indigo-600 font-bold` action link ("View Artifact").
    *   **Right:** Semantic status badge: `bg-[color]-100 text-[color]-800 px-2 py-0.5 rounded text-[10px] font-medium`.

**5. Toggle Switch**
*   **Outer:** `flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg`
*   **Switch Track:** `w-9 h-5 rounded-full p-1 transition-colors [bg-emerald-600 | bg-slate-300]`
*   **Switch Handle:** `w-3 h-3 bg-white rounded-full transition-transform [translate-x-4 | translate-x-0]`

### Lists
Lists must follow structured semantic styling rather than arbitrary div stacks.

**1. Standard Bulleted (`<ul>`)**
*   **Wrapping `<ul>`:** `<ul className="list-disc list-inside text-sm text-slate-600 space-y-2">`
*   **Item (`<li>`):** Standard un-styled or `className="font-medium"` for labels.

**2. Grid Feature Lists (Settings/Feature toggles)**
*   **Wrapping `<ul/div>`:** `<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">`
*   **Item (`<li>`):** Use flexbox `<li className="flex items-start gap-3">`
*   **Icon wrapper:** `<div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">`

**3. Metadata Grid List**
*   **Purpose:** The primary pattern for displaying key-value pair metadata compactly inside cards, side panels, or detail modals.
*   **Container:** Wrap in a standard card or sub-surface. For complex modals, use a header with `bg-slate-50 border-b border-slate-200 px-6 py-4`.
*   **Grid Structure:** Use `grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6` to ensure optimal readability even at high density.
*   **Separator:** Use `<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 mt-6 border-t border-slate-100">` to differentiate logical clusters.
*   **Label:** `<label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">`
*   **Value:** Prefer `text-xs font-bold text-slate-900` for primary data. Use semantic status pills or monospace capsules (`bg-slate-100 border-slate-200 px-2 py-0.5 rounded font-mono`) for technical IDs.

### Spacing & Layout
*   **Grid Feature Lists:** Ensure `gap-4` between items and `mt-0.5` on icons to align with text baseline.
*   **Metadata Grid:** Use `gap-y-6` between rows and `gap-x-8` between columns.
*   **Card Gutters:** Minimum `p-4` for small cards, `p-6` for primary dashboard surfaces.

### Navigation & Wayfinding
Patterns for orientation and state management across application layers.

**1. Primary Page Tabs (Underlined)**
*   **Container:** `<div className="flex border-b border-slate-200">`
*   **Item:** `px-6 py-4 text-sm font-bold relative flex items-center gap-2 transition-colors`
*   **Active State:** `text-indigo-600` + `<div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-indigo-600" />`
*   **Inactive State:** `text-slate-500 hover:text-slate-700`

**2. Application Pill Tabs (Global Level)**
*   **Container:** `<div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200/50">`
*   **Active Item:** `bg-white text-slate-900 shadow-sm border border-slate-200 px-6 py-2 rounded-full text-xs font-bold`
*   **Inactive Item:** `text-slate-500 hover:text-slate-700 px-6 py-2 rounded-full text-xs font-bold`

**3. Sidebar Core Nodes**
*   **Item:** `<button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all">`
*   **Icon Container:** `w-8 h-8 rounded-lg flex items-center justify-center shrink-0` (Active: `bg-indigo-50 text-indigo-600`, Inactive: `bg-slate-100 text-slate-400`)

**4. Breadcrumbs**
*   **Container:** `<nav className="flex items-center gap-2 text-sm font-medium text-slate-500">`
*   **Separator:** `<ChevronRight className="w-4 h-4 text-slate-300" />`
*   **Active Leaf:** `text-slate-900 font-bold` (optionally with `bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs`)

## Agreement
This design system is our source of truth. By confirming, I will begin the systematic refactoring of `src/App.tsx` buttons and tables to match these standardized component patterns.
