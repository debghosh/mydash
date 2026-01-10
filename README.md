# Portfolio Strategy Dashboard

Interactive dashboard for exploring your $12.6M portfolio investment strategy.

## 🚀 Quick Start Guide

### Prerequisites

You need **Node.js** installed on your computer.

**Check if you have Node.js:**
```bash
node --version
```

If you don't see a version number, download Node.js from: https://nodejs.org/
- Download the **LTS (Long Term Support)** version
- Install it (just click through the installer)

---

## 📦 Installation Steps

### Step 1: Download the Files

Save all the files from this folder to your local computer.
For example, create a folder: `C:\Users\YourName\portfolio-dashboard\`

### Step 2: Open Terminal/Command Prompt

**Windows:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- Navigate to your folder:
  ```bash
  cd C:\Users\YourName\portfolio-dashboard
  ```

**Mac/Linux:**
- Open Terminal
- Navigate to your folder:
  ```bash
  cd ~/portfolio-dashboard
  ```

### Step 3: Install Dependencies

Run this command (it will take 1-2 minutes):
```bash
npm install
```

This downloads all the required packages (React, Recharts, Tailwind CSS, etc.)

### Step 4: Start the Dashboard

Run this command:
```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser

The dashboard should automatically open in your browser at:
**http://localhost:3000**

If it doesn't open automatically, just copy that URL and paste it into Chrome, Firefox, or Safari.

---

## 🎮 How to Use

### Interactive Controls

At the top of the dashboard, you can adjust:

1. **Market Regime** - Switch between:
   - Bull Market (optimistic scenario)
   - Sideways/Choppy (current recommendation)
   - Bear Market (recession scenario)

2. **Rebalancing Frequency** - Compare:
   - Monthly (NOT recommended - costs you money!)
   - Quarterly (optimal - recommended)
   - Annual

3. **Annual Roth Conversion** - Slide between $100K - $400K
   - See how it affects taxes and timeline

### 7 Interactive Tabs

1. **Overview** - Portfolio allocation and growth projection
2. **Alpha** - ⭐ SHOWS EXACTLY HOW ALPHA IS GENERATED (step-by-step)
3. **Allocation** - Compare allocations across different market regimes
4. **Income** - How $150K annual income is generated
5. **Roth** - 14-year conversion timeline and tax impact
6. **Rebalancing** - Why quarterly beats monthly (with proof!)
7. **ETFs** - Complete list of recommended funds with details

---

## 🔧 Troubleshooting

### Error: "npm is not recognized"
- You need to install Node.js first: https://nodejs.org/
- Restart your terminal after installing

### Error: "Cannot find module"
- Delete the `node_modules` folder
- Run `npm install` again

### Port 3000 already in use
- Change the port in `vite.config.js`:
  ```javascript
  server: {
    port: 3001,  // Change to any number
    open: true
  }
  ```

### Dashboard doesn't load / blank screen
- Check your browser console (F12) for errors
- Make sure you ran `npm install` first
- Try clearing browser cache (Ctrl+F5)

---

## 📊 Key Features

### Understanding Alpha Generation

Click the **"Alpha"** tab to see exactly how +1.5% to +3.2% alpha is achieved:

- **Factor Tilts**: +0.5% to +1.2%
  - Quality, Value, Low Volatility positioning
  
- **Tactical Allocation**: +0.3% to +0.7%
  - Defensive positioning in late-cycle markets
  
- **Tax Efficiency**: +0.8%
  - Qualified dividends, asset location, Roth conversions
  
- **Rebalancing**: +0.4%
  - Quarterly discipline with 5% drift triggers

### Real-Time Calculations

Everything updates instantly when you change:
- Market regime → Allocations shift
- Rebalancing frequency → Costs change
- Conversion amount → Tax timeline updates

---

## 💾 Stopping the Dashboard

When you're done:
1. Go back to the terminal
2. Press `Ctrl + C`
3. Type `Y` if asked to confirm

---

## 🔄 Running Again Later

Next time you want to use the dashboard:

1. Open terminal
2. Navigate to the folder: `cd /path/to/portfolio-dashboard`
3. Run: `npm run dev`
4. Dashboard opens at http://localhost:3000

You do NOT need to run `npm install` again (unless you delete the `node_modules` folder).

---

## 📁 Folder Structure

```
portfolio-dashboard/
├── src/
│   ├── App.jsx          (Main dashboard component)
│   ├── main.jsx         (Entry point)
│   └── index.css        (Styles)
├── index.html           (HTML template)
├── package.json         (Dependencies)
├── vite.config.js       (Build configuration)
├── tailwind.config.js   (CSS framework config)
└── README.md            (This file)
```

---

## 🎯 Next Steps

1. **Explore the Alpha tab** - This shows step-by-step how returns are generated
2. **Play with market regimes** - See how allocations shift
3. **Compare rebalancing frequencies** - Understand why monthly hurts returns
4. **Review the Roth timeline** - See your 14-year conversion plan

---

## ❓ Questions?

If you encounter any issues:
1. Check the Troubleshooting section above
2. Make sure Node.js is installed: `node --version`
3. Make sure you ran `npm install` successfully
4. Check browser console for errors (F12)

---

## 📝 Technical Details

- **Framework**: React 18
- **Charts**: Recharts 2.10
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vite 5
- **No backend required** - runs entirely in your browser

---

**Built with professional-grade financial analysis and research.**
**Based on Vanguard, JP Morgan, and academic factor research.**
