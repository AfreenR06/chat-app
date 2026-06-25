import mongoose from 'mongoose';

async function connectDB() {
    try{
        const mongoUri = process.env.MONGO_URI
        if(!mongoUri){
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        const conn = await mongoose.connect(mongoUri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
        // 1 mean fail 
    
    }
    
}
export default connectDB;