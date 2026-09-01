# Qilbo - Inventory Intelligence for Your POS

**Stock it right. Qilbo does the counting.**

A powerful, modern retail landing page and Smart POS application built with React, Vite, GSAP, and Tailwind CSS. Qilbo integrates seamlessly with existing retail POS systems and transforms sales data into actionable inventory intelligence.

Repository: [https://github.com/Zaheer2801/Final_Qilbo.git](https://github.com/Zaheer2801/Final_Qilbo.git)

---

## 🌟 Projects in this Repository

### 1. 🚀 Landing Page (`landing/`)
- **Theme**: Warm cream `#FAF6EF` canvas, `#171310` ink typography, `#92400E` amber accents.
- **GSAP ScrollTrigger Animations**: Pinned scrub crossfades, feature swapper, circle scaling, and Venn diagram merging.
- **Visual Media & Shaders**: Ambient motion particles background, retail POS photography, and threeui `QILBO` particle wordmark canvas with a continuous sequential glowing border.
- **ROI Calculator & Store Showcase**: Interactive ROI & expiry waste calculator sliders and retail industry category tab switcher.

### 2. 🛒 Smart POS App (`qilbo-smart-pos/` & `qilbo-app/`)
- **Point of Sale & Inventory**: Real-time sales transactions, barcode scanning, CSV pricebook import, margin guardrails, and audit logging.

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Zaheer2801/Final_Qilbo.git
cd Final_Qilbo

# Start Landing Page
cd landing
npm install
npm run dev
```

The landing page will be available at `http://localhost:5173/`

### Build for Production & Hosting

```bash
# Build Landing Page
cd landing
npm run build
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Project Structure

```
qilbo-app/
├── src/
│   ├── components/
│   │   ├── landing/           # Green landing page UI
│   │   ├── dashboard/         # Dashboard tabs (Inventory, Pricing, etc)
│   │   ├── Nav.tsx            # Navigation header
│   │   ├── Hero.tsx           # Hero section
│   │   ├── Onboarding.tsx     # Initial setup flow
│   │   └── ui.tsx             # Shared UI components
│   ├── lib/
│   │   ├── state.ts           # App state management
│   │   ├── storage.ts         # Local storage persistence
│   │   ├── businessLogic.ts   # Core inventory logic
│   │   ├── csv.ts             # CSV parsing
│   │   └── imageEnrichment.ts # AI image processing
│   ├── data/
│   │   └── content.ts         # Landing page content
│   ├── App.tsx                # Main app with routing
│   └── main.tsx               # Entry point
├── public/                    # Static assets
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS config
└── package.json               # Dependencies
```

## 🎨 Design System

**Colors:**
- Landing page: Green theme (#1a7a5a primary)
- Dashboard: Stone/amber theme (brown/tan color scheme)
- Interactive: Amber/brown accent colors

**Components:**
- Built with Radix UI primitives
- Tailwind CSS for styling
- Responsive mobile-first design

## 🔄 User Flow

1. **Landing Page** - Discover Qilbo features
2. **Get Started** - Click CTA to begin
3. **Onboarding** - Setup business info & margin policies
4. **Dashboard** - Access full inventory management suite

## 💾 Data Persistence

All data is stored locally in your browser using `localStorage`:
- Business configuration
- Product inventory
- Pricing policies
- Margin settings
- Audit logs

No data is sent to external servers (local-first architecture).

## 🛠 Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 6+
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Animation**: Framer Motion, GSAP
- **Date Handling**: date-fns
- **TypeScript**: Full type safety

## 📦 Key Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hook-form": "^7.54.2",
  "recharts": "^2.15.4",
  "framer-motion": "^11.16.4",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.475.0"
}
```

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 Features in Detail

### Inventory Tab
- View all products with SKU, name, brand, quantity
- Import products via CSV
- Add product photos (with AI enhancement)
- Edit quantities and details
- Track stock levels
- View audit logs of all changes

### Procurement Tab
- Reorder suggestions based on sales velocity
- Supplier management
- Bulk order creation
- Cost tracking

### Pricing Tab
- Set dynamic pricing rules
- Margin-aware pricing
- Category-based policies
- Bulk price updates

### Expiry Tab
- Monitor product expiration dates
- Expiry alerts
- Date tracking per batch
- Batch management

### Alerts Tab
- Stock-out warnings
- Low inventory alerts
- Expiry date warnings
- Custom alert rules

### Settings Tab
- Business configuration
- Owner information
- Margin policies
- Data import/export

## 🔐 Privacy & Security

- ✅ All data stored locally (no cloud sync)
- ✅ No authentication required for local use
- ✅ No external API calls for data
- ✅ No tracking or analytics
- ✅ Data remains on your device

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite will automatically use the next available port.

### Clearing Data
To reset all data:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete the `qilbo` entries
4. Refresh the page

### Import Issues
- Ensure CSV format matches expected columns
- Use UTF-8 encoding for CSV files
- Check for duplicate SKUs

## 📧 Support

For issues or feature requests:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## 📄 License

This project is part of the Qilbo.com initiative.

## 🙏 Credits

Built with modern web technologies and a focus on:
- User experience
- Data privacy
- Performance
- Accessibility

---

**Last Updated:** August 2026

**Version:** 1.0.0

**Status:** Active Development ✨
