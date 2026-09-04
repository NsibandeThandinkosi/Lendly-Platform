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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


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
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET BORROWERS
        // ==========================================

        const {
            data: borrowers,
            error: borrowersError
        } =
            await authenticatedSupabase
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
                message:
                    'Unable to load borrowers.'
            });

        }


        // ==========================================
        // GET LOANS
        // ==========================================

        const {
            data: loans,
            error: loansError
        } =
            await authenticatedSupabase
                .from('loans')
                .select('*')
                .order('created_at', {
                    ascending: false
                });


        if (loansError) {

            console.error(
                'Loans fetch error:',
                loansError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to load borrower loans.'
            });

        }


        // ==========================================
        // ATTACH LOANS TO BORROWERS
        // ==========================================

        const borrowersWithLoans =
            (borrowers || []).map(
                borrower => {

                    const borrowerLoans =
                        (loans || [])
                            .filter(
                                loan =>
                                    loan.borrower_id ===
                                    borrower.id
                            )
                            .map(
                                loan => ({

                                    id:
                                        loan.id,

                                    status:
                                        loan.status,

                                    amount:
                                        Number(
                                            loan.principal_amount
                                        ),

                                    totalRepayment:
                                        Number(
                                            loan.total_repayment
                                        ),

                                    monthlyPayment:
                                        Number(
                                            loan.monthly_payment
                                        ),

                                    date:
                                        loan.start_date,

                                    nextDueDate:
                                        loan.next_due_date,

                                    interestRate:
                                        Number(
                                            loan.interest_rate
                                        ),

                                    durationMonths:
                                        loan.duration_months

                                })
                            );


                    return {

                        ...borrower,

                        loans:
                            borrowerLoans

                    };

                }
            );


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            borrowers:
                borrowersWithLoans

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


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
                message:
                    'Your session is invalid or expired.'
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
                message:
                    'Borrower ID is required.'
            });

        }


        // ==========================================
        // GET BORROWER
        // ==========================================

        const {
            data: borrower,
            error: borrowerError
        } =
            await authenticatedSupabase
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
                message:
                    'Borrower not found.'
            });

        }


        // ==========================================
        // GET LOANS FOR BORROWER
        // ==========================================

        const {
            data: loans,
            error: loansError
        } =
            await authenticatedSupabase
                .from('loans')
                .select('*')
                .eq('borrower_id', borrowerId)
                .order('created_at', {
                    ascending: false
                });


        if (loansError) {

            console.error(
                'Borrower loans fetch error:',
                loansError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to load borrower loans.'
            });

        }


        // ==========================================
        // FORMAT LOANS FOR FRONTEND
        // ==========================================

        const formattedLoans =
            (loans || []).map(
                loan => ({

                    id:
                        loan.id,

                    status:
                        loan.status,

                    originalAmount:
                        Number(
                            loan.principal_amount
                        ),

                    principalAmount:
                        Number(
                            loan.principal_amount
                        ),

                    totalInterest:
                        Number(
                            loan.total_interest
                        ),

                    totalRepayment:
                        Number(
                            loan.total_repayment
                        ),

                    monthlyPayment:
                        Number(
                            loan.monthly_payment
                        ),

                    interestRate:
                        Number(
                            loan.interest_rate
                        ),

                    durationMonths:
                        loan.duration_months,

                    serviceFee:
                        Number(
                            loan.monthly_service_fee
                        ),

                    initiationFee:
                        Number(
                            loan.initiation_fee
                        ),

                    date:
                        loan.start_date,

                    nextDueDate:
                        loan.next_due_date,

                    settlementDate:
                        loan.settlement_date

                })
            );


        // ==========================================
        // ATTACH LOANS TO BORROWER
        // ==========================================

        const borrowerWithLoans = {

            ...borrower,

            loans:
                formattedLoans

        };


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            borrower:
                borrowerWithLoans

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

// ==============================
// Create loan page
// ==============================
app.get('/loans/create', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'create-loan.html'
        )
    );
});

// =============================
// CREATE LOAN
// =============================

