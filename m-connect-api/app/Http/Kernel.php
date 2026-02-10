protected $routeMiddleware = [
    // ... existing middleware
    'role' => \App\Http\Middleware\CheckFarmerRole::class,
];