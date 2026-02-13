<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:8081',
        'http://192.168.0.197:8081', 
        'http://localhost:19006',
        'exp://192.168.0.197:8081'
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => ['Authorization'],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];