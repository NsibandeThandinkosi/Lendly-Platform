import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './src/config/supabase.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// MIDDLEWARE
// =============================

app.use(express.json());

// Serve files from src/public
app.use(express.static(path.join(__dirname, 'src', 'public')));


// =============================
// PAGES
// =============================

// Landing page
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'src', 'public', 'html', 'index.html')
    );
});

// Register page
app.get('/register', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'src', 'public', 'html', 'register.html')
    );
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'src', 'public', 'html', 'login.html')
    );
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'src', 'public', 'html', 'dashboard.html')
    );
});


// =============================
// REGISTER
// =============================

app.post('/api/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            businessName,
            registrationNumber,
            province,
            businessType,
            password
        } = req.body;

        // Basic validation
        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !businessName ||
            !registrationNumber ||
            !province ||
            !businessType ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required fields.'
            });
        }

        // Create user in Supabase Authentication
        const { data: authData, error: authError } =
            await supabase.auth.signUp({
                email: email,
                password: password
            });

        if (authError) {
            return res.status(400).json({
                success: false,
                message: authError.message
            });
        }

        const user = authData.user;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Unable to create user account.'
            });
        }

        // Store additional user information
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                business_name: businessName,
                registration_number: registrationNumber,
                province: province,
                business_type: businessType,
                verification_status: 'pending'
            });

        if (profileError) {
            console.error('Profile error:', profileError);

            return res.status(500).json({
                success: false,
                message: 'Account was created, but your profile could not be saved.'
            });
        }

        // Successful registration
        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Your business is pending verification.'
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong while creating your account.'
        });
    }
});


// =============================
// LOGIN
// =============================

app.post('/api/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Login through Supabase Auth
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Get profile information
        const { data: profile, error: profileError } =
            await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

        if (profileError) {
            console.error('Profile lookup error:', profileError);

            return res.status(500).json({
                success: false,
                message: 'Unable to load your profile.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: {
                id: data.user.id,
                email: data.user.email,
                profile: profile
            },
            session: data.session
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong while logging in.'
        });
    }
});


// =============================
// START SERVER
// =============================

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});