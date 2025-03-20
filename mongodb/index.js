import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "giat-do",
    });

    isConnected = true;
    console.log("Kết nối MongoDB thành công");
  } catch (error) {
    console.log("Lỗi kết nối MongoDB:", error);
  }
};
