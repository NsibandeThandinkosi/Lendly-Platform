/* ============================================================
   LENDLY - CREATE LOAN
============================================================ */


/* ============================================================
   HARD-CODED BORROWERS
============================================================ */

const borrowers = [

    {
        id: 1,
        firstName: "Lerato",
        lastName: "Mokoena",
        phone: "071 123 4567",

        loans: [

            {
                date: "2026-04-10",
                status: "settled"
            }

        ]

    },


    {
        id: 2,
        firstName: "Sipho",
        lastName: "Dlamini",
        phone: "072 234 5678",

        loans: [

            {
                date: "2026-08-01",
                status: "active"
            }

        ]

    },


    {
        id: 3,
        firstName: "Thabo",
        lastName: "Nkosi",
        phone: "073 345 6789",

        loans: [

            {
                date: "2026-05-28",
                status: "overdue"
            }

        ]

    },


    {
        id: 4,
        firstName: "Ayanda",
        lastName: "Ndlovu",
        phone: "074 456 7890",

        loans: []

    }

];


/* ============================================================
   ELEMENTS
============================================================ */

const loanAmountInput =
    document.getElementById(
        "loanAmount"
    );


const loanDurationInput =
    document.getElementById(
        "loanDuration"
    );


const interestRateInput =
    document.getElementById(
        "interestRate"
    );


const serviceFeeInput =
    document.getElementById(
        "serviceFee"
    );


const interestLimit =
    document.getElementById(
        "interestLimit"
    );


const calculateBtn =
    document.getElementById(
        "calculateBtn"
    );


const createLoanBtn =
    document.getElementById(
        "createLoanBtn"
    );


const createLoanNote =
    document.getElementById(
        "createLoanNote"
    );


const borrowerName =
    document.getElementById(
        "borrowerName"
    );


const borrowerPhone =
    document.getElementById(
        "borrowerPhone"
    );


const borrowerInitials =
    document.getElementById(
        "borrowerInitials"
    );


/* ============================================================
   URL BORROWER
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const borrowerId =
    Number(
        params.get("borrowerId")
    );


/* ============================================================
   FIND BORROWER
============================================================ */

const borrower =
    borrowers.find(
        borrower =>
            borrower.id === borrowerId
    );


/* ============================================================
   DISPLAY BORROWER
============================================================ */

function displayBorrower() {

    if (!borrower) {

        borrowerName.textContent =
            "Borrower not found";

        borrowerPhone.textContent =
            "";

        borrowerInitials.textContent =
            "?";

        createLoanBtn.disabled =
            true;

        createLoanNote.textContent =
            "A valid borrower is required.";

        return;

    }


    borrowerName.textContent =
        `${borrower.firstName} ${borrower.lastName}`;


    borrowerPhone.textContent =
        borrower.phone;


    borrowerInitials.textContent =
        `${borrower.firstName.charAt(0)}${borrower.lastName.charAt(0)}`;


    updateInterestLimit();

}


/* ============================================================
   CHECK FIRST LOAN OF YEAR
============================================================ */

function isFirstLoanOfYear(
    borrower
) {

    if (!borrower) {

        return true;

    }


    const currentYear =
        new Date()
            .getFullYear();


    const hasLoanThisYear =
        borrower.loans.some(
            loan => {

                const loanYear =
                    new Date(
                        loan.date
                    ).getFullYear();


                return (
                    loanYear ===
                    currentYear
                );

            }
        );


    return !hasLoanThisYear;

}


/* ============================================================
   INTEREST LIMIT
============================================================ */

function updateInterestLimit() {

    if (!borrower) {

        return;

    }


    const firstLoan =
        isFirstLoanOfYear(
            borrower
        );


    const maximumRate =
        firstLoan
            ? 5
            : 3;


    interestRateInput.max =
        maximumRate;


    interestRateInput.value =
        maximumRate;


    interestLimit.textContent =
        firstLoan
            ? "First loan this year: maximum 5% per month."
            : "Repeat loan this year: maximum 3% per month.";

}


/* ============================================================
   FORMAT CURRENCY
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


/* ============================================================
   INITIATION FEE
============================================================ */

function getInitiationFee(
    loanAmount
) {

    if (loanAmount > 1000) {

        return (
            165 +
            (
                loanAmount -
                1000
            ) * 0.1
        );

    }


    return 165;

}


/* ============================================================
   VALIDATE INPUTS
============================================================ */

