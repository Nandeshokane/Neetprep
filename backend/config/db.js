const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If MONGO_URI is the default local one, try connecting; fall back to in-memory
    if (!uri || uri.includes('localhost')) {
      try {
        // Try connecting to local MongoDB first
        if (uri) {
          await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
          console.log(`✅ MongoDB Connected: ${mongoose.connection.host} (local)`);
          return;
        }
      } catch {
        console.log('⚠️  Local MongoDB not available, starting in-memory server...');
      }

      // Fall back to in-memory MongoDB
      console.log('⏳ Downloading & starting in-memory MongoDB (first run may take a minute)...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 120000, // 2 minutes for first download
        },
      });
      uri = mongoServer.getUri();
      console.log('🧪 Using in-memory MongoDB for development');
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Export for cleanup
connectDB.getMongoServer = () => mongoServer;

module.exports = connectDB;