app.post('/api/loans', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


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
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET FORM DATA
        // ==========================================

        const {
            borrowerId,
            principalAmount,
            durationMonths,
            interestRate,
            monthlyServiceFee,
            initiationFee,
            totalInterest,
            totalRepayment,
            monthlyPayment
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!borrowerId) {

            return res.status(400).json({
                success: false,
                message:
                    'Borrower ID is required.'
            });

        }


        if (
            principalAmount === undefined ||
            Number(principalAmount) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Please enter a valid loan amount.'
            });

        }


        if (
            durationMonths === undefined ||
            Number(durationMonths) < 1 ||
            Number(durationMonths) > 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Loan duration must be between 1 and 5 months.'
            });

        }


        if (
            interestRate === undefined ||
            Number(interestRate) < 0 ||
            Number(interestRate) > 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Interest rate must be between 0% and 5%.'
            });

        }


        if (
            monthlyServiceFee === undefined ||
            Number(monthlyServiceFee) < 0 ||
            Number(monthlyServiceFee) > 60
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Monthly service fee must be between R0 and R60.'
            });

        }


        // ==========================================
        // VERIFY BORROWER
        // ==========================================

        /*
            We explicitly verify that the borrower
            belongs to the authenticated lender.

            RLS also protects this relationship,
            but checking here lets us return a useful
            error instead of a generic database error.
        */

        const {
            data: borrower,
            error: borrowerError
        } =
            await authenticatedSupabase
                .from('borrowers')
                .select('id, lender_id, first_name, last_name')
                .eq('id', borrowerId)
                .single();


        if (borrowerError || !borrower) {

            console.error(
                'Borrower lookup error:',
                borrowerError
            );

            return res.status(404).json({
                success: false,
                message:
                    'Borrower not found or does not belong to you.'
            });

        }


        // ==========================================
        // CHECK FOR EXISTING ACTIVE LOAN
        // ==========================================

        /*
            Business rule: a borrower cannot have
            more than one active loan at a time.
        */

        const {
            data: activeLoans,
            error: activeLoanError
        } =
            await authenticatedSupabase
                .from('loans')
                .select('id')
                .eq('borrower_id', borrowerId)
                .eq('status', 'active');


        if (activeLoanError) {

            console.error(
                'Active loan check error:',
                activeLoanError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to verify existing loans.'
            });

        }


        if (
            activeLoans &&
            activeLoans.length > 0
        ) {

            return res.status(409).json({
                success: false,
                message:
                    'This borrower already has an active loan.'
            });

        }

        // ==========================================
        // COMPUTE DATES
        // ==========================================

        const startDate =
            new Date();

        const nextDueDate =
            new Date(startDate);

        nextDueDate.setMonth(
            nextDueDate.getMonth() + 1
        );


        // ==========================================
        // CREATE LOAN
        // ==========================================

        /*
            IMPORTANT:

            We do NOT accept lenderId from the browser.

            The lender ID comes directly from the
            authenticated Supabase user.
        */

        const {
            data: loan,
            error: loanError
        } =
            await authenticatedSupabase
                .from('loans')
                .insert({

                    lender_id:
                        user.id,

                    borrower_id:
                        borrowerId,

                    principal_amount:
                        Number(principalAmount),

                    duration_months:
                        Number(durationMonths),

                    interest_rate:
                        Number(interestRate),

                    monthly_service_fee:
                        Number(monthlyServiceFee),

                    initiation_fee:
                        Number(initiationFee || 0),

                    total_interest:
                        Number(totalInterest || 0),

                    total_repayment:
                        Number(totalRepayment),

                    monthly_payment:
                        Number(monthlyPayment),

                    remaining_amount:
                        Number(totalRepayment),

                    status:
                        'active',

                    start_date:
                        startDate
                            .toISOString()
                            .split('T')[0],

                    next_due_date:
                        nextDueDate
                            .toISOString()
                            .split('T')[0]

                })
                .select()
                .single();


        // ==========================================
        // DATABASE ERROR
        // ==========================================

        if (loanError) {

            console.error(
                'Loan creation error:',
                loanError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to create loan.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                'Loan created successfully.',

            loan

        });


    } catch (error) {

        console.error(
            'Create loan error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while creating the loan.'
        });

    }

});


// =============================
// GET LOANS FOR BORROWER
// =============================

