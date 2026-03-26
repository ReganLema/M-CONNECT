<!-- resources/views/emails/password-reset-otp.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #f59e0b; 
            text-align: center; 
            padding: 20px;
            background: white;
            border-radius: 10px;
            margin: 20px 0;
            letter-spacing: 8px;
        }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Reset Your Password</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>
            
            <p>We received a request to reset your password. Use the verification code below:</p>
            
            <div class="otp-code">
                {{ $otp }}
            </div>
            
            <p>This code will expire in <strong>{{ $expires_in }}</strong>.</p>
            
            <div class="warning">
                <p>⚠️ If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 14px;">
                For security reasons, never share this code with anyone.
            </p>
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} Mkulima Connect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>