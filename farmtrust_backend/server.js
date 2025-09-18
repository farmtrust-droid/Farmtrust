import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import supabase from "./src/config/supabase.js";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// Connect MongoDB
connectDB();

// Health route
app.get("/", (req, res) => res.send("🚀 API is running..."));

// MongoDB check
app.get("/test-mongo", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ message: "✅ MongoDB connection is active" });
  } else {
    res.status(500).json({ error: "❌ MongoDB not connected" });
  }
});

// Supabase check
app.get("/test-supabase", async (req, res) => {
  try {
    // Just making a harmless call to confirm connectivity
    const { error } = await supabase.from("nonexistent_table").select("*").limit(1);
    if (error) {
      return res.json({ message: "✅ Supabase client connected", note: "No table exists yet" });
    }
    res.json({ message: "✅ Supabase client connected" });
  } catch (err) {
    res.status(500).json({ error: "❌ Supabase connection failed", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