app.get('/api/loans', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET BORROWER ID
        // ==========================================

        const borrowerId =
            req.query.borrowerId;


        if (!borrowerId) {

            return res.status(400).json({
                success: false,
                message:
                    'Borrower ID is required.'
            });

        }


        // ==========================================
        // GET LOANS
        // ==========================================

        /*
            We don't need to manually add:

                lender_id = user.id

            because the SELECT RLS policy handles it.

            RLS guarantees that only this lender's
            loans can be returned.
        */

        const {
            data: loans,
            error: loansError
        } =
            await authenticatedSupabase
                .from('loans')
                .select('*')
                .eq('borrower_id', borrowerId)
                .order('created_at', {
                    ascending: false
                });


        if (loansError) {

            console.error(
                'Loans fetch error:',
                loansError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to load loans.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            loans:
                loans || []

        });


    } catch (error) {

        console.error(
            'Get loans error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading loans.'
        });

    }

});

// =============================
// // LOANS PAGE
// =============================
app.get('/loans', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'loans.html'
        )
    );
});


// =============================
// GET ALL ACTIVE LOANS (loans dashboard)
// =============================

app.get('/api/loans/active', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }

        // ==========================================
        // MARK OVERDUE LOANS
        // ==========================================

        const {
            error: overdueError
        } = await authenticatedSupabase
            .rpc('mark_overdue_loans');

        if (overdueError) {

            console.error(
                'Mark overdue loans error:',
                overdueError
            );

        }


        // ==========================================
        // GET ACTIVE LOANS WITH BORROWER INFO
        // ==========================================

        /*
            RLS restricts this to loans belonging
            to the authenticated lender.

            We join borrowers so we can show the
            borrower's name and phone number without
            a second round trip per loan.
        */

        const {
            data: loans,
            error: loansError
        } =
            await authenticatedSupabase
                .from('loans')
                .select(`
                    id,
                    principal_amount,
                    remaining_amount,
                    monthly_payment,
                    next_due_date,
                    start_date,
                    duration_months,
                    interest_rate,
                    status,
                    borrower_id,
                    borrowers (
                        first_name,
                        last_name,
                        phone
                    )
                `)
                .in('status', ['active', 'overdue'])
                .order('next_due_date', {
                    ascending: true
                });


        if (loansError) {

            console.error(
                'Active loans fetch error:',
                loansError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to load loans.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            loans:
                loans || []

        });


    } catch (error) {

        console.error(
            'Get active loans error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading loans.'
        });

    }

});


// =============================
// // LOAN DETAILS PAGE
// =============================
app.get('/loans/details', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'loan-details.html'
        )
    );
});

// =============================
// GET SINGLE LOAN (with borrower)
// =============================

app.get('/api/loans/:id', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET LOAN
        // ==========================================

        const loanId =
            req.params.id;


        const {
            data: loan,
            error: loanError
        } =
            await authenticatedSupabase
                .from('loans')
                .select(`
                    id,
                    principal_amount,
                    remaining_amount,
                    monthly_payment,
                    interest_rate,
                    duration_months,
                    status,
                    start_date,
                    next_due_date,
                    borrower_id,
                    borrowers (
                        first_name,
                        last_name,
                        phone
                    )
                `)
                .eq('id', loanId)
                .single();


        if (
            loanError ||
            !loan
        ) {

            console.error(
                'Loan lookup error:',
                loanError
            );

            return res.status(404).json({
                success: false,
                message:
                    'Loan not found.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            loan

        });


    } catch (error) {

        console.error(
            'Get loan error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading the loan.'
        });

    }

});


// =============================
// RECORD MONTHLY PAYMENT
// =============================

app.patch('/api/loans/:id/payment', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // CALL DATABASE FUNCTION
        // ==========================================

        const loanId =
            req.params.id;


        const {
            data,
            error
        } =
            await authenticatedSupabase
                .rpc(
                    'record_loan_payment',
                    {
                        p_loan_id:
                            loanId
                    }
                );


        if (error) {

            console.error(
                'Record payment RPC error:',
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    'Unable to record payment.'
            });

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                data.loan.status === 'settled'
                    ? 'Final payment recorded. Loan settled successfully.'
                    : 'Monthly payment recorded successfully.',

            loan:
                data.loan,

            installment:
                data.installment

        });


    } catch (error) {

        console.error(
            'Record payment error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while recording the payment.'
        });

    }

});


