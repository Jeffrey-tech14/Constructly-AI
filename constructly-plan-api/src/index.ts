import express from 'express';
import cors from 'cors';
import planRoutes from './routes/plan';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use('/api/plan', planRoutes);

// Only respond to the exact root path
app.get('/', (req, res) => {
  res.send('🔥 API Root - Constructly Plan API is running!');
});

// For all other unrecognized paths (optional, only if you're serving frontend from backend)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API running at http://192.168.0.100:${PORT}`);
});
