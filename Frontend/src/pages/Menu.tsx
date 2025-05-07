import React, { useEffect, useState } from 'react';
import { PlusCircle, Star, Eye } from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import FoodItemDetail from '../components/FoodItemDetail';
import {imageURL} from '../lib/api';
import { FoodItem } from '../types';
import toast from 'react-hot-toast';

function Menu() {
  const { user } = useAuthStore();
  const { foodItems, categories, isLoading, error, fetchFoodItems, fetchCategories, selectedCategory, setSelectedCategory } = useFoodStore();
  const { addToCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, [fetchFoodItems, fetchCategories]);

  const handleAddToCart = async (foodItemId: string) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      await addToCart(foodItemId);
      toast.success('Item added to cart');
    } catch (err) {
      toast.error('Failed to add item to cart');
      console.error(err);
    }
  };

  const handleViewDetails = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
  };

  // Add a more lenient search function
  const searchWithLeniency = (text: string, query: string): boolean => {
    if (!text || !query) return false;
    
    // Convert both to lowercase for case-insensitive matching
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Direct inclusion check
    if (normalizedText.includes(normalizedQuery)) return true;
    
    // Split the query into words and check if any word is in the text
    const queryWords = normalizedQuery.split(/\s+/);
    return queryWords.some(word => 
      word.length > 2 && normalizedText.includes(word)
    );
  };

  const filteredItems = Array.isArray(foodItems) 
    ? foodItems.filter(item => {
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        
        // If no search query, only filter by category
        if (!searchQuery) return matchesCategory;
        
        // Check if the name or description matches the search query with leniency
        const nameMatches = searchWithLeniency(item.name, searchQuery);
        const descriptionMatches = searchWithLeniency(item.description, searchQuery);
        
        return matchesCategory && (nameMatches || descriptionMatches);
      })
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => fetchFoodItems()} 
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Menu</h1>
      
      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search for food..."
            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              selectedCategory === null
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          
          {Array.isArray(categories) && categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                selectedCategory === category.name
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Food Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="h-48 overflow-hidden cursor-pointer relative"
                onClick={() => handleViewDetails(item)}
              >
                <img
                  src={`${imageURL}${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button className="bg-white rounded-full p-2">
                    <Eye className="h-6 w-6 text-orange-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-orange-600"
                    onClick={() => handleViewDetails(item)}
                  >
                    {item.name}
                  </h3>
                  <span className="text-orange-600 font-bold">₹{item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center mt-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-gray-300 fill-current" />
                  <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="px-3 py-2 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No items found matching your criteria.</p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 text-orange-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      
      {/* Food Item Detail Modal */}
      {selectedFoodItem && (
        <FoodItemDetail 
          foodItem={selectedFoodItem} 
          onClose={() => setSelectedFoodItem(null)} 
        />
      )}
    </div>
  );
}

export default Menu;