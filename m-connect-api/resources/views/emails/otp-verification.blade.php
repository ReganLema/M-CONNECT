<!-- resources/views/emails/otp-verification.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #10b981; 
            text-align: center; 
            padding: 20px;
            background: white;
            border-radius: 10px;
            margin: 20px 0;
            letter-spacing: 8px;
        }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 Mkulima Connect</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>
            
            <p>Use the verification code below to complete your registration:</p>
            
            <div class="otp-code">
                {{ $otp }}
            </div>
            
            <p>This code will expire in <strong>{{ $expires_in }}</strong>.</p>
            
            <p>If you didn't request this code, please ignore this email.</p>
            
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