function validateInputs() {

    const amount =
        Number(
            loanAmountInput.value
        );


    const duration =
        Number(
            loanDurationInput.value
        );


    const interest =
        Number(
            interestRateInput.value
        );


    const serviceFee =
        Number(
            serviceFeeInput.value
        );


    if (!borrower) {

        alert(
            "A valid borrower is required."
        );

        return false;

    }


    if (amount <= 0) {

        alert(
            "Please enter a valid loan amount."
        );

        return false;

    }


    if (
        duration < 1 ||
        duration > 5
    ) {

        alert(
            "Loan duration must be between 1 and 5 months."
        );

        return false;

    }


    if (
        serviceFee < 0 ||
        serviceFee > 60
    ) {

        alert(
            "The monthly service fee cannot exceed R60."
        );

        return false;

    }


    const firstLoan =
        isFirstLoanOfYear(
            borrower
        );


    const maximumRate =
        firstLoan
            ? 5
            : 3;


    if (
        interest < 0 ||
        interest > maximumRate
    ) {

        alert(
            `The maximum interest rate for this borrower is ${maximumRate}% per month.`
        );

        return false;

    }


    return true;

}


/* ============================================================
   CALCULATE LOAN
============================================================ */

calculateBtn.addEventListener(
    "click",
    () => {

        if (!validateInputs()) {

            return;

        }


        const loanAmount =
            Number(
                loanAmountInput.value
            );


        const loanDuration =
            Number(
                loanDurationInput.value
            );


        const interestRate =
            Number(
                interestRateInput.value
            );


        const serviceFee =
            Number(
                serviceFeeInput.value
            );


        /* ====================================================
           INTEREST
        ==================================================== */

        const totalInterest =
            loanAmount *
            (
                interestRate / 100
            ) *
            loanDuration;


        /* ====================================================
           SERVICE FEES
        ==================================================== */

        const totalServiceFees =
            serviceFee *
            loanDuration;


        /* ====================================================
           INITIATION FEE
        ==================================================== */

        const initiationFee =
            getInitiationFee(
                loanAmount
            );


        /* ====================================================
           TOTAL REPAYMENT
        ==================================================== */

        const totalRepayment =
            loanAmount +
            totalInterest +
            totalServiceFees +
            initiationFee;


        /* ====================================================
           MONTHLY PAYMENT
        ==================================================== */

        const monthlyPayment =
            totalRepayment /
            loanDuration;


        /* ====================================================
           DISPLAY RESULTS
        ==================================================== */

        document.getElementById(
            "totalRepayment"
        ).textContent =
            formatCurrency(
                totalRepayment
            );


        document.getElementById(
            "monthlyPayment"
        ).textContent =
            formatCurrency(
                monthlyPayment
            );


        document.getElementById(
            "displayAmount"
        ).textContent =
            formatCurrency(
                loanAmount
            );


        document.getElementById(
            "displayInterest"
        ).textContent =
            formatCurrency(
                totalInterest
            );


        document.getElementById(
            "displayInitiationFee"
        ).textContent =
            formatCurrency(
                initiationFee
            );


        document.getElementById(
            "displayServiceFees"
        ).textContent =
            formatCurrency(
                totalServiceFees
            );


        /* ====================================================
           ENABLE CREATE
        ==================================================== */

        createLoanBtn.disabled =
            false;


        createLoanNote.textContent =
            "The loan has been calculated and is ready to be created.";

    }
);


/* ============================================================
   SERVICE FEE VALIDATION
============================================================ */

serviceFeeInput.addEventListener(
    "input",
    () => {

        if (
            Number(
                serviceFeeInput.value
            ) > 60
        ) {

            serviceFeeInput.value =
                60;

        }

    }
);


/* ============================================================
   CREATE LOAN
============================================================ */

createLoanBtn.addEventListener(
    "click",
    () => {

        if (
            createLoanBtn.disabled
        ) {

            return;

        }


        if (!borrower) {

            alert(
                "A valid borrower is required."
            );

            return;

        }


        const confirmed =
            confirm(
                `Create this loan for ${borrower.firstName} ${borrower.lastName}?`
            );


        if (!confirmed) {

            return;

        }


        /*
            For now we only simulate
            creating the loan.

            Later this will insert the
            loan into Supabase.
        */

        alert(
            "Loan created successfully."
        );


        window.location.href =
            `borrower-detail.html?id=${borrower.id}`;

    }
);


/* ============================================================
   INITIALIZE
============================================================ */

displayBorrower();