interface ResetPasswordEmailProps {
	resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
            background-color: #0ea5e9;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .btn:hover {
            background-color: #0284c7;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
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
        
        <h1>Reset Your Password</h1>
        
        <p>Hi there,</p>
        
        <p>We received a request to reset your password for your Inquiro account. If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <div class="link-text">${resetUrl}</div>
        
        <div class="security-note">
            <strong>Security Note:</strong> This link will expire in 20 minutes for your security. If you didn't request a password reset, you can safely ignore this email.
        </div>
        
        <p>If you have any questions or need help, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>The Inquiro Team</p>
        
        <div class="footer">
            <p>© 2025 Inquiro. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>`;
}
