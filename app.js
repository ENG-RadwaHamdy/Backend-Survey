const express = require("express");
const createError = require("http-errors");
const dotenv = require("dotenv").config();
const cors = require("cors");
const adminRoute = require("./Routes/admin.routes");
const userRoute = require("./Routes/user.routes");


const app = express();
app.use(express.json());
require("./initDB")();

app.use(cors());

app.use("/admin", adminRoute); // Admin route
app.use("/user", userRoute); // User route

app.use((req, res, next) => {
    next(createError(404, "not found"));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});