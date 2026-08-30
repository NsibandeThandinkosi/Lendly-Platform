/* ============================================================
   LENDLY - CREATE LOAN
============================================================ */


/* ============================================================
   GET BORROWER ID
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );

const borrowerId =
    params.get("borrowerId");


/* ============================================================
   ELEMENTS
============================================================ */

const borrowerInitials =
    document.getElementById("borrowerInitials");

const borrowerName =
    document.getElementById("borrowerName");

const borrowerPhone =
    document.getElementById("borrowerPhone");

const loanAmount =
    document.getElementById("loanAmount");

const loanDuration =
    document.getElementById("loanDuration");

const interestRate =
    document.getElementById("interestRate");

const interestLimit =
    document.getElementById("interestLimit");

const serviceFee =
    document.getElementById("serviceFee");

const calculateBtn =
    document.getElementById("calculateBtn");

const calculatorResult =
    document.getElementById("calculatorResult");

const totalRepaymentAmount =
    document.getElementById("totalRepayment");

const monthlyPayment =
    document.getElementById("monthlyPayment");

const displayAmount =
    document.getElementById("displayAmount");

const displayInterest =
    document.getElementById("displayInterest");

const displayInitiationFee =
    document.getElementById("displayInitiationFee");

const displayServiceFees =
    document.getElementById("displayServiceFees");

const createLoanBtn =
    document.getElementById("createLoanBtn");

const createLoanNote =
    document.getElementById("createLoanNote");

const backLink =
    document.getElementById("backLink");


/* ============================================================
   STATE
============================================================ */

let borrower = null;

let calculatedLoan = null;


/* ============================================================
   AUTHENTICATION
============================================================ */

function getAccessToken() {

    const storedSession =
        localStorage.getItem(
            "lendlySession"
        );

    if (!storedSession) {

        return null;

    }

    try {

        const session =
            JSON.parse(
                storedSession
            );

        return (
            session.access_token ||
            null
        );

    } catch (error) {

        console.error(
            "Unable to read session:",
            error
        );

        return null;

    }

}


/* ============================================================
   FORMATTERS
============================================================ */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(amount);

}


function getInitials(borrower) {

    return (
        borrower.first_name.charAt(0) +
        borrower.last_name.charAt(0)
    ).toUpperCase();

}



async function checkActiveLoan() {

    const accessToken =
        getAccessToken();

    try {

        const response =
            await fetch(
                `/api/borrowers/${encodeURIComponent(borrowerId)}/loans?status=active`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );

        const result =
            await response.json();

        if (
            response.ok &&
            result.loans &&
            result.loans.length > 0
        ) {

            calculateBtn.disabled = true;

            createLoanBtn.disabled = true;

            createLoanNote.textContent =
                "This borrower already has an active loan. A new loan cannot be created until it is settled.";

            return true;

        }

        return false;

    } catch (error) {

        console.error(
            "Active loan check failed:",
            error
        );

        return false;

    }

}


/* ============================================================
   LOAD BORROWER
============================================================ */

