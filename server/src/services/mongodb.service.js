import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS settings to prefer IPv4 first and use specific nameservers
try {
  console.log('Configuring DNS: Forcing IPv4 resolution and setting nameservers (8.8.8.8, 1.1.1.1)...');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (dnsError) {
  console.warn('Failed to configure custom DNS servers:', dnsError.message);
}

/**
 * Connect to MongoDB with fallback to local instance for development.
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/codepilot';

  if (!primaryUri) {
    console.warn('MONGO_URI is not configured in environment variables.');
  }

  try {
    console.log('Connecting to MongoDB...');
    const connection = await mongoose.connect(primaryUri || fallbackUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Primary MongoDB Connection Failed: ${error.message}`);
    
    if (primaryUri) {
      console.log(`Attempting local MongoDB fallback (${fallbackUri})...`);
      try {
        const connection = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`MongoDB Connected (Local Fallback): ${connection.connection.host}`);
      } catch (fallbackError) {
        console.error(`Local MongoDB Fallback also failed: ${fallbackError.message}`);
        console.error('Tip: Ensure local MongoDB is running on port 27017 or check network connections.');
      }
    }
  }
};

export default connectDB;