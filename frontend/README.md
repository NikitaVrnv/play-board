# Games Review Board Frontend

The modern web frontend for the Games Review Board application, built with React and Tailwind CSS.

## Features

- Modern, responsive design
- Server-side rendering
- Client-side routing
- Form validation
- Real-time updates
- Infinite scrolling
- Search with filters
- Dark/light mode
- Accessibility support
- Internationalization
- Progressive Web App
- Performance optimized

## Tech Stack

- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Zustand for state management
- React Hook Form
- Zod for validation
- Framer Motion
- React Testing Library
- Cypress for E2E testing
- Storybook

## Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   │   ├── common/    # Shared components
│   │   ├── forms/     # Form components
│   │   ├── layout/    # Layout components
│   │   └── ui/        # UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── services/      # API services
│   ├── store/         # State management
│   ├── styles/        # Global styles
│   └── types/         # TypeScript types
├── public/            # Static files
├── stories/           # Storybook stories
└── tests/             # Test files
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env.local
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook

## Testing

### Unit Tests

Run unit tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

### E2E Tests

Run Cypress tests:
```bash
npm run test:e2e
```

Open Cypress UI:
```bash
npm run cypress:open
```

## Storybook

Start Storybook development server:
```bash
npm run storybook
```

Build static Storybook:
```bash
npm run build-storybook
```

## State Management

The application uses Zustand for state management. Store modules are organized by feature:

- `useAuthStore` - Authentication state
- `useGameStore` - Games data and filters
- `useReviewStore` - Reviews and ratings
- `useUIStore` - UI state (theme, modals, etc.)

## API Integration

API services are organized by resource:

- `authService` - Authentication endpoints
- `gameService` - Games endpoints
- `reviewService` - Reviews endpoints
- `userService` - User endpoints

## Styling

- Tailwind CSS for utility-first styling
- CSS Modules for component-specific styles
- Global styles in `src/styles`
- Dark mode support
- Responsive design
- Custom theme configuration

## Performance

- Image optimization
- Code splitting
- Route prefetching
- Static generation
- Incremental Static Regeneration
- Caching strategies
- Bundle size optimization
- Web Vitals monitoring

## Accessibility

- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast
- Screen reader support
- Semantic HTML

## Internationalization

- Multiple language support
- RTL layout support
- Date/time formatting
- Number formatting
- Currency handling

## Progressive Web App

- Service worker
- Offline support
- Push notifications
- App manifest
- Install prompts

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari
- Chrome for Android

## Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests
4. Run linter and tests
5. Submit a pull request

### Code Style

- Follow React best practices
- Use TypeScript
- Write component documentation
- Follow conventional commits
- Use ESLint and Prettier

## Environment Variables

See [.env.example](.env.example) for all available options.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 