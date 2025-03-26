require('dotenv').config()
const mongoose = require("mongoose");


const connectionDb = async () => {
    try {
        const uri = process.env.DB_URL + process.env.DB_NAME;
        console.log(uri, "uri")
    
        const db = await mongoose.connect(uri);

        console.log("Mongodb connect with database" + " " + db?.connection?.db?.databaseName)

    } catch (error) {
        console.log("Connection error :", error?.message);
        return error;

    }

};

module.exports = connectionDb;