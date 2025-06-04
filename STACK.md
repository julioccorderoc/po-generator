
# Technology Stack Documentation

## Core Technologies

### React 18.3.1
**Purpose**: Frontend framework for building the user interface
**Usage**: Component-based architecture for building the multi-step order form wizard
**Why**: Industry standard for building interactive UIs with excellent TypeScript support

### TypeScript
**Purpose**: Type safety and better developer experience
**Usage**: Throughout the entire codebase for type checking and IntelliSense
**Why**: Reduces bugs, improves maintainability, and provides better IDE support

### Vite
**Purpose**: Build tool and development server
**Usage**: Fast development server with hot reload and optimized production builds
**Why**: Much faster than traditional bundlers like Webpack, excellent TypeScript support

### Tailwind CSS
**Purpose**: Utility-first CSS framework for styling
**Usage**: All component styling throughout the application
**Why**: Rapid development, consistent design system, excellent responsive design support

## UI Component Library

### Shadcn/UI with Radix UI
**Purpose**: Pre-built accessible UI components
**Usage**: Forms, dialogs, buttons, cards, and other UI elements
**Why**: High-quality, accessible components that save development time

### Lucide React
**Purpose**: Icon library
**Usage**: Icons throughout the interface (arrows, checkmarks, etc.)
**Why**: Lightweight, consistent icon set with React components

## Data Management & Validation

### Zod
**Purpose**: TypeScript-first schema validation library
**Usage**: Validating form data before submission, ensuring data integrity
**Why**: Type-safe validation, excellent TypeScript integration, runtime safety

### JSON Files for Data Storage
**Purpose**: Simulate database for static data
**Usage**: 
- Product catalogs (`manufacturer_products.json`)
- Lookup data (manufacturers, ship-to locations, etc.)
- Other items per manufacturer (`other_items.json`)
- Purchase order storage (`pos.json`)
**Why**: Simple file-based storage for prototyping, easily replaceable with real database

## Form Management

### React Hook Form
**Purpose**: Form state management and validation
**Usage**: Managing form state across multiple steps, field validation
**Why**: Excellent performance, minimal re-renders, great TypeScript support

## Routing

### React Router DOM
**Purpose**: Client-side routing
**Usage**: Navigation between different pages/views
**Why**: Standard routing solution for React applications

## Development Tools

### ESLint
**Purpose**: Code linting and style enforcement
**Usage**: Maintaining code quality and consistency
**Why**: Catches potential bugs and enforces coding standards

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── steps/           # Form wizard step components
│   └── ui/              # Shadcn/UI components
├── data/                # JSON data files (simulating database)
├── schemas/             # Zod validation schemas
├── utils/               # Utility functions (formatters, transformers)
├── config/              # Configuration files
└── hooks/               # Custom React hooks
```

## Data Flow

1. **Form Data Collection**: React Hook Form manages form state across steps
2. **Validation**: Zod schemas validate data before submission
3. **Transformation**: Utility functions transform form data to API format
4. **Storage**: JSON files simulate database storage for POs
5. **Display**: Formatted data displayed using utility formatters

## Key Features Implemented

- **Multi-step Form Wizard**: Progressive form completion with validation
- **Dynamic Product Loading**: Manufacturer-specific products and pricing
- **Real-time Calculations**: Live totals and subtotals
- **Email Validation**: Email modal with validation before submission
- **PO Generation**: Automatic purchase order number generation
- **Data Persistence**: Saving completed purchase orders
- **Responsive Design**: Mobile-friendly interface using Tailwind
- **Type Safety**: Full TypeScript coverage with Zod validation

## Future Considerations

- Replace JSON files with a real database (PostgreSQL, MongoDB)
- Add authentication and user management
- Implement real email sending functionality
- Add file upload capabilities for attachments
- Implement search and filtering for products
- Add audit logging for form submissions
