const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for frontend

mongoose.connect("mongodb+srv://anarchyMK:XKEFLAhclJN3LxiV@cluster0.mmlxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

  // User Schema & Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// const reviewSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     review: { type: String, required: true },
//     date: { type: Date, default: Date.now },
//   });
  
  const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    reviews: { type: [String], default: []}, // Each item has multiple reviews
    ratings: { type: [Number], default: [] }, // Array of numbers for ratings
    avgRating: { type: Number, default: 0 }, // Average rating as a floating-point number
    }, {timestamps: true} );

const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);

// Register Endpoint
app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      user = new User({
        name,
        email,
        password: hashedPassword,
      });
  
      await user.save();
  
      // Create JWT token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
});

// Login Endpoint
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      // Create JWT token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
});

// Get all items
app.get("/api/items", async (req, res) => {
    try {
      const items = await Item.find();
      res.status(200).json(items);
    } catch (err) {
      res.status(500).send("Server Error");
    }
});

// Add a new item
app.post("/api/items", async (req, res) => {
    const { name, description, imageUrl } = req.body;
  
    try {
      const newItem = new Item({
        name,
        description,
        imageUrl,
        reviews: []
      });
  
      const savedItem = await newItem.save();
      res.json({ msg: "Item added successfully", item: savedItem });
    } catch (err) {
      res.status(500).send("Server Error");
    }
  });

// Post a review for an item
// app.post("/api/reviews/:itemId", authMiddleware, async (req, res) => {
//     const { itemId } = req.params;
//     const { review } = req.body;
  
//     try {
//       const item = await Item.findById(itemId);
//       if (!item) return res.status(404).json({ msg: "Item not found" });
  
//       // Add new review
//       const newReview = {
//         userId: req.user.id, // Retrieved from auth middleware
//         review,
//       };
  
//       item.reviews.push(newReview);
      
//       // Calculate new average rating
//       const totalReviews = item.reviews.length;
//       const totalRating = item.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      
//       // Assuming each review has a `rating` field that is submitted
//       const newRating = (totalRating + (newReview.rating || 0)) / totalReviews;
  
//       item.rating = parseFloat(newRating.toFixed(1)); // Update average rating, limit to 1 decimal place
//       await item.save();
  
//       res.json({ msg: "Review added successfully", rating: item.rating });
//     } catch (err) {
//       res.status(500).send("Server Error");
//     }
//   });

// app.post('/reviews/:itemId', async (req, res) => {
//     console.log("Adding a new review");
//     const { review } = req.body;
//     const itemId = req.params.id;
  
//     try {
//       const item = await Item.findById(itemId);
//       item.reviews.push(review); // Add the new review to the reviews array
//       await item.save();
//       res.status(200).json({ message: 'Review added', item });
//     } catch (err) {
//       res.status(500).json({ message: 'Error adding review', error: err });
//     }
//   });

// Assuming you have already required express, mongoose, and your Item model

app.post('/api/reviews', async (req, res) => {
    console.log("Adding a new review");
    const { itemId, review } = req.body; // Get both itemId and review from request body

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.reviews.push(review); // Add the new review to the reviews array
        await item.save();
        res.status(200).json({ message: 'Review added', item });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ message: 'Error adding review', error: err.message });
    }
});

app.post('/api/ratings', async (req, res) => {
    const { itemId, rating } = req.body;
    const ratingNumber = Number(rating);
    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({message: 'Item not found'});
        }
        item.ratings.push(ratingNumber);
        const totalRatings = item.ratings.length;
        const sumRatings = item.ratings.reduce((sum, curr) => sum + curr, 0);
        item.avgRating = Number((sumRatings / totalRatings).toFixed(1));
        await item.save();
        res.status(200).json({ message: 'Rating added', item });
    } catch (err) {
        console.error("Error adding rating:", err);
        res.status(500).json({ message: 'Error adding rating', error: err.message });
    }
});


  // Get all reviews for a specific item
app.get("/api/items/:itemId/reviews", async (req, res) => {
    const { itemId } = req.params;

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ msg: "Item not found" });
        }
        // Assuming reviews are stored in an array within the Item document
        res.json(item.reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

  
  function authMiddleware(req, res, next) {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Token is not valid" });
    }
}

// Protected Route Example (optional)
app.get("/api/dashboard", (req, res) => {
    res.send("This is a protected route, implement JWT auth here.");
  });
  
  // Start server
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));