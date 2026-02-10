/**
 * SmartDarna Backend Server
 * Handles order confirmation emails
 * 
 * Requirements:
 * - Node.js 16+
 * - npm install express nodemailer cors dotenv
 * 
 * Setup:
 * 1. Create .env file with email credentials
 * 2. Run: npm install
 * 3. Run: node server.js
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Email transporter configuration
let transporter;

/**
 * Initialize email transporter
 * Uses Gmail SMTP (you can change to any email service)
 */
async function initializeEmailTransporter() {
    try {
        // For Gmail, you need to:
        // 1. Enable 2-factor authentication
        // 2. Generate an app password: https://myaccount.google.com/apppasswords
        transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS  // Your Gmail app password
            }
        });

        // Verify transporter
        await transporter.verify();
        console.log('✅ Email transporter initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize email transporter:', error);
        console.log('📧 Email functionality will be disabled');
    }
}

/**
 * Generate HTML email template for order confirmation
 */
function generateOrderConfirmationEmail(orderData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - SmartDarna</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .product-item { border-bottom: 1px solid #dee2e6; padding: 15px 0; }
            .product-item:last-child { border-bottom: none; }
            .total { font-size: 18px; font-weight: bold; color: #007bff; }
            .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
            .status-badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 SmartDarna</h1>
                <h2>Order Confirmation</h2>
                <p>Your smart home journey begins!</p>
            </div>
            
            <div class="content">
                <div class="order-info">
                    <h3>Order Details</h3>
                    <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
                    <p><strong>Order Status:</strong> <span class="status-badge">${orderData.orderStatus}</span></p>
                    <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
                    <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
                    <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
                </div>

                <div class="order-info">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${orderData.customerName}</p>
                    <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                    <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                    <p><strong>Address:</strong> ${orderData.customerAddress}</p>
                </div>

                <div class="order-info">
                    <h3>Ordered Products</h3>
                    ${orderData.items.map(item => `
                        <div class="product-item">
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity} | Color: ${item.color}</p>
                            <p>Price: ${item.price} MAD × ${item.quantity} = <strong>${item.total} MAD</strong></p>
                        </div>
                    `).join('')}
                </div>

                <div class="order-info">
                    <h3>Order Summary</h3>
                    <p><strong>Subtotal:</strong> ${orderData.subtotal} MAD</p>
                    <p><strong>Shipping:</strong> ${orderData.shipping === 0 ? 'FREE' : orderData.shipping + ' MAD'}</p>
                    <p class="total"><strong>Total Amount:</strong> ${orderData.total} MAD</p>
                    <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
                </div>

                <div class="footer">
                    <p>Thank you for choosing SmartDarna! 🎉</p>
                    <p>If you have any questions, please contact us at support@smartdarna.com</p>
                    <p>© 2024 SmartDarna - Making homes smarter, one device at a time.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * API endpoint to send order confirmation email
 * POST /api/send-order-confirmation
 */
app.post('/api/send-order-confirmation', async (req, res) => {
    try {
        const orderData = req.body;

        // Validate required fields
        if (!orderData.customerEmail || !orderData.orderNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: customerEmail and orderNumber' 
            });
        }

        if (!transporter) {
            // Email service is not configured - return error
            console.error('❌ Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
            return res.status(500).json({ 
                success: false, 
                message: 'Email service not configured',
                error: 'Email transporter not initialized'
            });
        }

        // Send email
        const mailOptions = {
            from: `"SmartDarna" <${process.env.EMAIL_USER}>`,
            to: orderData.customerEmail,
            subject: `Order Confirmation #${orderData.orderNumber} - SmartDarna`,
            html: generateOrderConfirmationEmail(orderData)
        };

        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Order confirmation email sent successfully:', {
            to: orderData.customerEmail,
            orderNumber: orderData.orderNumber,
            messageId: result.messageId
        });

        res.json({ 
            success: true, 
            message: 'Order confirmation email sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('❌ Failed to send order confirmation email:', error);
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send confirmation email',
            error: error.message 
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        emailService: transporter ? 'configured' : 'not configured'
    });
});

/**
 * Serve Angular app for all other routes
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

/**
 * Start server
 */
async function startServer() {
    await initializeEmailTransporter();
    
    app.listen(PORT, () => {
        console.log(`🚀 SmartDarna server running on http://localhost:${PORT}`);
        console.log(`📧 Email service: ${transporter ? 'configured' : 'not configured'}`);
        console.log(`🔗 API endpoints:`);
        console.log(`   POST /api/send-order-confirmation - Send order confirmation email`);
        console.log(`   GET  /api/health - Health check`);
        console.log(`\n📝 Setup instructions:`);
        console.log(`   1. Create .env file with:`);
        console.log(`      EMAIL_USER=your-email@gmail.com`);
        console.log(`      EMAIL_PASS=your-gmail-app-password`);
        console.log(`   2. Restart the server`);
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Shutting down server...');
    if (transporter) {
        transporter.close();
    }
    process.exit(0);
});

startServer().catch(console.error);
