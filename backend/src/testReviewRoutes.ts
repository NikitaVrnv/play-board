import express, { Request, Response } from "express";
import { reviewController } from "./controllers/reviewController";

// This is a standalone test file to confirm the review controller functions work

const app = express();
app.use(express.json());

// Get the controller functions directly
const { 
  getAllReviews, 
  getReviewById, 
  createReview, 
  updateReview, 
  deleteReview, 
  getUserReviews 
} = reviewController;

// Test if we can access these functions
console.log("Controller functions check:");
console.log("- getAllReviews:", typeof getAllReviews === 'function' ? "✅" : "❌");
console.log("- getReviewById:", typeof getReviewById === 'function' ? "✅" : "❌");
console.log("- createReview:", typeof createReview === 'function' ? "✅" : "❌");
console.log("- updateReview:", typeof updateReview === 'function' ? "✅" : "❌");
console.log("- deleteReview:", typeof deleteReview === 'function' ? "✅" : "❌");
console.log("- getUserReviews:", typeof getUserReviews === 'function' ? "✅" : "❌");

// Basic test route
app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Test route works" });
});

// Mount the review routes directly
app.get("/reviews", getAllReviews);
app.get("/reviews/:id", getReviewById);
app.post("/reviews", createReview);
app.put("/reviews/:id", updateReview);
app.delete("/reviews/:id", deleteReview);
app.get("/reviews/user/:userId?", getUserReviews);

// Start a test server
const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});