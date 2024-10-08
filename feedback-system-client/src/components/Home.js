import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    console.log('Home Page');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [review, setReview] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [allReviews, setAllReviews] = useState({}); // Store reviews for each item

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
      setAllReviews((prev) => ({ ...prev, [itemId]: res.data })); // Store reviews in state
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/items', newItem);
      setItems([...items, res.data.item]);
      setNewItem({ name: '', description: '', imageUrl: '' });
    } catch (err) {
      console.error(err);
    }
  };

//   const handleReviewSubmit = async (itemId) => {
//     console.log('Submit review button clicked');
//     console.log('item id : ', itemId);
//     console.log('review : ', review);
//     try {
//       await axios.post(`http://localhost:5000/api/reviews/${itemId}`, { review });
//       setReview('');
//       fetchItems(); // Refresh the list after adding review
//     } catch (err) {
//       console.error(err);
//     }
//   };

const handleReviewSubmit = async (itemId) => {
    try {
        const response = await axios.post('http://localhost:5000/api/reviews', { 
            itemId,  // Send itemId as part of the request body
            review 
        });
        console.log("Review submitted:", response.data); // Log the response for confirmation
        setReview('');
        fetchItems(); // Refresh the list after adding review
    } catch (err) {
        console.error("Error submitting review:", err);
    }
};


  const toggleReviewForm = (itemId) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null); // Close the review form if it is already open
    } else {
      setSelectedItemId(itemId); // Open the review form
    }
  };

  const toggleAllReviews = (itemId) => {
    if (allReviews[itemId]) {
      setAllReviews((prev) => {
        const newState = { ...prev };
        delete newState[itemId]; // Hide reviews if they are already fetched
        return newState;
      });
    } else {
      fetchReviews(itemId); // Fetch reviews if they are not available
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Product Review Platform</h1>
      <div className="mb-6">
        <h2 className="text-xl mb-4">Add a New Product:</h2>
        <div className="flex space-x-4">
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
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item._id} className="border rounded shadow p-4">
            <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-fit: contain mb-4" />
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p>{item.description}</p>
            <p className="mt-2 text-sm text-gray-600">ID: {item._id}</p>
            <div className="mt-2">
              <h4 className="text-sm font-semibold mb-2">Reviews:</h4>
              <p>{item.reviews.length > 0 ? item.reviews.join(', ') : 'No reviews yet'}</p>
              <button
                onClick={() => toggleAllReviews(item._id)}
                className="text-blue-500 mt-2"
              >
                {allReviews[item._id] ? 'Hide All Reviews' : 'Show All Reviews'}
              </button>
              {allReviews[item._id] && (
                <div className="mt-2">
                  {allReviews[item._id].map((review, index) => (
                    <p key={index}>{review}</p>
                  ))}
                </div>
              )}
              <button
                onClick={() => toggleReviewForm(item._id)}
                className="text-blue-500 mt-2"
              >
                {selectedItemId === item._id ? 'Hide Review Form' : 'Add Review'}
              </button>
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
