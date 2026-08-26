import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
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
//  BORROWERS PAGE
// =============================
// Borrowers page
app.get('/borrowers', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'borrowers.html'
        )
    );
});


// Create borrower page
app.get('/borrowers/create', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'create-borrower.html'
        )
    );
});


// Borrower details page
app.get('/borrowers/details', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'borrower-detail.html'
        )
    );
});



// =============================
// CREATE BORROWER
// =============================

app.post('/api/borrowers', async (req, res) => {

    try {

        // ==========================================
        // GET ACCESS TOKEN
        // ==========================================

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });

        }


        const accessToken =
            authHeader.replace(
                'Bearer ',
                ''
            ).trim();


        if (!accessToken) {

            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });

        }


        // ==========================================
        // CREATE A SUPABASE CLIENT FOR THIS REQUEST
        // ==========================================

        /*
            IMPORTANT:

            We are NOT using the service-role key.

            We use the normal Supabase key and attach
            the authenticated user's access token.

            This means Supabase/Postgres can evaluate:

                auth.uid()

            and therefore enforce our RLS policies.
        */

        const authenticatedSupabase =
            createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY,
                {
                    global: {
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    },

                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );


        // ==========================================
        // VERIFY THE TOKEN
        // ==========================================

        const {
            data: {
                user
            },
            error: userError
        } = await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                'Authentication error:',
                userError
            );

            return res.status(401).json({
                success: false,
                message: 'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET FORM DATA
        // ==========================================

        const {
            lenderId,
            firstName,
            lastName,
            phone
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !firstName ||
            !lastName ||
            !phone
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please complete all borrower fields.'
            });

        }


        // ==========================================
        // VERIFY LENDER ID
        // ==========================================

        /*
            The browser sends lenderId, but we DO NOT
            blindly trust it.

            We compare it with the authenticated
            Supabase user's ID.
        */

        if (
            lenderId &&
            lenderId !== user.id
        ) {

            return res.status(403).json({
                success: false,
                message: 'You cannot create a borrower for another lender.'
            });

        }


        // ==========================================
        // INSERT BORROWER
        // ==========================================

        /*
            Use the authenticated user's ID.

            We do NOT use the lenderId supplied
            by the browser.

            This is important.

            Supabase RLS will then check:

                lender_id = auth.uid()
        */

        const {
            data: borrower,
            error: borrowerError
        } = await authenticatedSupabase
            .from('borrowers')
            .insert({
                lender_id: user.id,

                first_name:
                    firstName.trim(),

                last_name:
                    lastName.trim(),

                phone:
                    phone.trim()
            })
            .select()
            .single();


        // ==========================================
        // HANDLE DATABASE ERROR
        // ==========================================

        if (borrowerError) {

            console.error(
                'Borrower creation error:',
                borrowerError
            );

            return res.status(500).json({
                success: false,
                message: 'Unable to create borrower.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                'Borrower created successfully.',

            borrower

        });


    } catch (error) {

        console.error(
            'Create borrower error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while creating the borrower.'
        });

    }

});



// =============================
// GET ALL BORROWERS
// =============================

app.get('/api/borrowers', async (req, res) => {

    try {

        // ==========================================
        // GET ACCESS TOKEN
        // ==========================================

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });

        }


        const accessToken =
            authHeader
                .replace('Bearer ', '')
                .trim();


        if (!accessToken) {

            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });

        }


        // ==========================================
        // CREATE AUTHENTICATED SUPABASE CLIENT
        // ==========================================

        const authenticatedSupabase =
            createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY,
                {
                    global: {
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    },

                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );


        // ==========================================
        // VERIFY USER
        // ==========================================

        const {
            data: {
                user
            },
            error: userError
        } = await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                'Authentication error:',
                userError
            );

            return res.status(401).json({
                success: false,
                message: 'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET BORROWERS
        // ==========================================

        /*
            We deliberately DO NOT add:

                .eq('lender_id', user.id)

            here.

            The RLS policy already says:

                lender_id = auth.uid()

            Because this request is authenticated with
            the user's access token, Supabase will only
            return borrowers belonging to this user.
        */

        const {
            data: borrowers,
            error: borrowersError
        } = await authenticatedSupabase
            .from('borrowers')
            .select('*')
            .order('first_name', {
                ascending: true
            });


        if (borrowersError) {

            console.error(
                'Borrowers fetch error:',
                borrowersError
            );

            return res.status(500).json({
                success: false,
                message: 'Unable to load borrowers.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            borrowers: borrowers || []

        });


    } catch (error) {

        console.error(
            'Get borrowers error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading borrowers.'
        });

    }

});


// =============================
// GET SINGLE BORROWER
// =============================

app.get('/api/borrowers/:id', async (req, res) => {

    try {

        // ==========================================
        // GET ACCESS TOKEN
        // ==========================================

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });

        }


        const accessToken =
            authHeader
                .replace('Bearer ', '')
                .trim();


        if (!accessToken) {

            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });

        }


        // ==========================================
        // CREATE AUTHENTICATED SUPABASE CLIENT
        // ==========================================

        const authenticatedSupabase =
            createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY,
                {
                    global: {
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    },

                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );


        // ==========================================
        // VERIFY USER
        // ==========================================

        const {
            data: {
                user
            },
            error: userError
        } = await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                'Authentication error:',
                userError
            );

            return res.status(401).json({
                success: false,
                message: 'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET BORROWER ID
        // ==========================================

        const borrowerId =
            req.params.id;


        if (!borrowerId) {

            return res.status(400).json({
                success: false,
                message: 'Borrower ID is required.'
            });

        }


        // ==========================================
        // GET BORROWER
        // ==========================================

        /*
            Notice that we only search by ID.

            We don't need to manually check:

                lender_id = user.id

            because the SELECT RLS policy handles that.

            If the borrower belongs to another lender,
            Supabase will not return it.
        */

        const {
            data: borrower,
            error: borrowerError
        } = await authenticatedSupabase
            .from('borrowers')
            .select('*')
            .eq('id', borrowerId)
            .single();


        if (borrowerError) {

            console.error(
                'Borrower fetch error:',
                borrowerError
            );

            return res.status(404).json({
                success: false,
                message: 'Borrower not found.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            borrower: borrower

        });


    } catch (error) {

        console.error(
            'Get borrower error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading the borrower.'
        });

    }

});


// =============================
// START SERVER
// =============================

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});