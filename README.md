# Farmasi Web Simulation

Angular 17 application that simulates **Farmasi MLM (Multi-Level Marketing)** bonus calculations. It models team hierarchies, calculates group volumes, and computes various bonus types based on Farmasi's official compensation plan.

## Features

- 📊 **Organization Chart** - Visual tree hierarchy of your team
- 💰 **Bonus Calculator** - Accurate monthly bonus projections
- 📁 **CSV Import** - Import team data from Farmasi exports
- 💾 **Simulations** - Save and compare different scenarios
- 🎯 **Title Tracking** - Track progress toward next title

---

## Bonus Calculations

### 1. Personal Bonus
Earned on your own purchases.

```
Personal Bonus = Personal Volume (PV) × Bonus Level %
```

### 2. Group Bonus
Earned on the volume difference between you and your direct frontline.

```
Group Bonus = Σ (Child GV × (Your Bonus% - Child Bonus%))
```

### 3. Leadership Bonus
Earned when you reach **Manager/Director** level (GV ≥ 5,000 and SP ≥ 1,500).

The Leadership Bonus is calculated using **Leadership Group Volume (LGV)**, which is the total GV from FIs at **18%, 22%, and 25%** bonus levels combined.

**Formula (Differential):**
```
Generation N Bonus = (LGV_GenN - LGV_GenN+1) × Percentage%
```

**Leadership Percentages by Title:**

| Title | Gen 1 | Gen 2 | Gen 3 | Gen 4 | Gen 5 | Gen 6 | Gen 7 |
|-------|-------|-------|-------|-------|-------|-------|-------|
| Manager/Director | 4.00% | 3.00% | 2.00% | 1.50% | 0% | 0% | 0% |
| Bronze | 4.50% | 3.25% | 2.25% | 1.75% | 0% | 0% | 0% |
| Golden | 5.00% | 3.50% | 2.50% | 2.00% | 0% | 0% | 0% |
| Platinum | 5.50% | 4.00% | 2.75% | 2.20% | 0% | 0% | 0% |
| Emerald | 6.00% | 4.50% | 3.00% | 2.50% | 0% | 0% | 0% |
| Diamond | 6.50% | 5.00% | 3.25% | 2.75% | 1.50% | 0% | 0% |
| Vice President | 7.00% | 5.50% | 3.50% | 3.00% | 1.75% | 0% | 0% |
| President | 7.50% | 6.00% | 3.75% | 3.25% | 2.00% | 0.75% | 0% |
| Boss | 8.00% | 6.50% | 4.00% | 3.50% | 2.25% | 1.00% | 0% |
| Executive Boss | 8.50% | 7.00% | 4.25% | 3.75% | 2.50% | 1.25% | 0.50% |

### 4. Car Bonus
Monthly allowance for qualifying titles.

| Title | Monthly Bonus |
|-------|---------------|
| Golden Director | $350 |
| Platinum Director | $400 |
| Emerald Director | $450 |
| Diamond Director | $500 |
| Vice President | $550 |
| President | $600 |
| Boss Director | $650 |
| Executive Boss | $700 |

### 5. Building Bonus
Earned for sponsoring new active Beauty Influencers.

```
Building Bonus = Floor(New Active BIs ÷ 3) × $60
```
- New Active BI: Joined within the last month with PV ≥ 75

---

## Title Qualifications

| Title | GV | Side Points | Legs (25%) | Title Points |
|-------|-----|-------------|------------|-------------|
| Virtual Manager | 5,000 | - | - | - |
| Director | 5,000 | 1,500 | - | - |
| Bronze Director | 5,000 | 1,500 | 1 | - |
| Golden Director | 10,000 | 2,500 | 2 | - |
| Platinum Director | 20,000 | 2,500 | 4 | - |
| Emerald Director | 40,000 | 5,000 | 8 | - |
| Diamond Director | 60,000 | 5,000 | 12 | 15 |
| Vice President | 80,000 | 10,000 | 16 | 30 |
| President | 100,000 | 10,000 | 20 | 60 |
| Boss Director | 150,000 | 10,000 | 30 | 120 |
| Executive Boss | 200,000 | 10,000 | 30 | 240 |

### Key Definitions

- **Group Volume (GV)**: Sum of PV from you and your entire downline
- **Side Points (SP)**: Your GV minus the GV of all 25% FIs and minus the highest GV FI from 22%/18% levels
- **Legs**: Number of frontline FIs at 25% bonus level
- **Title Points**: Points earned from frontline titles (see Title Points table)

### Title Points from Frontline

| Title | Points |
|-------|--------|
| Virtual Manager | 0.25 |
| Manager/Director | 1 |
| Bronze | 1.5 |
| Golden | 2.5 |
| Platinum | 4 |
| Emerald | 8 |
| Diamond | 12 |
| Vice President | 20 |
| President | 35 |
| Boss | 60 |
| Executive Boss | 100 |

---

## Development

### Prerequisites
- Node.js 18+
- Angular CLI 17+

### Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:4200)
npm start

# Production build
npm run build:prod

# Run tests with coverage
npm run test:prod
```

### Project Structure

```
src/app/
├── components/          # UI Components
│   ├── home/           # Dashboard
│   ├── organization-chart/  # Team tree visualization
│   ├── monthly-bonuses/     # Bonus display
│   ├── settings/       # User settings
│   ├── simulations/    # Saved scenarios
│   └── csv-import/     # CSV import dialog
├── constants/          # Business rules
│   ├── bonus-level-range.constant.ts
│   └── farmasi.constant.ts
├── enums/
│   └── title.enum.ts   # Title definitions
├── models/             # TypeScript interfaces
├── services/           # Data services (localStorage)
└── utils/              # Calculation logic
    ├── bonus-calculator.util.ts  # All bonus formulas
    └── team-member.util.ts       # GV, SP, Title calculations
```

### Tech Stack

- **Angular 17** - Framework
- **PrimeNG** - UI Components
- **PrimeFlex** - CSS Utilities
- **localStorage** - Data persistence

---

## CSV Import

Import your team data from Farmasi exports. Required columns:

- `Consultant No` - Unique identifier
- `First Name` / `Last Name` - Name
- `Personal Points This Month` - PV
- `Sponsor Code` - Parent reference
- `Generation` - Hierarchy level (0 = root)

The import automatically detects the root FI (Generation = 0 or missing sponsor).

---

## License

This project is for educational and simulation purposes only. Not affiliated with Farmasi.
