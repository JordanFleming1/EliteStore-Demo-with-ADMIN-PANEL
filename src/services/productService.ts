import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase/firebase.config';
import { type Product } from '../types';

export class ProductService {
  private collectionName = 'products';

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Get single product
  async getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as Product;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Create new product with enhanced validation
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating product with data:', productData);
      
      // Validate required fields
      if (!productData.name?.trim()) {
        throw new Error('Product name is required');
      }
      if (!productData.description?.trim()) {
        throw new Error('Product description is required');
      }
      if (!productData.category?.trim()) {
        throw new Error('Product category is required');
      }
      
      // Format category: capitalize first letter of each word and limit length
      const formattedCategory = productData.category.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (formattedCategory.length > 50) {
        throw new Error('Category name must be 50 characters or less');
      }

      if (productData.price <= 0) {
        throw new Error('Product price must be greater than 0');
      }
      if (productData.stock < 0) {
        throw new Error('Product stock cannot be negative');
      }
      if (!productData.images || productData.images.length === 0) {
        throw new Error('At least one product image is required');
      }

      // Validate discount price if provided
      if (productData.discountPrice && productData.discountPrice >= productData.price) {
        throw new Error('Discount price must be less than regular price');
      }

      // Prepare product data with defaults
      const processedData = {
        ...productData,
        name: productData.name.trim(),
        description: productData.description.trim(),
        category: formattedCategory, // Use the formatted category
        tags: productData.tags || [],
        features: productData.features || [],
        specifications: productData.specifications || [],
        featured: productData.featured || false,
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        images: productData.images.filter(img => img.trim() !== '')
      };

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...processedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Product created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error instanceof Error ? error : new Error('Failed to create product');
    }
  }

  // Update product with enhanced validation
  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new Error('Product ID is required');
      }

      // Validate fields if they are being updated
      if (productData.name !== undefined && !productData.name?.trim()) {
        throw new Error('Product name cannot be empty');
      }
      if (productData.description !== undefined && !productData.description?.trim()) {
        throw new Error('Product description cannot be empty');
      }
      if (productData.category !== undefined && !productData.category?.trim()) {
        throw new Error('Product category cannot be empty');
      }

      // Format category if being updated
      let formattedCategory;
      if (productData.category !== undefined) {
        formattedCategory = productData.category.trim()
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (formattedCategory.length > 50) {
          throw new Error('Category name must be 50 characters or less');
        }
      }
      if (productData.price !== undefined && productData.price <= 0) {
        throw new Error('Product price must be greater than 0');
      }
      if (productData.stock !== undefined && productData.stock < 0) {
        throw new Error('Product stock cannot be negative');
      }
      if (productData.discountPrice !== undefined && productData.price !== undefined && 
          productData.discountPrice >= productData.price) {
        throw new Error('Discount price must be less than regular price');
      }
      if (productData.images !== undefined && productData.images.length === 0) {
        throw new Error('At least one product image is required');
      }

      // Process the data and remove undefined values
      const processedData: Record<string, unknown> = {};
      
      // Only add fields that have actual values (not undefined)
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined) {
          processedData[key] = value;
        }
      });
      
      // Trim string fields
      if (typeof processedData.name === 'string') processedData.name = processedData.name.trim();
      if (typeof processedData.description === 'string') processedData.description = processedData.description.trim();
      if (formattedCategory !== undefined) processedData.category = formattedCategory;
      if (typeof processedData.brand === 'string') processedData.brand = processedData.brand.trim();
      
      // Filter empty images
      if (Array.isArray(processedData.images)) {
        processedData.images = (processedData.images as string[]).filter((img: string) => img.trim() !== '');
      }

      // Ensure arrays exist
      if (processedData.tags === undefined) processedData.tags = [];
      if (processedData.features === undefined) processedData.features = [];
      if (processedData.specifications === undefined) processedData.specifications = [];

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...processedData,
        updatedAt: serverTimestamp()
      });
      
      console.log('Product updated successfully:', id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error instanceof Error ? error : new Error('Failed to update product');
    }
  }

  // Delete product with enhanced error handling
  async deleteProduct(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new Error('Product ID is required');
      }

      // First check if product exists
      const product = await this.getProduct(id);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Delete associated images from storage (if they're Firebase Storage URLs)
      if (product.images && product.images.length > 0) {
        const deleteImagePromises = product.images.map(async (imageUrl) => {
          try {
            // Only try to delete if it's a Firebase Storage URL
            if (imageUrl.includes('firebase') && imageUrl.includes('storage')) {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
            }
          } catch (error) {
            // Image might not exist or already deleted, log warning but continue
            console.warn('Warning: Could not delete image:', imageUrl, error);
          }
        });
        
        await Promise.allSettled(deleteImagePromises);
      }
      
      // Delete the product document
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      console.log('Product deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error instanceof Error ? error : new Error('Failed to delete product');
    }
  }

  // Bulk delete products
  async bulkDeleteProducts(ids: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const id of ids) {
      try {
        await this.deleteProduct(id);
        results.success.push(id);
      } catch (error) {
        console.error(`Failed to delete product ${id}:`, error);
        results.failed.push(id);
      }
    }
    
    return results;
  }

  // Bulk update stock
  async bulkUpdateStock(updates: { id: string; stock: number }[]): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const update of updates) {
      try {
        await this.updateProduct(update.id, { stock: update.stock });
        results.success.push(update.id);
      } catch (error) {
        console.error(`Failed to update stock for product ${update.id}:`, error);
        results.failed.push(update.id);
      }
    }
    
    return results;
  }

  // Upload product image
  async uploadImage(file: File, productId: string, index: number): Promise<string> {
    try {
      const fileName = `products/${productId}/image_${index}_${Date.now()}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload multiple images
  async uploadImages(files: File[], productId: string): Promise<string[]> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, productId, index)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Firestore doesn't support full-text search, so we'll get all products
      // and filter client-side. For production, consider using Algolia or similar
      const allProducts = await this.getAllProducts();
      
      const searchLower = searchTerm.toLowerCase();
      
      return allProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Get featured products
  async getFeaturedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('rating', '>=', 4.5),
        orderBy('rating', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Fallback to regular products
      const allProducts = await this.getAllProducts();
      return allProducts.slice(0, limitCount);
    }
  }
}

export const productService = new ProductService();