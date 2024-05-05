import mongoose from 'mongoose';

const dbConnect = async()=>{
    try {
      const db= await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
      console.log(`database connected ${db}`);
    } catch (error) {
        throw error;
    }
}