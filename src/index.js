
import "./config/env.js"
import connectDB from "./config/db.js";
import app from "./app.js";


// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is listening on port ${PORT}`);
});