// =============================
// CLEAR LOAN
// =============================

app.patch('/api/loans/:id/clear', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // CALL DATABASE FUNCTION
        // ==========================================

        const loanId =
            req.params.id;


        const {
            data,
            error
        } =
            await authenticatedSupabase
                .rpc(
                    'clear_loan',
                    {
                        p_loan_id:
                            loanId
                    }
                );


        if (error) {

            console.error(
                'Clear loan RPC error:',
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    'Unable to clear loan.'
            });

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                'Loan cleared successfully.',

            loan:
                data.loan,

            installment:
                data.installment

        });


    } catch (error) {

        console.error(
            'Clear loan error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while clearing the loan.'
        });

    }

});




// ============================================================
// COLLECTIONS
// ============================================================
app.get('/collections', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'collections.html'
        )
    );
});

// ============================================================
// GET COLLECTIONS
// ============================================================

app.get('/api/collections', async (req, res) => {

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
                message:
                    'Authentication required.'
            });

        }


        const accessToken =
            authHeader
                .replace('Bearer ', '')
                .trim();


        if (!accessToken) {

            return res.status(401).json({
                success: false,
                message:
                    'Invalid authentication token.'
            });

        }


        // ==========================================
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                'Collections authentication error:',
                userError
            );


            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET SETTLED LOANS
        // ==========================================

        /*
            Only settled loans belong in Collections.

            Valid loan statuses in your database are:

                active
                overdue
                settled

            Therefore we only retrieve:

                status = 'settled'
        */

        const {
            data: loans,
            error: loansError
        } =
            await authenticatedSupabase
                .from('loans')
                .select(`
                    id,
                    lender_id,
                    borrower_id,
                    principal_amount,
                    total_repayment,
                    settlement_date,
                    status,
                    borrowers (
                        id,
                        first_name,
                        last_name,
                        phone
                    )
                `)
                .eq('status', 'settled')
                .order(
                    'settlement_date',
                    {
                        ascending: false
                    }
                );


        if (loansError) {

            console.error(
                'Collections database error:',
                loansError
            );


            return res.status(500).json({
                success: false,
                message:
                    'Unable to load collections.'
            });

        }


        // ==========================================
        // FORMAT DATA FOR FRONTEND
        // ==========================================

        const collections =
            (loans || []).map(
                function(loan) {

                    const borrower =
                        loan.borrowers;


                    const firstName =
                        borrower?.first_name || "";


                    const lastName =
                        borrower?.last_name || "";


                    return {

                        id:
                            loan.id,

                        borrower: {

                            name:
                                `${firstName} ${lastName}`.trim(),

                            phone:
                                borrower?.phone || ""

                        },

                        totalPaid:
                            Number(
                                loan.total_repayment
                            ),

                        fulfilledDate:
                            loan.settlement_date,

                        originalLoan:
                            Number(
                                loan.principal_amount
                            )

                    };

                }
            );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            collections:
                collections

        });

    }
    catch (error) {

        console.error(
            'Get collections error:',
            error
        );


        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading collections.'
        });

    }

});



// ============================================================
// DELETE COLLECTION
// ============================================================

app.delete('/api/collections/:id', async (req, res) => {

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
                message:
                    'Authentication required.'
            });

        }


        const accessToken =
            authHeader
                .replace('Bearer ', '')
                .trim();


        if (!accessToken) {

            return res.status(401).json({
                success: false,
                message:
                    'Invalid authentication token.'
            });

        }


        // ==========================================
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET COLLECTION ID
        // ==========================================

        const collectionId =
            req.params.id;


        if (!collectionId) {

            return res.status(400).json({
                success: false,
                message:
                    'Collection ID is required.'
            });

        }


        // ==========================================
        // DELETE SETTLED LOAN
        // ==========================================

        const {
            data: deletedLoans,
            error: deleteError
        } =
            await authenticatedSupabase
                .from('loans')
                .delete()
                .eq('id', collectionId)
                .eq('status', 'settled')
                .select('id');


        if (deleteError) {

            console.error(
                'Delete collection error:',
                deleteError
            );


            return res.status(500).json({
                success: false,
                message:
                    'Unable to delete collection.'
            });

        }


        // ==========================================
        // CHECK WHETHER LOAN EXISTED
        // ==========================================

        if (
            !deletedLoans ||
            deletedLoans.length === 0
        ) {

            return res.status(404).json({
                success: false,
                message:
                    'Collection not found.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                'Collection deleted successfully.'

        });

    }
    catch (error) {

        console.error(
            'Delete collection error:',
            error
        );


        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while deleting the collection.'
        });

    }

});


