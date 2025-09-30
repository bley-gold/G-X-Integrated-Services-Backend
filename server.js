const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 GX Services Backend API running on port ${PORT}`);
  console.log(`📧 SMTP configured for: ${process.env.SMTP_HOST}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📬 Email recipients: ${process.env.EMAIL_TO}`);
});
// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/send-email', limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().min(10).max(20).optional().allow('').trim(),
  company: Joi.string().max(100).optional().allow('').trim(),
  service: Joi.string().valid(
    'project-management',
    'procurement',
    'real-estate',
    'consultation',
    'other',
    ''
  ).optional().allow(''),
  message: Joi.string().min(10).max(2000).required().trim()
});

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email template function
const createEmailTemplate = (formData) => {
  const serviceLabels = {
    'project-management': 'Project Management',
    'procurement': 'Procurement Services',
    'real-estate': 'Real Estate Management',
    'consultation': 'General Consultation',
    'other': 'Other'
  };

  const serviceName = serviceLabels[formData.service] || 'Not specified';

  return {
    subject: `New Contact Form Submission - ${formData.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0a1628 0%, #00d4aa 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #0a1628; margin-bottom: 5px; display: block; }
          .value { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #00d4aa; }
          .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #00d4aa; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Contact Form Submission</h1>
            <p>GX Integrated Services</p>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">👤 Full Name:</span>
              <div class="value">${formData.name}</div>
            </div>
            
            <div class="field">
              <span class="label">📧 Email Address:</span>
              <div class="value"><a href="mailto:${formData.email}">${formData.email}</a></div>
            </div>
            
            ${formData.phone ? `
            <div class="field">
              <span class="label">📱 Phone Number:</span>
              <div class="value"><a href="tel:${formData.phone}">${formData.phone}</a></div>
            </div>
            ` : ''}
            
            ${formData.company ? `
            <div class="field">
              <span class="label">🏢 Company:</span>
              <div class="value">${formData.company}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <span class="label">🎯 Service Interest:</span>
              <div class="value">${serviceName}</div>
            </div>
            
            <div class="field">
              <span class="label">💬 Message:</span>
              <div class="message-box">${formData.message}</div>
            </div>
            
            <div class="footer">
              <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-ZA', { 
                timeZone: 'Africa/Johannesburg',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} (SAST)</p>
              <p>This email was sent from the GX Integrated Services contact form.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Contact Form Submission - GX Integrated Services

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Company: ${formData.company || 'Not provided'}
Service Interest: ${serviceName}

Message:
${formData.message}

Submitted: ${new Date().toLocaleString('en-ZA', { 
  timeZone: 'Africa/Johannesburg',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})} (SAST)
    `
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GX Services Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Contact form endpoint
app.post('/send-email', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const formData = value;

    // Create email transporter
    const transporter = createTransporter();

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (smtpError) {
      console.error('SMTP connection failed:', smtpError);
      return res.status(500).json({
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.'
      });
    }

    // Create email content
    const emailTemplate = createEmailTemplate(formData);
    
    // Email recipients
    const recipients = process.env.EMAIL_TO.split(',').map(email => email.trim());

    // Send email
    const mailOptions = {
      from: {
        name: 'GX Services Contact Form',
        address: process.env.EMAIL_FROM
      },
      to: recipients,
      replyTo: formData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      from: formData.email,
      name: formData.name,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});



// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});