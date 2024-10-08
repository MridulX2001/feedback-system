import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [review, setReview] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [allReviews, setAllReviews] = useState({});
  const [showNewItemForm, setShowNewItemForm] = useState(false); // State to toggle form

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/items');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async (itemId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items/${itemId}/reviews`);
      setAllReviews((prev) => ({ ...prev, [itemId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/items', newItem);
      setItems([...items, res.data.item]);
      setNewItem({ name: '', description: '', imageUrl: '' });
      setShowNewItemForm(false); // Hide the form after submission
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (itemId) => {
    try {
      await axios.post('http://localhost:5000/api/reviews', { itemId, review });
      setReview('');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReviewForm = (itemId) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  const toggleAllReviews = (itemId) => {
    if (allReviews[itemId]) {
      setAllReviews((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } else {
      fetchReviews(itemId);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">Product Review Platform</h1>
      
      {/* Button to show/hide the Add New Item form */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowNewItemForm(!showNewItemForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {showNewItemForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {/* Conditionally render the form based on state */}
      {showNewItemForm && (
        <div className="mb-6 text-center">
          <h2 className="text-xl mb-4">Add a New Product:</h2>
          <div className="flex justify-center space-x-4">
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newItem.imageUrl}
              onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
              className="border p-2 rounded"
            />
            <button
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Existing items with reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item._id} className="border rounded shadow p-4">
            <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-contain mb-4" />
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p>{item.description}</p>
            <p className="mt-2 text-sm text-gray-600">ID: {item._id}</p>
            <div className="mt-2">
              <h4 className="text-sm font-semibold mb-2">Reviews:</h4>
              <p>{item.reviews.length > 0 ? item.reviews.join(', ') : 'No reviews yet'}</p>

              {/* Button to show/hide reviews */}
              <button
                onClick={() => toggleAllReviews(item._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
              >
                {allReviews[item._id] ? 'Hide All Reviews' : 'Show All Reviews'}
              </button>

              {/* Render reviews in dropdown when button is clicked */}
              {allReviews[item._id] && (
                <div className="mt-2">
                  {allReviews[item._id].map((review, index) => (
                    <p key={index} className="text-gray-700">{review}</p>
                  ))}
                </div>
              )}

              {/* Add Review button */}
              <button
                onClick={() => toggleReviewForm(item._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 ml-2"
              >
                {selectedItemId === item._id ? 'Hide Review Form' : 'Add Review'}
              </button>

              {/* Show review form */}
              {selectedItemId === item._id && (
                <div className="mt-2">
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="border p-2 w-full rounded mb-2"
                    placeholder="Enter your review"
                  />
                  <button
                    onClick={() => handleReviewSubmit(item._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