async function loadBorrower() {

    if (!borrowerId) {

        showError(
            "No borrower was specified."
        );

        return;

    }


    const accessToken =
        getAccessToken();


    if (!accessToken) {

        window.location.href =
            "/login";

        return;

    }


    try {

        const response =
            await fetch(
                `/api/borrowers/${encodeURIComponent(borrowerId)}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "Borrower loading error:",
                result
            );


            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "lendlySession"
                );

                localStorage.removeItem(
                    "lendlyUser"
                );

                window.location.href =
                    "/login";

                return;

            }


            throw new Error(
                result.message ||
                "Unable to load borrower."
            );

        }


        borrower =
            result.borrower;


        displayBorrower();

        const hasActiveLoan =
            await checkActiveLoan();

        if (hasActiveLoan) {

            return;

        }


        /*
            Set the initial interest rate.

            For now we use 5%.

            We can later determine whether this
            is the borrower's first loan of the
            year by checking loan history.
        */

        interestRate.value = "5";

        interestLimit.textContent =
            "Maximum 5% per month for a first loan of the year.";

    } catch (error) {

        console.error(
            "Load borrower error:",
            error
        );

        showError(
            error.message
        );

    }

}


/* ============================================================
   DISPLAY BORROWER
============================================================ */

function displayBorrower() {

    if (!borrower) {

        return;

    }


    borrowerInitials.textContent =
        getInitials(
            borrower
        );


    borrowerName.textContent =
        `${borrower.first_name} ${borrower.last_name}`;


    borrowerPhone.textContent =
        borrower.phone;

}


/* ============================================================
   CALCULATE LOAN
============================================================ */

function calculateLoan() {

    const amount =
        Number(
            loanAmount.value
        );

    const duration =
        Number(
            loanDuration.value
        );

    const rate =
        Number(
            interestRate.value
        );

    const monthlyFee =
        Number(
            serviceFee.value
        );


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!amount || amount <= 0 || amount > 8000) {

        alert(
            "Please enter a valid loan amount."
        );

        loanAmount.focus();

        return;

    }


    if (
        !duration ||
        duration < 1 ||
        duration > 6
    ) {

        alert(
            "Loan duration must be between 1 and 6 months."
        );

        loanDuration.focus();

        return;

    }


    if (
        rate < 0 ||
        rate > 5
    ) {

        alert(
            "Interest rate cannot exceed 5% per month."
        );

        interestRate.focus();

        return;

    }


    if (
        monthlyFee < 0 ||
        monthlyFee > 60
    ) {

        alert(
            "Monthly service fee cannot exceed R60."
        );

        serviceFee.focus();

        return;

    }


    /* ========================================================
       CALCULATION
    ======================================================== */

    /*
        Simple monthly interest.

        Example:

        R8,000
        3 months
        5%

        Interest:
        8000 × 0.05 × 3
        = R1,200
    */

    const totalInterest =
        amount *
        (rate / 100) *
        duration;


    /*
        Service fees are charged monthly.
    */

    const totalServiceFees =
        monthlyFee *
        duration;


    /*
        No separate initiation fee is currently
        entered on the form, so we keep it at zero.

        We can add the real initiation-fee rule
        later once that business rule is defined.
    */

    const initiationFee = amount <= 1000 
    ? amount * 0.15 
    : 165 + (0.10 * (amount - 1000));

    const totalRepaymentAmount =
        amount +
        totalInterest +
        initiationFee +
        totalServiceFees;


    const monthlyPaymentAmount =
        totalRepaymentAmount /
        duration;


    /* ========================================================
       SAVE CALCULATION
    ======================================================== */

    calculatedLoan = {

        borrowerId:
            borrower.id,

        principalAmount:
            amount,

        durationMonths:
            duration,

        interestRate:
            rate,

        monthlyServiceFee:
            monthlyFee,

        initiationFee:
            initiationFee,

        totalInterest:
            totalInterest,

        totalServiceFees:
            totalServiceFees,

        totalRepayment:
            totalRepaymentAmount,

        monthlyPayment:
            monthlyPaymentAmount

    };


    /* ========================================================
       DISPLAY RESULTS
    ======================================================== */

    totalRepayment.textContent =
        formatCurrency(
            totalRepaymentAmount
        );


    monthlyPayment.textContent =
        formatCurrency(
            monthlyPaymentAmount
        );


    displayAmount.textContent =
        formatCurrency(
            amount
        );


    displayInterest.textContent =
        formatCurrency(
            totalInterest
        );


    displayInitiationFee.textContent =
        formatCurrency(
            initiationFee
        );


    displayServiceFees.textContent =
        formatCurrency(
            totalServiceFees
        );


    calculatorResult.classList.add(
        "visible"
    );


    createLoanBtn.disabled =
        false;


    createLoanNote.textContent =
        "Review the repayment details, then create the loan.";

}


/* ============================================================
   CREATE LOAN
============================================================ */

async function createLoan() {

    if (!calculatedLoan) {

        alert(
            "Please calculate the loan first."
        );

        return;

    }


    const accessToken =
        getAccessToken();


    if (!accessToken) {

        window.location.href =
            "/login";

        return;

    }


    createLoanBtn.disabled =
        true;


    createLoanBtn.textContent =
        "Creating Loan...";


    try {

        const response =
            await fetch(
                "/api/loans",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${accessToken}`

                    },

                    body: JSON.stringify({

                        borrowerId:
                            calculatedLoan.borrowerId,

                        principalAmount:
                            calculatedLoan.principalAmount,

                        durationMonths:
                            calculatedLoan.durationMonths,

                        interestRate:
                            calculatedLoan.interestRate,

                        monthlyServiceFee:
                            calculatedLoan.monthlyServiceFee,

                        initiationFee:
                            calculatedLoan.initiationFee,

                        totalInterest:
                            calculatedLoan.totalInterest,

                        totalRepayment:
                            calculatedLoan.totalRepayment,

                        monthlyPayment:
                            calculatedLoan.monthlyPayment

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "Create loan error:",
                result
            );

            alert(
                result.message ||
                "Unable to create loan."
            );

            createLoanBtn.disabled =
                false;

            createLoanBtn.textContent =
                "Create Loan";

            return;

        }


        console.log(
            "Loan created:",
            result.loan
        );


        /*
            Go back to borrower details.

            This means the user immediately sees
            the loan attached to this borrower.
        */

        window.location.href =
            `/borrowers/details?id=${borrower.id}`;

    } catch (error) {

        console.error(
            "Create loan request failed:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

        createLoanBtn.disabled =
            false;

        createLoanBtn.textContent =
            "Create Loan";

    }

}


/* ============================================================
   ERROR
============================================================ */

function showError(message) {

    borrowerName.textContent =
        "Unable to load borrower";

    borrowerPhone.textContent =
        message;

    borrowerInitials.textContent =
        "--";

    createLoanBtn.disabled =
        true;

    calculateBtn.disabled =
        true;

}


/* ============================================================
   EVENTS
============================================================ */

calculateBtn.addEventListener(
    "click",
    calculateLoan
);


createLoanBtn.addEventListener(
    "click",
    createLoan
);


/* ============================================================
   INITIALIZE
============================================================ */

loadBorrower();