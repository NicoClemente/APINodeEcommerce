import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conexión establecida con MongoDB Atlas');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;