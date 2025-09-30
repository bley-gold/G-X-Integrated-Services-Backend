# GX Integrated Services - Contact Form Backend

A production-ready Node.js/Express backend API for handling contact form submissions with Zoho SMTP integration.

## Features

- ✅ Express.js server with security middleware
- ✅ Zoho SMTP email integration
- ✅ Input validation with Joi
- ✅ Rate limiting protection
- ✅ CORS configuration
- ✅ Professional HTML email templates
- ✅ Error handling and logging
- ✅ Environment-based configuration
- ✅ Health check endpoint
- ✅ Ready for Kloudbean deployment

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# SMTP Configuration (Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@gxservices.co.za
SMTP_PASS=H3xgaNSqcqK2

# Email Recipients
EMAIL_TO=simamkelem@gxservices.co.za,support@gxservices.co.za
EMAIL_FROM=admin@gxservices.co.za

# CORS Configuration
ALLOWED_ORIGINS=https://gxservices.co.za,https://www.gxservices.co.za

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

### 3. Development

```bash
npm run dev
```

### 4. Production

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "success": true,
  "message": "GX Services Backend API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### Send Email
```
POST /send-email
```

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+27 123 456 789",
  "company": "Example Corp",
  "service": "project-management",
  "message": "I'm interested in your project management services."
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon.",
  "messageId": "unique-message-id"
}
```

Response (Error):
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

## Field Validation

- **name**: Required, 2-100 characters
- **email**: Required, valid email format
- **phone**: Optional, 10-20 characters
- **company**: Optional, max 100 characters
- **service**: Optional, one of: `project-management`, `procurement`, `real-estate`, `consultation`, `other`
- **message**: Required, 10-2000 characters

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 10 requests per 15 minutes per IP
- **CORS**: Configurable allowed origins
- **Input Validation**: Joi schema validation
- **Error Handling**: Comprehensive error responses

## Deployment on Kloudbean

### 1. Upload Files
Upload all backend files to your Kloudbean hosting directory.

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Environment Variables
Ensure your `.env` file is properly configured for production.

### 4. Start Application
```bash
npm start
```

### 5. Process Management (Optional)
For production, consider using PM2:

```bash
npm install -g pm2
pm2 start server.js --name "gx-backend"
pm2 startup
pm2 save
```

## Frontend Integration

Update your frontend contact form to use the backend:

```javascript
const response = await fetch('https://gxservices.co.za/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

const result = await response.json();
```

## Monitoring

- Check `/health` endpoint for API status
- Monitor server logs for email delivery status
- Set up log rotation for production environments

## Troubleshooting

### SMTP Issues
- Verify Zoho SMTP credentials
- Check firewall settings for port 587
- Ensure "Less Secure Apps" is enabled in Zoho (if required)

### CORS Issues
- Verify `ALLOWED_ORIGINS` includes your frontend domain
- Check for trailing slashes in URLs

### Rate Limiting
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed
- Monitor for legitimate users being blocked

## Support

For technical support, contact the development team or refer to the API documentation.