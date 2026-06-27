// const express = require('express');
import express from 'express';
import cors from 'cors';
import "dotenv/config"; 
import fs from "fs";
import path from "path"
import User from "./models/User.model.js";
import Message from "./models/message.model.js";
import connectDB from "./lib/db.js";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhook.js"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.rourte.js"
import { clerkMiddleware } from '@clerk/express'

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // Default to localhost if not set
const publicDir = path.join(process.cwd(), 'public');
app.use("/api/webhooks/clerk", express.raw({type: "application/json"}), clerkWebhook);

app.use(express.json())
app.use(cors({origin:FRONTEND_URL, credentials: true }))   
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    // const {message,image,video} = req.body;
    res.status(200).json({message:"Server is healthy"});
} 
)
app.use("/api/auth", authRoutes)
app.get("/test-user", async (req, res) => {
    try {
        const user = await User.create({
            clerkId: "123",
            email: "test@gmail.com",
            fullName: "Test User"
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
if(fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get("/{*any}", (req, res, next) => {
        res.sendFile(path.join(publicDir, 'index.html'), (err) => next(err));
    });

    
}
app.listen(PORT, () =>  {
    connectDB();
    
    console.log(`Server is running on port ${PORT}`)
});
