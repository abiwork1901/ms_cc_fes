# Credit Card Application Frontend

A React-based frontend application for credit card processing, built with TypeScript and modern React practices.

## Tech Stack

- React 18.2.0
- TypeScript 4.9.5
- React Testing Library
- Web Vitals for performance monitoring

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```
   This will run the app in development mode at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start`: Runs the development server
- `npm test`: Runs the test suite with Jest
- `npm run build`: Creates a production build
- `npm run eject`: Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── src/             # Source files
├── public/          # Static files
├── build/           # Production build (generated)
├── node_modules/    # Dependencies
└── package.json     # Project configuration
```

## Testing

Tests are written using Jest and React Testing Library. Run tests with:
```bash
npm test
```

## Production Build

Create a production-ready build:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Environment Variables

Create a `.env` file in the project root for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Browser Support

The application supports:
- Production: Modern browsers (>0.2% market share)
- Development: Latest versions of Chrome, Firefox, and Safari