// collections details page
app.get('/collections/details', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'collection-details.html'
        )
    );
});

// =============================
// GET SINGLE COLLECTION (settled loan + installments)
// =============================

app.get('/api/collections/:id', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET SETTLED LOAN
        // ==========================================

        const loanId =
            req.params.id;


        const {
            data: loan,
            error: loanError
        } =
            await authenticatedSupabase
                .from('loans')
                .select(`
                    id,
                    principal_amount,
                    total_repayment,
                    start_date,
                    settlement_date,
                    status,
                    borrower_id,
                    borrowers (
                        first_name,
                        last_name,
                        phone
                    )
                `)
                .eq('id', loanId)
                .eq('status', 'settled')
                .single();


        if (
            loanError ||
            !loan
        ) {

            console.error(
                'Collection lookup error:',
                loanError
            );

            return res.status(404).json({
                success: false,
                message:
                    'Collection not found.'
            });

        }


        // ==========================================
        // GET PAYMENT HISTORY
        // ==========================================

        const {
            data: installments,
            error: installmentsError
        } =
            await authenticatedSupabase
                .from('loan_installments')
                .select('id, installment_number, amount_paid, paid_date')
                .eq('loan_id', loanId)
                .order('installment_number', {
                    ascending: true
                });


        if (installmentsError) {

            console.error(
                'Installments fetch error:',
                installmentsError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to load payment history.'
            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            loan,

            installments:
                installments || []

        });


    } catch (error) {

        console.error(
            'Get collection error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading the collection.'
        });

    }

});



// ============================================================
// DASHBOARD
// ============================================================

// collections details page
app.get('/dashboard', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'dashboard.html'
        )
    );
});


// ============================================================
// DASHBOARD DATA
// ============================================================

