# Games Review Board

A comprehensive web application for browsing, reviewing, and managing games. Built with modern web technologies and a robust database system.

## Features

- **Game Management**
  - Detailed game information including metadata, platforms, and requirements
  - Support for multiple platforms and pricing
  - Achievement tracking
  - Media management (screenshots, videos)
  - Age ratings and content descriptors

- **User Features**
  - User profiles with enhanced information
  - Game library management
  - Playtime tracking
  - Wishlist functionality
  - Favorite games marking

- **Review System**
  - Detailed game reviews
  - Helpful/Not helpful voting
  - Verified owner badges
  - Playtime tracking
  - Featured reviews

- **Search and Discovery**
  - Advanced search with full-text capabilities
  - Genre-based browsing
  - Trending games
  - Similar games recommendations
  - Developer and publisher statistics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Apollo Client for GraphQL
- React Query for data fetching
- React Router for navigation
- Jest & React Testing Library for testing

### Backend
- Node.js with Express
- Apollo Server for GraphQL
- MySQL 8.0+ database
- Sequelize ORM
- JWT authentication
- Multer for file uploads
- Winston for logging

### Infrastructure
- Docker for containerization
- Nginx for reverse proxy
- PM2 for process management
- GitHub Actions for CI/CD
- AWS S3 for media storage
- Cloudflare for CDN

## Prerequisites

- Node.js 18.x or higher
- MySQL 8.0 or higher
- Docker and Docker Compose (optional)
- Git
- npm or yarn
- AWS CLI (for S3 configuration)
- Cloudflare account (for CDN)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/games-review-board.git
   cd games-review-board
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example environment files
   cp .env.example .env
   cd frontend && cp .env.example .env
   cd ../backend && cp .env.example .env
   ```

4. Configure your environment variables in the `.env` files.

5. Set up the database:
   ```bash
   mysql -u root -p < migrations/schema.sql
   mysql -u root -p < migrations/views.sql
   mysql -u root -p < migrations/triggers.sql
   mysql -u root -p < migrations/seed.sql
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Production Deployment

### Docker Deployment

1. Build the Docker images:
   ```bash
   docker-compose build
   ```

2. Start the containers:
   ```bash
   docker-compose up -d
   ```

3. Run database migrations:
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

### Manual Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

3. Set up Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Frontend
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # GraphQL
       location /graphql {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Start the backend with PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

### Database Setup

1. Create a production database:
   ```bash
   mysql -u root -p
   CREATE DATABASE games_review_board_prod;
   ```

2. Import the schema and data:
   ```bash
   mysql -u root -p games_review_board_prod < migrations/schema.sql
   mysql -u root -p games_review_board_prod < migrations/views.sql
   mysql -u root -p games_review_board_prod < migrations/triggers.sql
   ```

3. Set up database backups:
   ```bash
   # Add to crontab
   0 0 * * * /path/to/scripts/db-backup.sh
   ```

### SSL Configuration

1. Install Certbot:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. Configure automatic renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

## Monitoring and Maintenance

### Logging
- Application logs: `/var/log/games-review-board/`
- Nginx logs: `/var/log/nginx/`
- Database logs: `/var/log/mysql/`

### Backup Strategy
- Daily database backups
- Weekly full system backups
- Monthly archive backups

### Performance Monitoring
- PM2 monitoring dashboard
- MySQL performance monitoring
- Nginx status monitoring

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong passwords and secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Limit database user permissions
   - Enable SSL connections
   - Regular security audits

3. **Application Security**
   - Enable CORS properly
   - Implement rate limiting
   - Use HTTPS everywhere
   - Regular security updates

4. **Infrastructure Security**
   - Regular system updates
   - Firewall configuration
   - DDoS protection
   - Regular security scans

## Scaling Considerations

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use caching strategies

### Horizontal Scaling
- Load balancing with Nginx
- Database replication
- Session management
- File storage distribution

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql

   # Check connection logs
   tail -f /var/log/mysql/error.log
   ```

2. **Application Crashes**
   ```bash
   # Check PM2 logs
   pm2 logs

   # Check application logs
   tail -f /var/log/games-review-board/app.log
   ```

3. **Performance Issues**
   ```bash
   # Check system resources
   htop

   # Check MySQL performance
   mysqladmin status
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [MySQL](https://www.mysql.com/)
- [Sequelize](https://sequelize.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)
- [Nginx](https://www.nginx.com/)
- [PM2](https://pm2.keymetrics.io/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Cloudflare](https://www.cloudflare.com/)
