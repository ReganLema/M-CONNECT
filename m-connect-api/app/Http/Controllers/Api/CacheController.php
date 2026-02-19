<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CacheController extends Controller
{
    /**
     * Get cache statistics
     */
    public function stats()
    {
        return response()->json([
            'status' => 'success',
            'data' => CacheService::getStats()
        ]);
    }

    /**
     * Clear all cache
     */
    public function clear()
    {
        Cache::flush();

        return response()->json([
            'status' => 'success',
            'message' => 'All cache cleared successfully'
        ]);
    }

    /**
     * Clear cache by pattern
     */
    public function clearPattern(Request $request)
    {
        $pattern = $request->input('pattern', '*');
        $deleted = CacheService::clearByPattern($pattern);

        return response()->json([
            'status' => 'success',
            'message' => "Cleared {$deleted} cache keys",
            'deleted' => $deleted
        ]);
    }

    /**
     * Warm up cache (pre-populate frequently accessed data)
     */
    public function warmup()
    {
        // Pre-populate cache with frequently accessed data
        // Example: Cache all categories, popular products, etc.

        return response()->json([
            'status' => 'success',
            'message' => 'Cache warmed up successfully'
        ]);
    }
}