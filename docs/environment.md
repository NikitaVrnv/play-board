# Environment Configuration Guide

This document provides comprehensive documentation for the environment variables used in the Games Review Board application. It covers configuration options for various aspects of the application, from basic settings to advanced database tuning.

## Table of Contents
1. [Overview](#overview)
2. [Configuration Categories](#configuration-categories)
   - [Application Settings](#application-configuration)
   - [API Configuration](#api-configuration)
   - [Database Configuration](#database-configuration)
   - [Authentication Settings](#authentication)
   - [Feature Management](#feature-flags)
   - [Third-Party Integrations](#third-party-services)
   - [Media Handling](#image-upload)
   - [Performance Optimization](#performance)
   - [Development Tools](#development)
   - [Testing Framework](#testing)
   - [Security Measures](#security)
   - [Logging System](#logging)
3. [Environment-Specific Setup](#environment-specific-configuration)
4. [Security Best Practices](#security-considerations)
5. [Troubleshooting](#troubleshooting)

## Overview

The Games Review Board application uses environment variables for configuration management, following the twelve-factor app methodology. This approach ensures:
- Configuration is separated from code
- Settings can vary between environments
- Sensitive information is properly managed
- Application behavior is easily modified

## Configuration Categories

### Application Configuration

Core application settings that define the basic behavior and identity of the application.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `NODE_ENV` | Application environment | development | Yes | All |
| `VITE_APP_NAME` | Application name | Games Review Board | Yes | All |
| `VITE_APP_VERSION` | Application version | $npm_package_version | Yes | All |
| `VITE_APP_URL` | Base URL | http://localhost:8080 | Yes | All |
| `VITE_APP_DESCRIPTION` | Application description | "A modern web application..." | No | All |

### API Configuration

Settings for API communication and request handling.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_API_URL` | Base URL for API requests | http://localhost:3000 | Yes | All |
| `VITE_API_TIMEOUT` | Request timeout (ms) | 30000 | No | All |
| `VITE_API_MAX_RETRIES` | Maximum retry attempts | 3 | No | All |
| `VITE_API_VERSION` | API version | v1 | No | All |

### Database Configuration

Comprehensive database settings including connection, performance, and maintenance parameters.

#### Basic Connection
| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DB_HOST` | Database host | localhost | Yes | All |
| `DB_PORT` | Database port | 3306 | Yes | All |
| `DB_NAME` | Database name | games_review_board | Yes | All |
| `DB_USER` | Database user | root | Yes | All |
| `DB_PASSWORD` | Database password | - | Yes | All |

#### Connection Pooling
| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DB_POOL_MIN` | Minimum connections | 2 | No | All |
| `DB_POOL_MAX` | Maximum connections | 10 | No | All |
| `DB_POOL_IDLE` | Idle timeout (ms) | 30000 | No | All |
| `DB_POOL_ACQUIRE` | Connection acquire timeout (ms) | 30000 | No | All |

#### Security
| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DB_SSL_ENABLED` | Enable SSL | false | No | All |
| `DB_SSL_CA` | SSL CA certificate path | - | No | Production |
| `DB_SSL_CERT` | SSL client certificate path | - | No | Production |
| `DB_SSL_KEY` | SSL client key path | - | No | Production |

#### Performance Tuning
| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DB_INNODB_BUFFER_POOL_SIZE` | Buffer pool size (bytes) | 134217728 | No | Production |
| `DB_INNODB_LOG_FILE_SIZE` | Log file size (bytes) | 50331648 | No | Production |
| `DB_INNODB_FLUSH_METHOD` | Flush method | O_DIRECT | No | Production |
| `DB_INNODB_FILE_PER_TABLE` | Separate file per table | true | No | All |

#### Monitoring and Maintenance
| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DB_ENABLE_SLOW_QUERY_LOG` | Enable slow query logging | false | No | Production |
| `DB_SLOW_QUERY_THRESHOLD` | Slow query threshold (s) | 2 | No | Production |
| `DB_ENABLE_GENERAL_LOG` | Enable general logging | false | No | Development |
| `DB_BACKUP_DIR` | Backup directory | backups | No | Production |
| `DB_BACKUP_RETENTION` | Number of backups to retain | 7 | No | Production |

### Authentication

Security settings for user authentication and session management.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_AUTH_TOKEN_KEY` | Auth token storage key | auth_token | Yes | All |
| `VITE_AUTH_REFRESH_TOKEN_KEY` | Refresh token storage key | auth_refresh_token | Yes | All |
| `VITE_AUTH_TOKEN_EXPIRY` | Token expiry (s) | 3600 | No | All |
| `VITE_AUTH_REFRESH_TOKEN_EXPIRY` | Refresh token expiry (s) | 604800 | No | All |
| `VITE_AUTH_COOKIE_DOMAIN` | Cookie domain | localhost | No | All |
| `VITE_AUTH_COOKIE_SECURE` | Enable secure cookies | false | No | Production |

### Feature Management

Feature flags for controlling application functionality.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_ENABLE_ANALYTICS` | Enable analytics | false | No | Production |
| `VITE_ENABLE_SENTRY` | Enable error tracking | false | No | Production |
| `VITE_ENABLE_MAINTENANCE_MODE` | Enable maintenance mode | false | No | Production |
| `VITE_ENABLE_DARK_MODE` | Enable dark mode | true | No | All |
| `VITE_ENABLE_I18N` | Enable internationalization | true | No | All |
| `VITE_ENABLE_PWA` | Enable PWA features | false | No | Production |

### Third-Party Integrations

Configuration for external services and APIs.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics ID | - | No | Production |
| `VITE_SENTRY_DSN` | Sentry DSN | - | No | Production |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | - | No | Production |
| `VITE_DICEBEAR_API` | DiceBear API URL | https://api.dicebear.com/7.x | No | All |

### Media Handling

Settings for image upload and processing.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_MAX_UPLOAD_SIZE` | Maximum upload size (bytes) | 5242880 | No | All |
| `VITE_ALLOWED_IMAGE_TYPES` | Allowed image types | image/jpeg,image/png,image/gif | No | All |
| `VITE_IMAGE_UPLOAD_PATH` | Upload directory | /game-uploads | No | All |
| `VITE_IMAGE_QUALITY` | Image quality (0-100) | 80 | No | All |
| `VITE_IMAGE_MAX_WIDTH` | Maximum image width | 1920 | No | All |
| `VITE_IMAGE_MAX_HEIGHT` | Maximum image height | 1080 | No | All |

### Performance Optimization

Settings for application performance tuning.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_CACHE_TTL` | Cache TTL (s) | 3600 | No | All |
| `VITE_CACHE_ENABLED` | Enable caching | true | No | All |
| `VITE_CACHE_VERSION` | Cache version | 1 | No | All |
| `VITE_ENABLE_COMPRESSION` | Enable response compression | true | No | Production |
| `VITE_ENABLE_SOURCEMAPS` | Enable source maps | true | No | Development |

### Development Tools

Settings for development and debugging.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_ENABLE_DEVTOOLS` | Enable dev tools | true | No | Development |
| `VITE_ENABLE_STRICT_MODE` | Enable strict mode | true | No | All |
| `VITE_ENABLE_HOT_RELOAD` | Enable hot reload | true | No | Development |
| `VITE_ENABLE_ESLINT` | Enable ESLint | true | No | Development |
| `VITE_ENABLE_TYPESCRIPT` | Enable TypeScript | true | No | All |

### Testing Framework

Configuration for testing environment.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_ENABLE_TESTING` | Enable testing | true | No | Testing |
| `VITE_TEST_API_URL` | Test API URL | http://localhost:3001 | No | Testing |
| `VITE_TEST_DB_URL` | Test database URL | mysql://test:test@localhost:3306/test | No | Testing |
| `VITE_TEST_DB_NAME` | Test database name | games_review_board_test | No | Testing |
| `VITE_TEST_TIMEOUT` | Test timeout (ms) | 10000 | No | Testing |
| `VITE_TEST_SEED_DB` | Seed test database | true | No | Testing |
| `VITE_TEST_MIGRATE_DB` | Run migrations | true | No | Testing |
| `VITE_TEST_CLEANUP_DB` | Clean up after tests | true | No | Testing |

### Security Measures

Security-related settings and features.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_ENABLE_CSP` | Enable CSP | true | No | Production |
| `VITE_ENABLE_HSTS` | Enable HSTS | true | No | Production |
| `VITE_ENABLE_XSS_PROTECTION` | Enable XSS protection | true | No | All |
| `VITE_ENABLE_NOSNIFF` | Enable nosniff | true | No | All |
| `VITE_ENABLE_FRAMEGUARD` | Enable frameguard | true | No | All |

### Logging System

Configuration for application logging.

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_LOG_LEVEL` | Log level | debug | No | All |
| `VITE_ENABLE_CONSOLE_LOGS` | Enable console logging | true | No | All |
| `VITE_ENABLE_FILE_LOGS` | Enable file logging | false | No | Production |
| `VITE_LOG_FILE_PATH` | Log file path | logs/app.log | No | Production |

## Environment-Specific Configuration

### Development Environment
- Enable development tools and debugging
- Use local services and endpoints
- Enable detailed logging
- Disable production security features
- Configure for rapid development cycles

### Production Environment
- Disable development tools
- Use production services
- Enable all security features
- Configure for performance and reliability
- Enable monitoring and logging
- Use production-grade database settings

### Testing Environment
- Use isolated services
- Enable test-specific features
- Configure for automated testing
- Enable test database management
- Disable production security features

## Security Best Practices

1. **Environment Variables**
   - Never commit sensitive values to version control
   - Use strong, unique values for all credentials
   - Regularly rotate API keys and tokens
   - Use environment-specific values

2. **Database Security**
   - Use strong passwords
   - Enable SSL in production
   - Restrict user permissions
   - Regular backups
   - Monitor for suspicious activity

3. **Application Security**
   - Enable all security headers
   - Use HTTPS in production
   - Implement proper authentication
   - Regular security audits
   - Keep dependencies updated

4. **Monitoring and Logging**
   - Enable appropriate logging levels
   - Monitor for security events
   - Regular log rotation
   - Secure log storage

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify connection parameters
   - Check network connectivity
   - Verify SSL configuration
   - Check user permissions

2. **Performance Problems**
   - Review buffer pool settings
   - Check query performance
   - Monitor connection pool
   - Review cache settings

3. **Security Issues**
   - Verify SSL configuration
   - Check security headers
   - Review authentication settings
   - Monitor for suspicious activity

### Diagnostic Tools

1. **Database Monitoring**
   ```bash
   # Check database status
   npm run db:status

   # Monitor slow queries
   npm run db:monitor

   # Check connection pool
   npm run db:pool
   ```

2. **Application Monitoring**
   ```bash
   # Check application status
   npm run status

   # View logs
   npm run logs

   # Monitor performance
   npm run monitor
   ```

3. **Security Checks**
   ```bash
   # Run security audit
   npm run security:audit

   # Check SSL configuration
   npm run security:ssl

   # Verify headers
   npm run security:headers
   ```

## Usage

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` according to your environment.

3. For production, ensure sensitive values are properly set and secure.

4. For database setup:
   ```bash
   # Run migrations
   npm run db:migrate

   # Seed the database
   npm run db:seed

   # Create backup
   npm run db:backup

   # Restore from backup
   npm run db:restore

   # Check database status
   npm run db:status
   ```

## Security Considerations

- Never commit `.env` files to version control
- Use strong, unique values for sensitive configurations
- Regularly rotate API keys and tokens
- Enable security features in production
- Use HTTPS in production environments
- Use strong database passwords
- Enable SSL for database connections in production
- Restrict database user permissions to minimum required

## Environment-specific Configuration

### Development
- Enable development tools
- Use local API endpoints
- Enable detailed logging
- Disable security restrictions for testing
- Use local MySQL instance
- Enable database logging for debugging
- Disable SSL for local development
- Enable general query logging
- Set lower connection pool limits
- Use development character set
- Set lower InnoDB buffer pool size
- Enable InnoDB monitor for debugging
- Disable persistent statistics
- Use default flush method
- Enable deadlock detection
- Print all deadlocks

### Production
- Disable development tools
- Use production API endpoints
- Enable all security features
- Configure proper logging levels
- Use secure cookie settings
- Use production MySQL instance
- Enable SSL for database connections
- Use connection pooling
- Disable database logging
- Use read replicas if needed
- Enable query caching
- Configure backup schedule
- Use production character set
- Set appropriate timeouts
- Enable slow query logging
- Optimize InnoDB buffer pool size
- Configure appropriate flush method
- Enable persistent statistics
- Set appropriate lock wait timeout
- Enable deadlock detection
- Configure appropriate I/O threads
- Use file per table
- Set appropriate purge threads
- Configure change buffering
- Monitor InnoDB status

### Testing
- Use separate test database
- Enable automatic cleanup
- Run migrations before tests
- Seed test data
- Use connection pooling
- Disable SSL for test environment
- Disable query caching
- Use test character set
- Set lower timeouts
- Enable general query logging
- Use minimal buffer pool size
- Disable persistent statistics
- Enable InnoDB monitor
- Print all deadlocks
- Use default I/O threads 