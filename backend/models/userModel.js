import mongoose from "mongoose"

// Template for defining schema 
// ID is handled by the DB automatically
// const userSchema = mongoose.Schema(
//     {
//         Name: {
//             type: String,
//             required: true,
//         }
//     },
//     { 
//       timestamps: true,
//      }
// );

export const User = mongoose.model('User', { name: String});