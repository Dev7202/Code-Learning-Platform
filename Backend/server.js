// start the server

import 'dotenv/config';
import app from './src/app.js';
import connectDb from './src/config/connectDB.js';
import { verifyEmailTransporter } from './src/config/mailer.js';

const port = process.env.PORT;

const startServer = async () => {
    try {
        await connectDb();
        await verifyEmailTransporter();
        app.listen(port, () => console.log(`Server running on port ${port} `));
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

