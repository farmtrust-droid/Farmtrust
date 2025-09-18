import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import supabase from "./config/supabase.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(express.json());

// 1️⃣ Connect to MongoDB
connectDB();

// 2️⃣ Health Check
app.get("/", (req, res) => {
  res.send("🚀 FarmTrust API is running...");
});

// 3️⃣ MongoDB connection check
app.get("/test-mongo", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ message: "✅ MongoDB connected" });
  } else {
    res.status(500).json({ error: "❌ MongoDB not connected" });
  }
});

// 4️⃣ Supabase connection check
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("pg_tables").select("*").limit(1);
    if (error) throw error;
    res.json({ message: "✅ Supabase connected", data });
  } catch (err) {
    res.status(500).json({ error: "❌ Supabase connection failed", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
