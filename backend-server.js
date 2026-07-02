// Starts the shared Express application for local development and self-hosting.
import app from './server.js';

const backEndPort = parseInt(process.env.BACKEND_PORT || 11966, 10);

app.listen(backEndPort, () => {
    console.log(`Backend server running on http://localhost:${backEndPort}`);
});