app.get('/api/dashboard', async (req, res) => {

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
        // AUTHENTICATED SUPABASE CLIENT
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
        } =
            await authenticatedSupabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                'Dashboard authentication error:',
                userError
            );


            return res.status(401).json({
                success: false,
                message:
                    'Your session is invalid or expired.'
            });

        }


        // ==========================================
        // GET USER PROFILE
        // ==========================================

        const {
            data: profile,
            error: profileError
        } =
            await authenticatedSupabase
                .from('profiles')
                .select(
                    'first_name, last_name'
                )
                .eq(
                    'id',
                    user.id
                )
                .single();


        if (
            profileError &&
            profileError.code !== 'PGRST116'
        ) {

            console.error(
                'Dashboard profile error:',
                profileError
            );

        }


        // ==========================================
        // GET BORROWERS
        // ==========================================

        const {
            data: borrowers,
            error: borrowersError
        } =
            await authenticatedSupabase
                .from('borrowers')
                .select(
                    'id, first_name, last_name, phone'
                )
                .eq(
                    'lender_id',
                    user.id
                );


        if (borrowersError) {

            console.error(
                'Dashboard borrowers error:',
                borrowersError
            );


            return res.status(500).json({
                success: false,
                message:
                    'Unable to load dashboard borrowers.'
            });

        }


        const borrowerList =
            borrowers || [];


        // ==========================================
        // GET LOANS
        // ==========================================

        const {
            data: loans,
            error: loansError
        } =
            await authenticatedSupabase
                .from('loans')
                .select(`
                    id,
                    lender_id,
                    borrower_id,
                    principal_amount,
                    total_repayment,
                    remaining_amount,
                    status,
                    start_date,
                    next_due_date,
                    created_at,
                    borrowers (
                        id,
                        first_name,
                        last_name,
                        phone
                    )
                `)
                .eq(
                    'lender_id',
                    user.id
                )
                .order(
                    'created_at',
                    {
                        ascending: false
                    }
                );


        if (loansError) {

            console.error(
                'Dashboard loans error:',
                loansError
            );


            return res.status(500).json({
                success: false,
                message:
                    'Unable to load dashboard loans.'
            });

        }


        const loanList =
            loans || [];


        // ==========================================
        // GET LOAN INSTALLMENTS
        // ==========================================

        const loanIds =
            loanList.map(
                loan => loan.id
            );


        let installments = [];


        if (
            loanIds.length > 0
        ) {

            const {
                data,
                error: installmentsError
            } =
                await authenticatedSupabase
                    .from('loan_installments')
                    .select(`
                        id,
                        loan_id,
                        amount_paid,
                        paid_date
                    `)
                    .in(
                        'loan_id',
                        loanIds
                    );


            if (installmentsError) {

                console.error(
                    'Dashboard installments error:',
                    installmentsError
                );


                return res.status(500).json({
                    success: false,
                    message:
                        'Unable to load loan payments.'
                });

            }


            installments =
                data || [];

        }


        // ==========================================
        // TOTAL LENT
        // ==========================================

        const totalLent =
            loanList.reduce(
                (total, loan) => {

                    return total +
                        Number(
                            loan.principal_amount || 0
                        );

                },
                0
            );


        // ==========================================
        // ACTIVE LOANS
        // ==========================================

        const activeLoans =
            loanList.filter(
                loan =>
                    loan.status === 'active'
            ).length;


        // ==========================================
        // TOTAL REPAYMENT
        // ==========================================

        const totalRepayment =
            loanList.reduce(
                (total, loan) => {

                    return total +
                        Number(
                            loan.total_repayment || 0
                        );

                },
                0
            );


        // ==========================================
        // TOTAL COLLECTED
        // ==========================================

        const collected =
            installments.reduce(
                (total, installment) => {

                    return total +
                        Number(
                            installment.amount_paid || 0
                        );

                },
                0
            );


        // ==========================================
        // OUTSTANDING
        // ==========================================

        const outstanding =
            Math.max(
                totalRepayment - collected,
                0
            );


        // ==========================================
        // COLLECTION RATE
        // ==========================================

        let collectionRate = 0;


        if (
            totalRepayment > 0
        ) {

            collectionRate =
                (
                    collected /
                    totalRepayment
                ) * 100;

        }


        collectionRate =
            Number(
                collectionRate.toFixed(1)
            );


        // ==========================================
        // MONTHLY GROWTH
        // ==========================================

        const now =
            new Date();


        const currentMonthStart =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );


        const previousMonthStart =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );


        const currentMonthLent =
            loanList
                .filter(
                    loan => {

                        if (
                            !loan.start_date
                        ) {

                            return false;

                        }


                        const date =
                            new Date(
                                `${loan.start_date}T00:00:00`
                            );


                        return (
                            date >=
                                currentMonthStart
                        );

                    }
                )
                .reduce(
                    (total, loan) => {

                        return total +
                            Number(
                                loan.principal_amount || 0
                            );

                    },
                    0
                );


        const previousMonthLent =
            loanList
                .filter(
                    loan => {

                        if (
                            !loan.start_date
                        ) {

                            return false;

                        }


                        const date =
                            new Date(
                                `${loan.start_date}T00:00:00`
                            );


                        return (
                            date >=
                                previousMonthStart &&
                            date <
                                currentMonthStart
                        );

                    }
                )
                .reduce(
                    (total, loan) => {

                        return total +
                            Number(
                                loan.principal_amount || 0
                            );

                    },
                    0
                );


        let growth = 0;


        if (
            previousMonthLent > 0
        ) {

            growth =
                (
                    (
                        currentMonthLent -
                        previousMonthLent
                    ) /
                    previousMonthLent
                ) * 100;

        }
        else if (
            currentMonthLent > 0
        ) {

            /*
                There was no lending in the previous
                month, so there isn't a meaningful
                percentage comparison.
            */

            growth = 100;

        }


        growth =
            Number(
                growth.toFixed(1)
            );


        // ==========================================
        // LIVE LOANS
        // ==========================================

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const liveLoans =
            loanList
                .filter(
                    loan =>
                        loan.status === 'active' ||
                        loan.status === 'overdue'
                )
                .sort(
                    (a, b) => {

                        // ==================================
                        // OVERDUE FIRST
                        // ==================================

                        if (
                            a.status === 'overdue' &&
                            b.status !== 'overdue'
                        ) {

                            return -1;

                        }


                        if (
                            a.status !== 'overdue' &&
                            b.status === 'overdue'
                        ) {

                            return 1;

                        }


                        // ==================================
                        // BOTH OVERDUE
                        // ==================================

                        if (
                            a.status === 'overdue' &&
                            b.status === 'overdue'
                        ) {

                            const aDue =
                                new Date(
                                    `${a.next_due_date}T00:00:00`
                                );

                            const bDue =
                                new Date(
                                    `${b.next_due_date}T00:00:00`
                                );


                            // Older due date = more overdue
                            return aDue - bDue;

                        }


                        // ==================================
                        // BOTH ACTIVE
                        // ==================================

                        const aDue =
                            a.next_due_date
                                ? new Date(
                                    `${a.next_due_date}T00:00:00`
                                )
                                : new Date(
                                    '9999-12-31T00:00:00'
                                );


                        const bDue =
                            b.next_due_date
                                ? new Date(
                                    `${b.next_due_date}T00:00:00`
                                )
                                : new Date(
                                    '9999-12-31T00:00:00'
                                );


                        // Nearest due date first
                        return aDue - bDue;

                    }
                )
                .slice(
                    0,
                    5
                )
                .map(
                    loan => ({

                        id:
                            loan.id,

                        principal_amount:
                            Number(
                                loan.principal_amount || 0
                            ),

                        remaining_amount:
                            Number(
                                loan.remaining_amount || 0
                            ),

                        total_repayment:
                            Number(
                                loan.total_repayment || 0
                            ),

                        status:
                            loan.status,

                        start_date:
                            loan.start_date,

                        next_due_date:
                            loan.next_due_date,

                        borrower:
                            loan.borrowers || null

                    })
                );


        // ==========================================
        // PROFILE INFORMATION
        // ==========================================

        const firstName =
            profile?.first_name ||
            "";


        const lastName =
            profile?.last_name ||
            "";


        const profileDisplayName =
            `${firstName} ${lastName}`.trim() ||
            user.email ||
            "Account";


        const profileInitials =
            getDashboardInitials(
                firstName,
                lastName,
                user.email
            );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            dashboard: {

                borrowers:
                    borrowerList.length,

                loans:
                    loanList.length,

                totalLent:
                    totalLent,

                growth:
                    growth,

                activeLoans:
                    activeLoans,

                collected:
                    collected,

                outstanding:
                    outstanding,

                collectionRate:
                    collectionRate,

                liveLoans:
                    liveLoans,

                profileName:
                    profileDisplayName,

                profileInitials:
                    profileInitials

            }

        });


    }
    catch (error) {

        console.error(
            'Dashboard error:',
            error
        );


        return res.status(500).json({
            success: false,
            message:
                'Something went wrong while loading the dashboard.'
        });

    }

});


