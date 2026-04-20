import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : true;
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`CRM API listening on port ${port}`));
