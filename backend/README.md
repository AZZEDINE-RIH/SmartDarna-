# SmartDarna Backend Server

## 🚀 Order Confirmation Email Service

This backend server handles order confirmation emails for the SmartDarna e-commerce application.

## 📋 Features

- ✅ **Order Confirmation Emails** - Beautiful HTML email templates
- ✅ **Form Validation** - Server-side validation for all fields
- ✅ **Error Handling** - Graceful error handling and logging
- ✅ **Security** - CORS enabled, secure email sending
- ✅ **Health Check** - API endpoint for monitoring

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Email (REQUIRED for working emails)

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

**IMPORTANT:** For emails to actually work, you MUST configure Gmail:

1. **Enable 2-factor authentication** on your Gmail account
2. **Generate an app password**: https://myaccount.google.com/apppasswords
3. **Edit `.env`** with your actual credentials:

```env
EMAIL_USER=your-personal-email@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3000
```

**⚠️ CRITICAL:** 
- Use your REAL Gmail address
- Use the 16-character app password (not your regular password)
- Without proper configuration, emails will fail and show errors

### 3. Start Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server will run on: `http://localhost:3000`

### 4. Test Email Functionality

1. **Start the backend server**
2. **Fill checkout form** with your email address
3. **Click "Confirm Order (Test)"** button
4. **Check your email inbox** for the confirmation

**If no email arrives:**
- Check backend console for error messages
- Verify `.env` file has correct credentials
- Ensure Gmail app password is correctly generated

## 📡 API Endpoints

### POST /api/send-order-confirmation

Sends order confirmation email to customer.

**Request Body:**
```json
{
  "orderNumber": "ORD-123456",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+212 600 123 456",
  "customerAddress": "123 Main St, Casablanca",
  "items": [
    {
      "name": "Smart Light",
      "quantity": 2,
      "price": 299,
      "total": 598,
      "color": "White"
    }
  ],
  "subtotal": 598,
  "shipping": 0,
  "total": 598,
  "paymentMethod": "Cash on Delivery",
  "orderDate": "2024-01-15T10:30:00.000Z",
  "estimatedDelivery": "2024-01-20T10:30:00.000Z",
  "trackingNumber": "TRK123456789",
  "orderStatus": "Confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmation email sent successfully",
  "messageId": "abc123@smtp.gmail.com"
}
```

### GET /api/health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "emailService": "configured"
}
```

## 🎨 Email Template Features

The email template includes:

- 🏠 **SmartDarna Branding** - Professional header and footer
- 📋 **Order Details** - Order number, status, dates, tracking
- 👤 **Customer Information** - Name, email, phone, address
- 🛒 **Product List** - All ordered items with quantities and prices
- 💰 **Order Summary** - Subtotal, shipping, total, payment method
- 🎨 **Responsive Design** - Works on all devices
- ✅ **Status Badge** - Visual order status indicator

## 🔧 Frontend Integration

The frontend sends order data to the backend using fetch:

```javascript
const response = await fetch('http://localhost:3000/api/send-order-confirmation', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
});

if (!response.ok) {
    throw new Error('Failed to send confirmation email');
}

const result = await response.json();
console.log('Email sent:', result);
```

## 🛡️ Security Features

- ✅ **CORS Enabled** - Allows frontend access
- ✅ **Input Validation** - Server-side validation
- ✅ **Error Handling** - No sensitive data leakage
- ✅ **Environment Variables** - Secure credential storage
- ✅ **Rate Limiting Ready** - Easy to add rate limiting

## 🐛 Troubleshooting

### Email Not Sending

1. **Check Gmail Settings:**
   - 2-factor authentication enabled
   - App password generated correctly
   - Less secure apps allowed

2. **Check Environment Variables:**
   - `.env` file exists
   - Correct email and password
   - No extra spaces or characters

3. **Check Network:**
   - Port 3000 not blocked
   - Firewall allows outbound email
   - Internet connection stable

### Server Not Starting

1. **Check Node Version:**
   ```bash
   node --version  # Should be 16+
   ```

2. **Check Dependencies:**
   ```bash
   npm install  # Reinstall if needed
   ```

3. **Check Port:**
   ```bash
   lsof -i :3000  # Check if port is in use
   ```

## 📝 Logs

The server provides detailed logging:

- ✅ **Email transporter status**
- 📧 **Email sending attempts**
- ❌ **Error details**
- 🔄 **Server startup/shutdown**

## 🚀 Production Deployment

For production deployment:

1. **Use Production Email Service:**
   - SendGrid, Mailgun, or AWS SES
   - Update transporter configuration

2. **Add Security:**
   - Rate limiting
   - Input sanitization
   - HTTPS/SSL

3. **Monitoring:**
   - Health checks
   - Error tracking
   - Performance monitoring

## 📞 Support

For issues with the backend:

1. Check the console logs
2. Verify email configuration
3. Test with the health endpoint
4. Check this README for common issues

---

**© 2024 SmartDarna - Making homes smarter, one device at a time.**
