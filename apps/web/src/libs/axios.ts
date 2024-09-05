import axios from "axios";

// @todo - use dotenv
export const serverInstance = axios.create({
  baseURL: "http://localhost:3000",
});
