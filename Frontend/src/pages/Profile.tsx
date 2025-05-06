import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { address } from '../lib/api';
import { Address } from '../types';
import toast from 'react-hot-toast';

function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    isDefault: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await address.getByUser(user.id);
      const validAddresses = Array.isArray(response.data) ? response.data : [];
      setAddresses(validAddresses);

      if (validAddresses.length > 0) {
        const defaultAddress = validAddresses.find(a => a.isDefault) || validAddresses[0];
        setNewAddress({ ...defaultAddress });
      }
    } catch {
      toast.error('Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchAddresses();
    }
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    if (!user || addresses.length === 0) return;
    try {
      setIsLoading(true);
      await address.update(newAddress, addresses[0].id, user.id);
      setIsEditing(false);
      fetchAddresses();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await address.add(newAddress, user.id);
      setIsAddingAddress(false);
      fetchAddresses();
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        isDefault: true,
      });
      toast.success('Address added successfully');
    } catch {
      toast.error('Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <button onClick={handleLogout} className="text-red-600 hover:underline flex items-center space-x-1">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* Personal Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <User className="text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            {addresses.length > 0 && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm border border-orange-600 text-orange-600 rounded hover:bg-orange-50"
              >
                Edit
              </button>
            )}
            {isEditing && (
              <div className="space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p>{user.username}</p>
            <p>{user.email}</p>
            <p className="capitalize">{user.role}</p>
          </div>
        </div>

        {/* Address Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <MapPin className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Your Address</h2>
            </div>
            {addresses.length === 0 && !isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                Add Address
              </button>
            )}
          </div>

          {(isAddingAddress || isEditing) && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {['street', 'city', 'state', 'zipCode', 'country', 'phone'].map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    value={newAddress[field as keyof Address] || ''}
                    onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                    className="border px-3 py-2 rounded w-full"
                  />
                ))}
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="mr-2"
                />
                <label>Set as default address</label>
              </div>
              {!isEditing && (
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              )}
            </div>
          )}

          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border p-4 rounded">
                  {addr.isDefault && (
                    <span className="text-green-700 text-xs bg-green-100 px-2 py-1 rounded mb-2 inline-block">
                      Default
                    </span>
                  )}
                  <p className="font-semibold">{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p>{addr.country}</p>
                  <p>Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 italic py-4">You haven't added any addresses yet.</p>
          )}
        </div>

        {/* Orders */}
        <div className="p-6">
          <div
            onClick={() => navigate('/orders')}
            className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-md"
          >
            <div className="bg-purple-100 p-2 rounded-full">
              <ShoppingBag className="text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium">Your Orders</h2>
              <p className="text-sm text-gray-500">Check your past orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
