import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import museumRouter from './routes/museum';
import categoryRouter from './routes/category';
import itemRouter from './routes/item';
import 'dotenv/config'
import errorHandler from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import formidable from 'express-formidable';

const app: express.Application = express();
// adding root level middleware
app.use(cors({
    'credentials': true,
    'origin': ['http://127.0.0.1:3000', 'https://somevercel23.com', 'http://localhost:3000'] // allow to make requests from any origin for now...
}))

app.use(cookieParser());
app.use(formidable());
app.use('/api/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/museums', museumRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/items', itemRouter);
app.get('/', (_req, _res) => {
    _res.send("Express Oi!");
});

// handle errors from every endpoint
app.use(errorHandler);
app.listen(process.env.PORT || 4000, () => {
    console.log(`TypeScript with Express on port: ${process.env.PORT || 4000}`);
});