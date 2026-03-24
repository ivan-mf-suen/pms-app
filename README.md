# Property Management System (PMS) - Prototype

A modern Property Management System built with React and Next.js, featuring a comprehensive dashboard and management tools for properties, tenants, maintenance requests, and financial tracking.

## Features

✨ **Dashboard** - Overview of key metrics and recent activities
🏠 **Properties Management** - View and manage all properties with detailed information
👥 **Tenant Management** - Track all tenants and lease information  
🔧 **Maintenance Tracking** - Monitor maintenance requests and work orders
💰 **Payment Tracking** - Track rental payments and payment history
📊 **Financial Overview** - Portfolio value, monthly rent, and equity tracking

## Tech Stack

- **Framework**: Next.js 16.2.0 (React 19.2.4)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Development**: Turbopack for fast builds

## Quick Start

### Installation

Navigate to the project directory and install dependencies:

```bash
npm install
```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                              # Next.js app router
│   ├── layout.tsx                   # Root layout with navigation  
│   ├── page.tsx                     # Dashboard (home page)
│   ├── properties/
│   │   ├── page.tsx                # Properties listing
│   │   └── [id]/page.tsx           # Property details
│   ├── tenants/page.tsx            # Tenants management
│   ├── maintenance/page.tsx        # Maintenance requests
│   ├── payments/page.tsx           # Payment tracking
│   └── globals.css                 # Global styles
├── components/                       # Reusable React components
│   ├── Navbar.tsx                  # Navigation header
│   ├── StatCard.tsx                # Statistics card component
│   ├── PropertyCard.tsx            # Property listing card
│   ├── MaintenanceList.tsx         # Maintenance requests list
│   └── RecentPayments.tsx          # Recent payments widget
└── lib/
    └── mockData.ts                 # Demo data and interfaces
```

## Pages

### Dashboard (/)
- Key metrics overview
- Recent properties and payments
- Active maintenance issues
- Quick navigation to other sections

### Properties (/properties)
- List all properties with filtering options
- View detailed property information
- Display property images and financial data
- Track occupancy status

### Property Details (/properties/[id])
- Full property details and images
- Current tenant information
- Maintenance history
- Financial summary with ROI

### Tenants (/tenants)
- All tenants in table format
- Lease information
- Contact details
- Status tracking

### Maintenance (/maintenance)
- All maintenance requests with filtering
- Priority and status tracking
- Cost estimation and actuals
- Request descriptions and dates

### Payments (/payments)
- Payment history and tracking
- Payment status filtering
- Summary statistics
- Tenant and property mapping

## Demo Data

The application includes sample data for:
- 5 Properties (apartments, houses, duplex, commercial)
- 4 Active Tenants with lease details
- 5 Maintenance Requests at various priorities
- 5 Rental Payments with different statuses

Edit `src/lib/mockData.ts` to modify demo data.

## Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - ESLint linter

## Technology Details

- **Next.js**: React framework with file-based routing
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript
- **Turbopack**: Next-gen bundler for fast builds

## Customization

### Adding Properties
Edit the `mockProperties` array in `src/lib/mockData.ts`

### Adding Tenants
Edit the `mockTenants` array in `src/lib/mockData.ts`

### Styling
All styles use Tailwind utility classes. Modify in component files directly.

### New Pages
Create new folders under `src/app/` and add `page.tsx` files.

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication & authorization
- Real image uploads
- Document management
- Email notifications
- Mobile app
- Advanced reporting and analytics
- API integration points

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Notes

This is a prototype/demo application built for demonstration purposes. It uses mock data and does not include a database or backend API. The frontend shows the structure and UX for a full Property Management System.

For production deployment, implement:
- Secure database
- API authentication
- User management
- Error handling
- Input validation
- Security best practices

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)

---

**Created**: March 2026
**Status**: Prototype/Demo
**Version**: 0.1.0

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
