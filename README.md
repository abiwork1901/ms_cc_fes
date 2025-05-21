# Credit Card System Frontend

A React-based frontend application for managing credit cards. This single-page application allows users to add new credit cards and view existing ones.

## Features

- Add new credit cards with validation
- View list of existing credit cards
- Real-time form validation
- Responsive design
- Secure card number masking

## Tech Stack

- React 18.2.0
- TypeScript 4.9.5
- React Testing Library
- Web Vitals for performance monitoring
- Nginx (for production deployment)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Docker (optional, for containerized deployment)

## Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the project root:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   ```

3. Start development server:
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start`: Runs the development server
- `npm test`: Runs the test suite
- `npm run build`: Creates a production build

## Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t credit-card-frontend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -e REACT_APP_API_URL=http://your-api-url credit-card-frontend
   ```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── App.tsx           # Main application component
├── App.css           # Main styles
├── App.test.tsx      # Component tests
├── index.tsx         # Application entry point
└── setupTests.ts     # Test configuration
```

## Testing

Run the test suite:
```bash
npm test
```

For coverage report:
```bash
npm test -- --coverage
```

## Production Build

Create a production-ready build:
```bash
npm run build
```

The optimized build will be in the `build/` directory.

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (required)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The application uses environment variables for configuration. Make sure to set them properly in production.
- The Nginx configuration in the Docker setup includes support for client-side routing.
- All form inputs include validation with user feedback.
- The card number is automatically masked in the display for security.