// ============================================================
// DASHBOARD PROFILE INITIALS
// ============================================================

function getDashboardInitials(
    firstName,
    lastName,
    email
) {

    if (
        firstName &&
        lastName
    ) {

        return (
            firstName[0] +
            lastName[0]
        ).toUpperCase();

    }


    if (
        firstName
    ) {

        return firstName
            .substring(0, 2)
            .toUpperCase();

    }


    if (
        email
    ) {

        return email
            .substring(0, 2)
            .toUpperCase();

    }


    return "--";

}

// Profile page
app.get('/profile', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'src',
            'public',
            'html',
            'profile.html')
    );
});

// =============================
// GET PROFILE
// =============================

app.get('/api/profile', async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const accessToken = authHeader.replace('Bearer ', '').trim();

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });
        }

        const authenticatedSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY,
            {
                global: {
                    headers: { Authorization: `Bearer ${accessToken}` }
                },
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { data: { user }, error: userError } =
            await authenticatedSupabase.auth.getUser();

        if (userError || !user) {
            console.error('Profile authentication error:', userError);
            return res.status(401).json({
                success: false,
                message: 'Your session is invalid or expired.'
            });
        }

        const { data: profile, error: profileError } = await authenticatedSupabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({
                success: false,
                message: 'Unable to load profile.'
            });
        }

        return res.status(200).json({
            success: true,
            profile: profile,
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while loading the profile.'
        });
    }

});

// =============================
// START SERVER
// =============================

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
});