// Backend: server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workroute.js';
import userRoutes from './routes/userRoutes.js';
import formRoutes from './routes/formRoutes.js';
import FormResponseRoutes from './routes/formResponseRoute.js';
import sharedRoutes from './routes/shareRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/formbot', formRoutes);
app.use('/api/formsResponse', FormResponseRoutes);
app.use('/api/forms', sharedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});