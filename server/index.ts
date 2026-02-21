import { createApp } from './application/index';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

const app = createApp(databaseUrl);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    if (databaseUrl) {
        console.log('Database connected.');
    } else {
        console.log('Running without database connection.');
    }
});
