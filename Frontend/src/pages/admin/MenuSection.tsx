import React, { useRef, useState, useEffect } from 'react';
import { Trash, Edit, Star } from 'lucide-react';
import { useFoodStore } from '../../store/useFoodStore';
import { useAuthStore } from '../../store/useAuthStore';
import { FoodItem } from '../../types';
import toast from 'react-hot-toast';

const AdminMenuSection: React.FC = () => {
  const { foodItems, isLoading, error, fetchFoodItems, deleteFoodItem, addFoodItem, editFoodItem } = useFoodStore();
  const { user } = useAuthStore();
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [newFoodItem, setNewFoodItem] = useState<FoodItem>({
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);  // Track if it's edit mode or add mode
  const formRef = useRef<HTMLDivElement | null>(null); // Create a reference for the form section

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const handleDeleteFoodItem = async (foodItemId: string) => {
    try {
      await deleteFoodItem(foodItemId);
      toast.success('Food item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete food item');
      console.error(error);
    }
  };

  const handleEditFoodItem = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setNewFoodItem(foodItem);  // Pre-fill form with food item to edit
    setIsEditMode(true);  // Enable edit mode
    // Scroll the form section to the top
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveFoodItem = async () => {
    if (!user || user.role !== 'ADMIN') {
      toast.error('Only admins can manage food items.');
      return;
    }

    try {
      if (isEditMode) {
        // Ensure the food item includes its id while updating
        await editFoodItem(newFoodItem.id, newFoodItem);  // Pass id and the updated food item
        toast.success('Food item updated successfully');
      } else {
        await addFoodItem(newFoodItem);  // Add a new food item if not in edit mode
        toast.success('Food item added successfully');
      }

      setNewFoodItem({ id: '', name: '', description: '', price: 0, image: '', category: '' });
      setIsEditMode(false);
      setSelectedFoodItem(null);
    } catch (error) {
      toast.error('Failed to save food item');
      console.error(error);
    }
  };

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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Menu</h1>

      {/* Add/Edit Food Item Form */}
      <div ref={formRef} className="mb-8 overflow-auto max-h-[500px]">  {/* Make this scrollable */}
        <h3 className="text-xl font-semibold mb-4">{isEditMode ? 'Edit Food Item' : 'Add New Food Item'}</h3>
        
        <input
          type="text"
          placeholder="Name"
          value={newFoodItem.name}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, name: e.target.value })}
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        />
        <textarea
          placeholder="Description"
          value={newFoodItem.description}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, description: e.target.value })}
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        />
        <input
          type="number"
          placeholder="Price"
          value={newFoodItem.price}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, price: parseFloat(e.target.value) })}
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newFoodItem.image}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, image: e.target.value })}
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        />
        <input
          type="text"
          placeholder="Category"
          value={newFoodItem.category}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, category: e.target.value })}
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        />

        <div className="flex gap-4">
          <button 
            onClick={handleSaveFoodItem}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {isEditMode ? 'Update Food Item' : 'Add Food Item'}
          </button>

          {isEditMode && (
            <button
              onClick={() => {
                setIsEditMode(false);
                setNewFoodItem({ id: '', name: '', description: '', price: 0, image: '', category: '' });
                setSelectedFoodItem(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Food Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 overflow-hidden cursor-pointer relative">
              <img
                src={`https://invigorating-kindness-production.up.railway.app/images/${item.image}`}
                alt={`https://invigorating-kindness-production.up.railway.app/images/${item.image}`}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-orange-600"
                  onClick={() => handleEditFoodItem(item)}  // Open edit modal
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
                  onClick={() => handleDeleteFoodItem(item.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash className="h-5 w-5" />
                  Delete
                </button>
                <button
                  onClick={() => handleEditFoodItem(item)}  // Open edit modal
                  className="px-3 py-2 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50"
                >
                  <Edit className="h-5 w-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMenuSection;
