const app = require("./app");
const config = require("./config/config");

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
