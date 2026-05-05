import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import router from './routes/index.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ 1. Correção Global para BigInt (MANDATÓRIO)
BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});
app.use('/api', router);

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
