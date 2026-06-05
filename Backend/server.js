require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

//routes

app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));


        const PORT = process.env.PORT || 5000;
        const  startServer = async () => {
            await connectDB();
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        };

startServer();