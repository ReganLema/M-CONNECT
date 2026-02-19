<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\TracingService;
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
        // Start tracing
        $spanId = TracingService::startSpan('Get Products List', [
            'user.id' => Auth::id(),
            'has_category_filter' => $request->has('category'),
            'has_search_filter' => $request->has('search'),
        ]);

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

            // End span with success metrics
            TracingService::endSpan($spanId, [
                'products.count' => $products->count(),
                'filter.category' => $request->category ?? 'all',
                'filter.search' => $request->search ? 'yes' : 'no',
                'response.status' => 'success',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Products retrieved successfully',
                'data' => [
                    'products' => $products,
                    'total' => $products->count(),
                ]
            ]);
            
        } catch (\Exception $e) {
            TracingService::recordException($e);
            TracingService::endSpan($spanId, [
                'error' => true,
                'error.message' => $e->getMessage(),
            ]);

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
        // Start tracing
        $spanId = TracingService::startSpan('Create Product', [
            'user.id' => Auth::id(),
            'has_image' => $request->hasFile('image'),
        ]);

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
            TracingService::endSpan($spanId, [
                'validation.failed' => true,
                'validation.errors' => count($validator->errors()),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                TracingService::endSpan($spanId, [
                    'auth.failed' => true,
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated'
                ], 401);
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                TracingService::addEvent('Image Upload Started', [
                    'file.size' => $request->file('image')->getSize(),
                ]);

                $image = $request->file('image');
                $filename = 'product_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('products', $filename, 'public');

                TracingService::addEvent('Image Upload Completed', [
                    'file.path' => $imagePath,
                ]);
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
                'user_id' => Auth::id(),
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

            TracingService::endSpan($spanId, [
                'product.id' => $product->id,
                'product.name' => $product->name,
                'product.category' => $product->category,
                'image.uploaded' => $imagePath !== null,
                'response.status' => 'success',
            ]);

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

            TracingService::recordException($e);
            TracingService::endSpan($spanId, [
                'error' => true,
                'error.message' => $e->getMessage(),
            ]);

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
        // Start tracing
        $spanId = TracingService::startSpan('Get Product Detail', [
            'user.id' => Auth::id(),
            'product.id' => $id,
        ]);

        try {
            // Use where directly instead of scope
            $product = Product::where('user_id', Auth::id())->find($id);

            if (!$product) {
                TracingService::endSpan($spanId, [
                    'product.found' => false,
                    'response.status' => 'not_found',
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }

            TracingService::endSpan($spanId, [
                'product.found' => true,
                'product.name' => $product->name,
                'product.category' => $product->category,
                'response.status' => 'success',
            ]);

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
            TracingService::recordException($e);
            TracingService::endSpan($spanId, [
                'error' => true,
                'error.message' => $e->getMessage(),
            ]);

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
    public function update(Request $request, $id)
    {
        // Start tracing
        $spanId = TracingService::startSpan('Update Product', [
            'user.id' => Auth::id(),
            'product.id' => $id,
            'has_new_image' => $request->hasFile('image'),
        ]);

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
                
                TracingService::endSpan($spanId, [
                    'product.found' => false,
                    'response.status' => 'not_found',
                ]);

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
                
                TracingService::endSpan($spanId, [
                    'validation.failed' => true,
                    'validation.errors' => count($validator->errors()),
                ]);

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
                TracingService::addEvent('New Image Upload', [
                    'old_image' => $product->image ? 'yes' : 'no',
                ]);
                
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
            // Handle image removal (when empty string is sent)
            elseif ($request->input('image') === '' || $request->input('image') === null) {
                Log::info('Image removal requested');
                TracingService::addEvent('Image Removal', [
                    'had_image' => $product->image ? 'yes' : 'no',
                ]);
                
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

            TracingService::endSpan($spanId, [
                'product.updated' => true,
                'fields_changed' => count(array_filter([
                    $request->filled('name'),
                    $request->filled('category'),
                    $request->filled('price'),
                    $request->filled('quantity'),
                    $request->hasFile('image'),
                ])),
                'image.changed' => $request->hasFile('image'),
                'image.removed' => $request->input('image') === '',
                'response.status' => 'success',
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

            TracingService::recordException($e);
            TracingService::endSpan($spanId, [
                'error' => true,
                'error.message' => $e->getMessage(),
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
        // Start tracing
        $spanId = TracingService::startSpan('Delete Product', [
            'user.id' => Auth::id(),
            'product.id' => $id,
        ]);

        try {
            // Use where directly
            $product = Product::where('user_id', Auth::id())->find($id);

            if (!$product) {
                TracingService::endSpan($spanId, [
                    'product.found' => false,
                    'response.status' => 'not_found',
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }

            $productName = $product->name;
            $hadImage = $product->image !== null;

            // Delete image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
                TracingService::addEvent('Image Deleted', [
                    'image_path' => $product->image,
                ]);
            }

            // Delete product
            $product->delete();

            TracingService::endSpan($spanId, [
                'product.deleted' => true,
                'product.name' => $productName,
                'image.deleted' => $hadImage,
                'response.status' => 'success',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            TracingService::recordException($e);
            TracingService::endSpan($spanId, [
                'error' => true,
                'error.message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
