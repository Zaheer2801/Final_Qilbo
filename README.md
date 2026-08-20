# Qilbo - Inventory Intelligence for Your POS

![Qilbo](https://github.com/Zaheer2801/Qilbo.com/blob/main/qilbo-app/public/favicon.svg)

**Stock it right. Qilbo does the counting.**

A powerful, modern inventory management system built with React, Vite, and Tailwind CSS. Qilbo integrates seamlessly with your existing POS and transforms sales data into actionable intelligence.

## 🌟 Features

### 📊 Smart Dashboard
- **Overview** - Real-time inventory metrics and insights
- **Inventory Management** - Track products with CSV/photo import
- **Procurement** - Streamline reorder timing and supplier management
- **Pricing Intelligence** - Dynamic pricing with margin guardrails
- **Expiry Tracking** - Monitor product expiration dates
- **Smart Alerts** - Get notified before stock runs out or products expire

### 🎯 Core Capabilities
- ✅ **Inventory Auditing** - Quantity tracking with detailed audit logs
- ✅ **Image Enrichment** - AI-powered product photo enhancement
- ✅ **CSV Import** - Bulk product data import
- ✅ **Margin Management** - Category-aware profit margin policies
- ✅ **Tax Integration** - Automatic tax calculations for liquor, tobacco, grocery, retail
- ✅ **Local Storage** - All data persists locally in your browser
- ✅ **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Zaheer2801/Qilbo.com.git
cd Qilbo.com/qilbo-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

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
