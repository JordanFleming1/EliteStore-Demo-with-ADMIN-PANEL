// Utility for handling product image display

// Default "No Image" placeholder - black square with white text
export const noImagePlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDAwMDAwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZSBZZXQuLi48L3RleHQ+Cjwvc3ZnPgo=';

// Helper function to get product image with fallback
export const getProductImageSrc = (product: { images?: string[] }, index: number = 0): string => {
  if (product.images && product.images[index] && product.images[index].trim()) {
    return product.images[index];
  }
  return noImagePlaceholder;
};

// Check if image is the placeholder
export const isPlaceholderImage = (imageSrc: string): boolean => {
  return imageSrc === noImagePlaceholder || imageSrc.startsWith('data:image/svg+xml');
};