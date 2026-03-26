<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'phone',
    'refresh_token',
    'refresh_token_expires_at',
    'verification_otp',
    'verification_otp_expires_at',
    'email_verified_at',
    'reset_password_otp',        
    'reset_password_otp_expires_at' 
];

    protected $hidden = [
        'password',
        'remember_token',
        'refresh_token',
        'refresh_token_expires_at'
    ];

   protected $casts = [
    'email_verified_at' => 'datetime',
    'refresh_token_expires_at' => 'datetime',
    'verification_otp_expires_at' => 'datetime',
     'reset_password_otp_expires_at' => 'datetime' 
];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'name' => $this->name,
            'email' => $this->email
        ];
    }

    // Methods for refresh token management
    public function updateRefreshToken($refreshToken)
    {
        $this->refresh_token = $refreshToken;
        $this->refresh_token_expires_at = now()->addDays(30);  
        $this->save();
    }

    public function hasValidRefreshToken($token)
    {
        return $this->refresh_token === $token && 
               $this->refresh_token_expires_at && 
               $this->refresh_token_expires_at->isFuture();  
    }


   // Accessor for profile image URL 
public function getProfileImageUrlAttribute()
{
    if (!$this->profile_image) {
        return null;
    }
    
    if (str_starts_with($this->profile_image, 'http')) {
        return $this->profile_image;
    }
    
    return asset('storage/' . $this->profile_image);
}
}