# OBS API Integration Setup Guide

## Overview
This guide explains how to set up the OBS API integration for migo.md (your tour booking service).

## Architecture
- **migo.md** - Your tour booking website
- **OBS API** - External service providing hotel, tour, and availability data
- **Site-level authentication** - Your site authenticates with OBS API using credentials

## Environment Variables
Add these to your `.env` file:

```bash
# OBS API Configuration
OBS_API_BASE_URL=https://test-v2.obs.md
OBS_SITE_EMAIL=your_obs_site_email_here
OBS_SITE_PASSWORD=your_obs_site_password_here
```

## How It Works

### 1. Site Authentication
- When the Rails app starts, it automatically authenticates with OBS API
- Uses your site credentials (email/password) to get access tokens
- Tokens are automatically refreshed when they expire

### 2. API Calls
- All OBS API calls use the site-level authentication
- No need to authenticate individual users
- Your site acts as a proxy between users and OBS API

### 3. Data Flow
```
User Request → migo.md → OBS API (with site auth) → Response → User
```

## API Endpoints

### Public Endpoints (no user auth required)
- `GET /api/v1/search/departure_cities` - Get departure cities
- `GET /api/v1/search/countries` - Get countries for departure city
- `GET /api/v1/search/countries/:id/package_templates` - Get package templates

### Protected Endpoints (user auth required)
- `POST /api/v1/search` - Search for tours
- `GET /api/v1/search/:id` - Get search results
- All booking endpoints

## Background Jobs

### OBS Health Check
- Runs every 15 minutes
- Checks API connectivity
- Re-authenticates if needed

### Data Sync
- Syncs cities, hotels, and packages daily
- Refreshes availability every 30 minutes
- Monitors bookings every 5 minutes

## Testing

### 1. Check Environment Variables
```bash
rails console
> ENV['OBS_SITE_EMAIL']
> ENV['OBS_SITE_PASSWORD']
```

### 2. Test Authentication
```bash
rails console
> site_auth = ObsSiteAuthService.instance
> site_auth.authenticate_site
> site_auth.healthy?
```

### 3. Test API Call
```bash
rails console
> obs_service = ObsApiService.new(
    base_url: ENV['OBS_API_BASE_URL'],
    access_token: ObsSiteAuthService.instance.access_token
  )
> cities = obs_service.departure_cities
```

## Troubleshooting

### Authentication Failed
1. Check environment variables
2. Verify OBS API credentials
3. Check network connectivity
4. Review logs for error messages

### API Errors
1. Check if site is authenticated
2. Verify API endpoint URLs
3. Check request/response format
4. Review OBS API documentation

### Token Expired
- Tokens automatically refresh
- Health check job handles re-authentication
- Check logs for refresh attempts

## Monitoring

### Logs
- Authentication events are logged
- API calls are logged (without sensitive data)
- Errors are logged with stack traces

### Health Checks
- Site authentication status
- API connectivity
- Token expiration status

## Security Notes

- Site credentials are stored in environment variables
- Access tokens are not persisted to database
- All API calls use HTTPS
- Sensitive data is logged without credentials

## Support

For OBS API issues:
1. Check OBS API documentation
2. Verify credentials with OBS support
3. Check network connectivity
4. Review error logs

For migo.md integration issues:
1. Check Rails logs
2. Verify environment configuration
3. Test authentication manually
4. Check background job status
