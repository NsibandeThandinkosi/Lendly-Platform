/* ============================================================
   LENDLY - BORROWER DETAILS
============================================================ */


/* ============================================================
   BORROWER DATA
============================================================ */

const borrowers = [

    {
        id: 1,

        firstName: "Lerato",
        lastName: "Mokoena",

        phone: "071 234 5678",

        loans: [

            {
                id: 101,
                status: "settled",
                totalAmount: 12500,
                originalAmount: 12000,
                date: "2026-04-10",
                nextDueDate: null,
                settlementDate: "2026-08-10"
            }

        ]

    },


    {
        id: 2,

        firstName: "Sipho",
        lastName: "Dlamini",

        phone: "082 555 1234",

        loans: [

            {
                id: 102,
                status: "active",
                totalAmount: null,
                remainingAmount: 6500,
                originalAmount: 8000,
                date: "2026-08-01",
                nextDueDate: "2026-09-01",
                settlementDate: null
            }

        ]

    },


    {
        id: 3,

        firstName: "Thabo",
        lastName: "Nkosi",

        phone: "079 876 5432",

        loans: [

            {
                id: 103,
                status: "overdue",
                totalAmount: null,
                remainingAmount: 3500,
                originalAmount: 6000,
                date: "2026-05-28",
                nextDueDate: "2026-08-15",
                settlementDate: null
            },

            {
                id: 104,
                status: "settled",
                totalAmount: 6500,
                originalAmount: 6000,
                date: "2026-01-20",
                nextDueDate: null,
                settlementDate: "2026-03-20"
            }

        ]

    },


    {
        id: 4,

        firstName: "Ayanda",
        lastName: "Ndlovu",

        phone: "083 111 2233",

        loans: []

    }

];



/* ============================================================
   GET BORROWER ID
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const borrowerId =
    Number(
        params.get("id")
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
   HELPERS
============================================================ */

function getInitials(borrower) {

    return (
        borrower.firstName.charAt(0) +
        borrower.lastName.charAt(0)
    ).toUpperCase();

}


function formatCurrency(amount) {

    if (amount === null || amount === undefined) {

        return "--";

    }


    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0
        }
    ).format(amount);

}


function formatDate(date) {

    if (!date) {

        return "--";

    }


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
   DISPLAY BORROWER
============================================================ */

function displayBorrower() {

    if (!borrower) {

        alert(
            "Borrower could not be found."
        );

        window.location.href =
            "borrowers.html";

        return;

    }


    document.getElementById(
        "borrowerAvatar"
    ).textContent =
        getInitials(borrower);


    document.getElementById(
        "borrowerName"
    ).textContent =
        `${borrower.firstName} ${borrower.lastName}`;


    document.getElementById(
        "borrowerPhone"
    ).textContent =
        borrower.phone;


    document.getElementById(
        "firstName"
    ).textContent =
        borrower.firstName;


    document.getElementById(
        "lastName"
    ).textContent =
        borrower.lastName;


    document.getElementById(
        "phone"
    ).textContent =
        borrower.phone;


    displayLoans();

}



/* ============================================================
   DISPLAY LOANS
============================================================ */

function displayLoans() {

    const container =
        document.getElementById(
            "borrowerLoans"
        );


    container.innerHTML = "";


    if (borrower.loans.length === 0) {

        container.innerHTML = `

            <div class="no-loans">

                This borrower has no loan history yet.

            </div>

        `;

        return;

    }


    /*
        Sort by due date.

        For active/overdue loans we use
        nextDueDate.

        For settled loans we use
        settlementDate.
    */

    const sortedLoans =
        [...borrower.loans].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.nextDueDate ||
                        a.settlementDate ||
                        a.date
                    );


                const dateB =
                    new Date(
                        b.nextDueDate ||
                        b.settlementDate ||
                        b.date
                    );


                return dateA - dateB;

            }
        );


    sortedLoans.forEach(
        loan => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "borrower-loan-row";


            let statusText =
                "Active";


            if (
                loan.status === "overdue"
            ) {

                statusText =
                    "Overdue";

            }


            if (
                loan.status === "settled"
            ) {

                statusText =
                    "Settled";

            }


            const amount =
                loan.status === "settled"
                    ? formatCurrency(
                        loan.totalAmount
                    )
                    : formatCurrency(
                        loan.remainingAmount
                    );


            const amountLabel =
                loan.status === "settled"
                    ? "Total Paid"
                    : "Remaining";


            const dateLabel =
                loan.status === "settled"
                    ? "Settlement Date"
                    : "Next Due";


            const date =
                loan.status === "settled"
                    ? loan.settlementDate
                    : loan.nextDueDate;


            row.innerHTML = `

                <div>

                    <span>
                        Status
                    </span>

                    <strong
                        class="loan-status ${loan.status}"
                    >
                        ${statusText}
                    </strong>

                </div>


                <div>

                    <span>
                        ${amountLabel}
                    </span>

                    <strong>
                        ${amount}
                    </strong>

                </div>


                <div>

                    <span>
                        Date
                    </span>

                    <strong>
                        ${formatDate(loan.date)}
                    </strong>

                </div>


                <div>

                    <span>
                        ${dateLabel}
                    </span>

                    <strong>
                        ${formatDate(date)}
                    </strong>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}



/* ============================================================
   CREATE LOAN
============================================================ */

document
    .getElementById(
        "createLoanBtn"
    )
    .addEventListener(
        "click",
        () => {

            window.location.href =
                `create-loan.html?borrowerId=${borrower.id}`;

        }
    );



/* ============================================================
   INITIALIZE
============================================================ */

displayBorrower();