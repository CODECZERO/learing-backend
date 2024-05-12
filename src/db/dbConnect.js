import mongoose from 'mongoose';

const dbConnect = async()=>{
    try {
      const db= await mongoose.connect(`${process.env.DB_URL}`);
      console.log(`Database connect on ${process.env.PORT}`);
    } catch (error) {
        throw error;
    }
}

export default dbConnect;