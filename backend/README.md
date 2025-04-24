# Games Review Board Backend

The backend API service for the Games Review Board application, built with Node.js, Express, and MySQL.

## Features

- RESTful API design
- JWT authentication
- Role-based access control
- Input validation with Zod
- File upload handling
- Rate limiting
- CORS protection
- Database migrations
- Automated testing
- API documentation
- Logging and monitoring
- Docker support

## Tech Stack

- Node.js v18+
- TypeScript
- Express.js
- MySQL 8.0
- JWT for authentication
- Zod for validation
- Jest for testing
- Swagger for API docs
- Winston for logging
- Docker and Docker Compose

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── app.ts         # Express app setup
├── tests/             # Test files
├── migrations/        # Database migrations
├── docs/             # API documentation
└── scripts/          # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MySQL 8.0
- Docker (optional)

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=games_review_board
```

4. Run migrations:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

### Using Docker

1. Build and start containers:
```bash
docker-compose up -d
```

2. Run migrations:
```bash
docker-compose exec api npm run migrate
```

## Database

### Migrations

Create a new migration:
```bash
npm run migrate:create name_of_migration
```

Run migrations:
```bash
npm run migrate
```

Rollback last migration:
```bash
npm run migrate:down
```

### Seeding

Seed the database:
```bash
npm run seed
```

Create a new seed:
```bash
npm run seed:create name_of_seed
```

## Testing

Run all tests:
```bash
npm test
```

Run specific test:
```bash
npm test -- tests/auth.test.ts
```

Run with coverage:
```bash
npm run test:coverage
```

## API Documentation

API documentation is available at `/api-docs` when running the server.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/reviews` - Get user's reviews

#### Games
- `GET /api/games` - List games
- `POST /api/games` - Create game
- `GET /api/games/:id` - Get game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game
- `GET /api/games/:id/reviews` - Get game reviews

#### Reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/like` - Like review
- `DELETE /api/reviews/:id/like` - Unlike review

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Logging

Logs are written to:
- Console in development
- Files in production (`logs/` directory)
- Error reporting service in production

Log levels:
- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug messages

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- SQL injection prevention
- XSS protection
- Input validation
- Security headers
- Audit logging

## Performance

- Database connection pooling
- Query optimization
- Response caching
- Compression
- Load balancing support

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code
- `npm run migrate` - Run migrations
- `npm run seed` - Seed database
- `npm run docs` - Generate API docs

## Environment Variables

See [.env.example](.env.example) for all available options.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for your changes
4. Run linter and tests
5. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write JSDoc comments
- Follow conventional commits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 