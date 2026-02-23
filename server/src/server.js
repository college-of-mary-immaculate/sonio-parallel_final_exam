require("dotenv").config();
const http = require("http");
const bootstrap = require("./bootstrap");

async function startServer() {
  try {
    const httpServer = http.createServer();    
    const app = await bootstrap(httpServer);       
    httpServer.on("request", app);                  

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();