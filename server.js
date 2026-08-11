import 'dotenv/config';
import express from 'express';
import supabase from './src/config/supabase.js';

const app = express();

const port = process.env.PORT || 3000;


app.use(express.json());

app.get('/',(req,res) =>{
    res.json({
        message : "Server is rinning!"
    });
});

app.listen(port,() => {
    console.log(`Server is runninng on http://localhost:${port}`);
    
});