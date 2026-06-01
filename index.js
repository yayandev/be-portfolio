require("dotenv").config();

const express = require("express");
const cors = require("cors");

const portfolioRoutes = require("./routes/portfolio");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/portfolio", portfolioRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the YayanDev Portfolio API",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
