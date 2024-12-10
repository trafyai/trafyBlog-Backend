import express from 'express';
import cors from 'cors';
import blogRoutes from './routes/blogRoutes.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Allow your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
    credentials: true
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/blogs', blogRoutes);

export default app;
