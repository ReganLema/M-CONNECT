<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;


class ProductController extends Controller
{
    /**
     * Display a listing of the products for the authenticated user.
     */
    public function index(Request $request)
    {
        try {
            // Instead of using scopeForCurrentUser, use where directly
            $products = Product::where('user_id', Auth::id())
                ->when($request->category, function ($query, $category) {
                    return $query->where('category', $category);
                })
                ->when($request->search, function ($query, $search) {
                    return $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%");
                    });
                })
                ->latest()
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'category' => $product->category,
                        'price' => (float) $product->price,
                        'formatted_price' => number_format($product->price) . ' TZS',
                        'quantity' => $product->quantity,
                        'location' => $product->location,
                        'description' => $product->description,
                        'image' => $product->image_url,
                        'created_at' => $product->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Products retrieved successfully',
                'data' => [
                    'products' => $products,
                    'total' => $products->count(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated'
                ], 401);
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = 'product_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('products', $filename, 'public');
            }

            // Create product
            $product = Product::create([
                'name' => $request->name,
                'category' => $request->category,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'location' => $request->location,
                'description' => $request->description,
                'image' => $imagePath,
                'user_id' => Auth::id(), // Use Auth::id() directly
            ]);

            // Prepare response data
            $responseData = [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category,
                'price' => (float) $product->price,
                'formatted_price' => number_format($product->price) . ' TZS',
                'quantity' => $product->quantity,
                'location' => $product->location,
                'description' => $product->description,
                'image' => $product->image_url,
                'created_at' => $product->created_at->format('Y-m-d H:i:s'),
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Product created successfully',
                'data' => $responseData
            ], 201);

        } catch (\Exception $e) {
            // If there's an error, delete the uploaded image if it exists
            if (isset($imagePath) && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        try {
            // Use where directly instead of scope
            $product = Product::where('user_id', Auth::id())->find($id);

            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Product retrieved successfully',
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'formatted_price' => number_format($product->price) . ' TZS',
                    'quantity' => $product->quantity,
                    'location' => $product->location,
                    'description' => $product->description,
                    'image' => $product->image_url,
                    'created_at' => $product->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified product in storage.
     */
   // In ProductController.php - UPDATED update method
public function update(Request $request, $id)
{
    Log::info('🔧 UPDATE PRODUCT API CALLED', [
        'product_id' => $id,
        'user_id' => Auth::id(),
        'method' => $request->method(),
        'has_file' => $request->hasFile('image'),
        'all_input' => $request->all(),
    ]);

    try {
        // Find product
        $product = Product::where('user_id', Auth::id())->find($id);

        if (!$product) {
            Log::warning('Product not found', ['product_id' => $id, 'user_id' => Auth::id()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found'
            ], 404);
        }

        Log::info('Found product', [
            'current_name' => $product->name,
            'current_price' => $product->price,
            'current_image' => $product->image,
        ]);

        // Validate - Use 'sometimes' for updates
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed', $validator->errors()->toArray());
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle image update
        $imagePath = $product->image; // Keep existing image by default

        if ($request->hasFile('image')) {
            Log::info('New image uploaded');
            
            // Delete old image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
                Log::info('Deleted old image', ['path' => $product->image]);
            }

            // Upload new image
            $image = $request->file('image');
            $filename = 'product_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $filename, 'public');
            Log::info('Uploaded new image', ['path' => $imagePath]);
        } 
        // FIXED: Handle image removal (when empty string is sent)
        elseif ($request->input('image') === '' || $request->input('image') === null) {
            Log::info('Image removal requested');
            
            // Delete old image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
                Log::info('Deleted image for removal', ['path' => $product->image]);
            }
            
            $imagePath = null; // Set image to null
        }

        // Prepare update data
        $updateData = [
            'name' => $request->filled('name') ? $request->name : $product->name,
            'category' => $request->filled('category') ? $request->category : $product->category,
            'price' => $request->filled('price') ? $request->price : $product->price,
            'quantity' => $request->filled('quantity') ? $request->quantity : $product->quantity,
            'location' => $request->filled('location') ? $request->location : $product->location,
            'description' => $request->filled('description') ? $request->description : $product->description,
            'image' => $imagePath,
        ];

        Log::info('Updating with data:', $updateData);

        // Update product
        $product->update($updateData);

        Log::info('Product updated successfully', [
            'new_name' => $product->name,
            'new_price' => $product->price,
            'new_image' => $product->image,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category,
                'price' => (float) $product->price,
                'formatted_price' => number_format($product->price) . ' TZS',
                'quantity' => $product->quantity,
                'location' => $product->location,
                'description' => $product->description,
                'image' => $product->image_url,
                'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Update failed:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to update product',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Remove the specified product from storage.
     */
    public function destroy($id)
    {
        try {
            // Use where directly
            $product = Product::where('user_id', Auth::id())->find($id);

            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }

            // Delete image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            // Delete product
            $product->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    
}