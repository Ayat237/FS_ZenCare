import apiClient from './apiClient';
import { Drug } from '../../types';

/**
 * Search for drugs by name
 * @param query The search query
 * @returns Promise with array of matching drugs
 */
export const searchDrugs = async (query: string): Promise<Drug[]> => {
  try {
    // Log the request for debugging
    console.log('Searching drugs with query:', query);
    
    const response = await apiClient.get('/drugs/search', {
      params: { query }
    });
    
    // Log successful response
    console.log('Drug search response:', response.status);
    
    return response.data;
  } catch (error: any) {
    // More detailed error logging
    console.error('Error searching drugs:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error; // Re-throw to allow component to handle the error
  }
};