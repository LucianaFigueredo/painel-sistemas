export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://painel-sistemas.onrender.com"
    : "http://localhost:3001";