<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Update user profile
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Authorization check
            if ($request->user()->id != $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'sometimes|string|max:20|nullable',
                'avatar' => 'sometimes|string|nullable',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only(['name', 'email', 'phone']);
            
            // If avatar URL is provided directly (not file upload)
            if ($request->has('avatar') && filter_var($request->avatar, FILTER_VALIDATE_URL)) {
                $updateData['avatar'] = $request->avatar;
            }
            
            $user->update($updateData);
            
            // Generate full avatar URL if it's stored locally
            $avatarUrl = $user->avatar;
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                if (Str::startsWith($user->avatar, 'avatars/')) {
                    $avatarUrl = asset('storage/' . $user->avatar);
                } elseif (Str::startsWith($user->avatar, 'storage/')) {
                    $avatarUrl = asset($user->avatar);
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                     'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                ]
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Update failed',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Upload avatar (image file)
     */
    public function uploadAvatar(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Authorization check
            if ($request->user()->id != $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ], [
                'avatar.required' => 'Please select an image file',
                'avatar.image' => 'The file must be an image',
                'avatar.mimes' => 'Only JPEG, PNG, JPG, and GIF images are allowed',
                'avatar.max' => 'Image size must be less than 5MB',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Delete old avatar if exists and it's a local file
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                $oldPath = $user->avatar;
                if (Str::startsWith($oldPath, 'avatars/')) {
                    $storagePath = 'public/' . $oldPath;
                } elseif (Str::startsWith($oldPath, 'storage/avatars/')) {
                    $storagePath = str_replace('storage/', 'public/', $oldPath);
                } else {
                    $storagePath = $oldPath;
                }
                
                if (Storage::exists($storagePath)) {
                    Storage::delete($storagePath);
                }
            }

            // Store new avatar with unique filename
            $file = $request->file('avatar');
            $filename = 'avatar_' . $user->id . '_' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');

            // Also, before saving, log the update:
             Log::info('Updating user avatar in database:', [
               'user_id' => $user->id,
               'old_avatar' => $user->avatar,
                  'new_avatar' => $path,
]);
            
            // Update user with relative path
            $user->avatar = $path;
            $user->save();
            

               Log::info('User avatar updated:', [
    'user_id' => $user->id,
    'current_avatar' => $user->fresh()->avatar,
]);




            // Generate full URL for response
            $avatarUrl = asset('storage/' . $path);

            return response()->json([
                'status' => 'success',
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => $avatarUrl,
                'avatar' => $avatarUrl, // Add both keys for compatibility
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'avatar' => $avatarUrl,
                ]
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Upload avatar error: ' . $e->getMessage());
            Log::error('Upload avatar trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Upload failed. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get user profile
     */
    public function show(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Authorization check - users can only view their own profile
            if ($request->user()->id != $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Generate full avatar URL
            $avatarUrl = $user->avatar;
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                if (Str::startsWith($user->avatar, 'avatars/')) {
                    $avatarUrl = asset('storage/' . $user->avatar);
                } elseif (Str::startsWith($user->avatar, 'storage/')) {
                    $avatarUrl = asset($user->avatar);
                }
            }

            return response()->json([
                'status' => 'success',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $avatarUrl,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Get user error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user data'
            ], 500);
        }
    }
/**
 * Get farmer profile
 */
public function getFarmerProfile(Request $request, $id)
{
    try {
        $user = User::findOrFail($id);
        
        // Authorization check
        if ($request->user()->id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if user is a farmer
        if ($user->role !== 'farmer') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a farmer'
            ], 400);
        }

        // ✅ FIX: Get avatar URL
        $avatarUrl = $user->avatar ? asset('storage/' . $user->avatar) : null;

        return response()->json([
            'status' => 'success',
            'farmer' => [
                'farm_name' => $user->farm_name,
                'location' => $user->location,
                'phone' => $user->phone,
                'is_verified' => $user->is_verified,
                'verification_status' => $user->verification_status,
                'farm_description' => $user->farm_description,
                'farm_size' => $user->farm_size,
                'specialty' => $user->specialty,
                'avatar' => $avatarUrl, // ✅ ADDED: Include avatar
            ]
        ]);
        
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'User not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Get farmer profile error: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to fetch farmer data'
        ], 500);
    }
}

    /**
     * Update farmer profile
     */
    public function updateFarmerProfile(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Authorization check
            if ($request->user()->id != $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if user is a farmer
            if ($user->role !== 'farmer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is not a farmer'
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'farm_name' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'farm_description' => 'sometimes|string|nullable',
                'farm_size' => 'sometimes|string|max:100',
                'specialty' => 'sometimes|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update farmer-specific fields
            $farmerFields = ['farm_name', 'location', 'phone', 'farm_description', 'farm_size', 'specialty'];
            foreach ($farmerFields as $field) {
                if ($request->has($field)) {
                    $user->$field = $request->$field;
                }
            }

            // When user updates location or phone, reset verification status if not verified
            if (($request->has('location') || $request->has('phone')) && !$user->is_verified) {
                $user->verification_status = 'pending';
            }

            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Farmer profile updated successfully',
                'farmer' => [
                    'farm_name' => $user->farm_name,
                    'location' => $user->location,
                    'phone' => $user->phone,
                    'is_verified' => $user->is_verified,
                    'verification_status' => $user->verification_status,
                    'farm_description' => $user->farm_description,
                    'farm_size' => $user->farm_size,
                    'specialty' => $user->specialty,
                ]
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Update farmer profile error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Update failed',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}