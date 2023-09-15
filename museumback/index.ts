import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import 'dotenv/config'
import errorHandler from './middleware/errorHandler';

const app: express.Application = express();

// adding root level middleware
app.use(cors({
    'credentials': true,
    'origin': '*' // allow to make requests from any origin for now...
}))

app.use(express.json());
app.use('/api/auth', userRouter);
app.get('/', (_req, _res) => {
    _res.send("TypeScript With Express");
});

// handle errors from every endpoint
app.use(errorHandler);
app.listen(process.env.PORT || 4000, () => {
    console.log(`TypeScript with Express on port: ${process.env.PORT || 4000}`);
});