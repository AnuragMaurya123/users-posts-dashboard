import mongoose from "mongoose";

// create type for connection object
type connectionObject = {
    isConnected?: number;
}

// create a connection object
const connection: connectionObject = {};

const dbConnect = async () => {
    // check if we have connection to our database
    if (connection.isConnected) {
        console.log("Already Connected to database");
        return;
    }

    // if we don't have connection to our database
    if (!process.env.MONGO_URL) {
        throw new Error("Please define the MONGO_URL environment variable");
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URL);
        connection.isConnected = db.connections[0].readyState;
        console.log("DB Connected Successfully");
    } catch (error) {
        console.error("Connection failed:", error);
        throw error; // Let the application handle the error instead of exiting
    }
};

export default dbConnect;