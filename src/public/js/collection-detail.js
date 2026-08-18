/* ============================================================
   LENDLY - COLLECTION DETAILS
============================================================ */


/*
    Hard-coded collection data.

    This currently mirrors the data from collections.js.

    Later, this will come from Supabase.
*/

const collectedLoans = [

    {
        id: 1,

        loanNumber: "LN-001",

        borrower: {

            id: "BR-001",

            name: "Sipho Dlamini",

            initials: "SD",

            phone: "082 555 1234",

            email: "sipho@example.com"

        },

        originalLoan: 8000,

        totalPaid: 8500,

        startDate: "2026-05-15",

        fulfilledDate: "2026-08-15",

        payments: [

            {
                description: "Monthly payment",
                date: "2026-06-15",
                method: "EFT",
                amount: 2800
            },

            {
                description: "Monthly payment",
                date: "2026-07-15",
                method: "EFT",
                amount: 2800
            },

            {
                description: "Final payment",
                date: "2026-08-15",
                method: "EFT",
                amount: 2900
            }

        ]

    },


    {
        id: 2,

        loanNumber: "LN-002",

        borrower: {

            id: "BR-002",

            name: "Lerato Mokoena",

            initials: "LM",

            phone: "071 234 5678",

            email: "lerato@example.com"

        },

        originalLoan: 12000,

        totalPaid: 12500,

        startDate: "2026-04-10",

        fulfilledDate: "2026-08-10",

        payments: [

            {
                description: "Monthly payment",
                date: "2026-05-10",
                method: "Cash",
                amount: 3000
            },

            {
                description: "Monthly payment",
                date: "2026-06-10",
                method: "Cash",
                amount: 3000
            },

            {
                description: "Monthly payment",
                date: "2026-07-10",
                method: "EFT",
                amount: 3000
            },

            {
                description: "Final payment",
                date: "2026-08-10",
                method: "EFT",
                amount: 3500
            }

        ]

    },


    {
        id: 3,

        loanNumber: "LN-003",

        borrower: {

            id: "BR-003",

            name: "Thabo Nkosi",

            initials: "TN",

            phone: "079 876 5432",

            email: "thabo@example.com"

        },

        originalLoan: 6000,

        totalPaid: 6500,

        startDate: "2026-05-28",

        fulfilledDate: "2026-07-28",

        payments: [

            {
                description: "Monthly payment",
                date: "2026-06-28",
                method: "EFT",
                amount: 3000
            },

            {
                description: "Final payment",
                date: "2026-07-28",
                method: "EFT",
                amount: 3500
            }

        ]

    }

];

const notificationButton =
    document.getElementById("notificationButton");

const profileButton =
    document.getElementById("profileButton");

/* ============================================================
   GET LOAN ID
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const loanId =
    Number(
        params.get("id")
    );



/* ============================================================
   FIND LOAN
============================================================ */

const loan =
    collectedLoans.find(
        loan => loan.id === loanId
    );



/* ============================================================
   FORMAT CURRENCY
============================================================ */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0
        }
    ).format(amount);

}



/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-ZA",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}



/* ============================================================
   DISPLAY LOAN
============================================================ */

function displayLoan() {

    /*
        If the ID doesn't exist,
        send the user back.
    */

    if (!loan) {

        alert(
            "The collection record could not be found."
        );

        window.location.href =
            "collections.html";

        return;

    }



    /* ========================================================
       HEADER
    ======================================================== */

    document.getElementById(
        "borrowerAvatar"
    ).textContent =
        loan.borrower.initials;


    document.getElementById(
        "borrowerName"
    ).textContent =
        loan.borrower.name;


    document.getElementById(
        "loanNumber"
    ).textContent =
        `Loan #${loan.loanNumber}`;



    /* ========================================================
       OVERVIEW
    ======================================================== */

    document.getElementById(
        "originalLoan"
    ).textContent =
        formatCurrency(
            loan.originalLoan
        );


    document.getElementById(
        "totalPaid"
    ).textContent =
        formatCurrency(
            loan.totalPaid
        );


    document.getElementById(
        "startDate"
    ).textContent =
        formatDate(
            loan.startDate
        );


    document.getElementById(
        "fulfilledDate"
    ).textContent =
        formatDate(
            loan.fulfilledDate
        );



    /* ========================================================
       BORROWER INFORMATION
    ======================================================== */

    document.getElementById(
        "detailBorrowerName"
    ).textContent =
        loan.borrower.name;


    document.getElementById(
        "borrowerPhone"
    ).textContent =
        loan.borrower.phone;


    document.getElementById(
        "borrowerEmail"
    ).textContent =
        loan.borrower.email;


    document.getElementById(
        "borrowerId"
    ).textContent =
        loan.borrower.id;



    /* ========================================================
       PAYMENT TOTAL
    ======================================================== */

    document.getElementById(
        "paymentTotal"
    ).textContent =
        formatCurrency(
            loan.totalPaid
        );



    /* ========================================================
       PAYMENT HISTORY
    ======================================================== */

    displayPayments();

}



/* ============================================================
   DISPLAY PAYMENTS
============================================================ */

function displayPayments() {

    const paymentHistory =
        document.getElementById(
            "paymentHistory"
        );


    paymentHistory.innerHTML = "";


    loan.payments.forEach(
        payment => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${payment.description}
                </td>

                <td>
                    ${formatDate(payment.date)}
                </td>

                <td>
                    ${payment.method}
                </td>

                <td class="payment-amount">
                    ${formatCurrency(payment.amount)}
                </td>

            `;


            paymentHistory.appendChild(row);

        }
    );

}



/* ============================================================
   DELETE RECORD
============================================================ */

document
    .getElementById(
        "deleteRecordButton"
    )
    .addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    `Delete the collection record for ${loan.borrower.name}?`
                );


            if (!confirmed) {
                return;
            }


            /*
                For now this only returns the
                user to the collections page.

                Later this will delete the record
                from Supabase.
            */

            alert(
                "Collection record deleted."
            );


            window.location.href =
                "collections.html";

        }
    );

    
/* ============================================================
   INITIALIZE
============================================================ */

displayLoan();