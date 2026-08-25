import 'dotenv/config';
import app from './app.js';
import connectDB from './src/shared/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then boot up the HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});