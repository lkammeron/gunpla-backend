import mongoose from 'mongoose';
import express from 'express';
import gundamRouter from './routes/gundams.js';

try {
    const app = express();
    await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`,
        {serverSelectionTimeoutMS:3000
        });

    app.use((req, res, next) => {
        if (req.header('accept') !== 'application/json' && req.method !== 'OPTIONS') {
            res.status(406);
            res.json({error: 'Alleen JSON is allowed as Accept Header'});
            return;
        }
        next();
    });

    //Middleware to support application/json Content-type
    app.use(express.json());

    //Middleware to support x-www-form-urlencoded
    app.use(express.urlencoded({extended:true}));

    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.use('/gunpla/', gundamRouter);

    app.listen(process.env.EXPRESS_PORT, () => {
        console.log(`Server is listening on port ${process.env.EXPRESS_PORT}`);
    });

} catch (e) {
    console.log("Database connection failed");
}