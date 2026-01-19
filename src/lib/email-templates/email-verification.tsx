interface EmailVerificationProps {
	verificationUrl: string;
	userName?: string;
}

export function EmailVerificationEmail({
	verificationUrl,
	userName = "there",
}: EmailVerificationProps): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .btn:hover {
            background-color: #059669;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .welcome-note {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
        }
        .link-text {
            word-break: break-all;
            background-color: #f3f4f6;
            padding: 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Inquiro</div>
            <p>Survey Platform</p>
        </div>
        
        <h1>Welcome to Inquiro! 🎉</h1>
        
        <p>Hi ${userName},</p>
        
        <p>Thank you for signing up with Inquiro! We're excited to have you join our community of survey creators and participants.</p>
        
        <p>To get started and secure your account, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="btn">Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <div class="link-text">${verificationUrl}</div>
        
        <div class="welcome-note">
            <strong>Welcome aboard!</strong> Once verified, you'll be able to access all features of Inquiro and start creating or participating in surveys.
        </div>
        
        <p>If you have any questions or need help getting started, please don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>The Inquiro Team</p>
        
        <div class="footer">
            <p>© 2025 Inquiro. All rights reserved.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
}
