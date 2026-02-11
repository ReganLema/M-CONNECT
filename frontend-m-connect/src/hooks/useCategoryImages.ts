// src/hooks/useCategoryImages.ts

import { useState, useEffect } from 'react';
import { fetchAllCategoryImages } from '../services/pexels';

export const useCategoryImages = () => {
  const [images, setImages] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const fetchedImages = await fetchAllCategoryImages();
        setImages(fetchedImages);
      } catch (err) {
        setError('Failed to load category images');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  return { images, loading, error };
};