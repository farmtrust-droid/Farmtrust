import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; 
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import supabase from './config/supabase.js';
import routes from './routes/index.js';
import { swaggerUi, swaggerDocs } from './swagger.js';

dotenv.config();
const app = express();

// Add helmet with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://zfhaymmfpmydesvfhxlr.supabase.co', 'http://localhost:5000'],
        frameAncestors: ["'self'"], // Proper place for frame-ancestors
        scriptSrc: ["'self'", "'unsafe-inline'"], 
        styleSrc: ["'self'", "'unsafe-inline'"], 
      },
    },
  })
);

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/', (req, res) => res.json({ message: '🚀 FarmTrust API is running...' }));

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));