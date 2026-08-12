import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './src/config/supabase.js';

// Create the Express application
const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());


// Serve CSS, JavaScript and other public files
app.use(express.static(path.join(__dirname, 'public')));


// Landing page
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'html', 'index.html')
    );
});


// Register page
app.get('/register', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'html', 'register.html')
    );
});


// Login page - we'll create this next
app.get('/login', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'html', 'login.html')
    );
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});