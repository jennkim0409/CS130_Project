import mongoose from 'mongoose';


const connectDB = async(mongodbURL) =>{
    try{
        await mongoose.connect(mongodbURL);
        console.log('Connected to DB');
    } catch(error){
        console.error('Error connecting to DB:', error);

    }
};

export default connectDB;