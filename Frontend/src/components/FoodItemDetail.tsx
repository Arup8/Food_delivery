import React, { useEffect, useState } from 'react';
import { Star, PlusCircle, X } from 'lucide-react';
import { FoodItem } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useReviewsStore } from '../store/useReviewsStore';
import {imageURL} from '../lib/api';
import toast from 'react-hot-toast';

interface FoodItemDetailProps {
  foodItem: FoodItem;
  onClose: () => void;
}

const FoodItemDetail: React.FC<FoodItemDetailProps> = ({ foodItem, onClose }) => {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { reviews, isLoading, fetchReviews, addReview } = useReviewsStore();
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  
  useEffect(() => {
    fetchReviews(foodItem.id);
  }, [foodItem.id, fetchReviews]);
  
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      await addToCart(foodItem.id);
      toast.success('Item added to cart');
    } catch (err) {
      toast.error('Failed to add item to cart');
      console.error(err);
    }
  };
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    
    if (!reviewContent.trim()) {
      toast.error('Please enter a review');
      return;
    }
    
    try {
      await addReview(foodItem.id, reviewContent, rating);
      setReviewContent('');
      setRating(5);
      toast.success('Review submitted successfully');
    } catch (err) {
      toast.error('Failed to submit review');
      console.error(err);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{foodItem.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <img
                src={`${imageURL}${foodItem.image}`}
                alt={foodItem.name}
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
            
            <div className="md:w-1/2">
              <p className="text-lg font-bold text-orange-600 mb-2">
                ${foodItem.price.toFixed(2)}
              </p>
              <p className="text-gray-700 mb-4">{foodItem.description}</p>
              <p className="text-sm text-gray-600 mb-4">Category: {foodItem.category}</p>
              
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
            
            {user && (
              <form onSubmit={handleSubmitReview} className="mb-6 bg-gray-50 p-4 rounded-md">
                <h4 className="text-md font-medium text-gray-900 mb-2">Leave a Review</h4>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="review" className="block text-sm text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    id="review"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your thoughts about this item..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Submit Review
                </button>
              </form>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : Array.isArray(reviews) && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{review.userName}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-gray-700">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemDetail; 