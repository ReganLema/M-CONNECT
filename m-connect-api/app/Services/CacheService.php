<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheService
{
    /**
     * Get all cache keys matching pattern
     */
    public static function getKeysByPattern(string $pattern): array
    {
        $keys = [];
        $cursor = '0';

        do {
            $result = Redis::scan($cursor, 'MATCH', $pattern, 'COUNT', 1000);
            $cursor = $result[0];
            $keys = array_merge($keys, $result[1]);
        } while ($cursor !== '0');

        return $keys;
    }

    /**
     * Clear all keys matching pattern
     */
    public static function clearByPattern(string $pattern): int
    {
        $keys = self::getKeysByPattern($pattern);
        
        if (empty($keys)) {
            return 0;
        }

        return Redis::del($keys);
    }

    /**
     * Get cache statistics
     */
    public static function getStats(): array
    {
        $info = Redis::info();
        
        return [
            'used_memory' => $info['used_memory_human'] ?? 'N/A',
            'total_keys' => Redis::dbSize(),
            'hits' => $info['keyspace_hits'] ?? 0,
            'misses' => $info['keyspace_misses'] ?? 0,
            'hit_rate' => self::calculateHitRate($info),
        ];
    }

    /**
     * Calculate cache hit rate
     */
    private static function calculateHitRate(array $info): string
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;

        if ($total === 0) {
            return '0%';
        }

        return number_format(($hits / $total) * 100, 2) . '%';
    }
}