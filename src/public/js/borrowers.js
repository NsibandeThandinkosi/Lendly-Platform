/* ============================================================
   LENDLY - BORROWERS
============================================================ */


/*
    Hard-coded borrowers for now.

    Later this data will come from Supabase.
*/

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
                amount: 12500,
                date: "2026-04-10",
                settlementDate: "2026-08-10",
                nextDueDate: null
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
                amount: 8500,
                date: "2026-08-01",
                settlementDate: null,
                nextDueDate: "2026-09-01"
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
                amount: 6500,
                date: "2026-05-28",
                settlementDate: null,
                nextDueDate: "2026-08-15"
            },

            {
                id: 104,
                status: "settled",
                amount: 6500,
                date: "2026-01-20",
                settlementDate: "2026-03-20",
                nextDueDate: null
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
   ELEMENTS
============================================================ */

const borrowersList =
    document.getElementById(
        "borrowersList"
    );


const borrowerSearch =
    document.getElementById(
        "borrowerSearch"
    );


const borrowerCount =
    document.getElementById(
        "borrowerCount"
    );


const createBorrowerBtn =
    document.getElementById(
        "createBorrowerBtn"
    );



/* ============================================================
   HELPERS
============================================================ */

function getFullName(borrower) {

    return `${borrower.firstName} ${borrower.lastName}`;

}



function getInitials(borrower) {

    return (
        borrower.firstName.charAt(0) +
        borrower.lastName.charAt(0)
    ).toUpperCase();

}



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
   GET CURRENT LOAN
============================================================ */

function getCurrentLoan(borrower) {

    /*
        A borrower cannot have more than
        one active/overdue loan.

        Therefore we can find either
        active or overdue.
    */

    return borrower.loans.find(
        loan =>
            loan.status === "active" ||
            loan.status === "overdue"
    );

}



/* ============================================================
   DISPLAY BORROWERS
============================================================ */

function displayBorrowers(list) {

    borrowersList.innerHTML = "";


    borrowerCount.textContent =
        `${list.length} ${
            list.length === 1
                ? "borrower"
                : "borrowers"
        }`;


    if (list.length === 0) {

        borrowersList.innerHTML = `

            <div class="borrowers-empty">

                <h3>
                    No borrowers found
                </h3>

                <p>
                    Try another search or create a new borrower.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(
        borrower => {

            const currentLoan =
                getCurrentLoan(
                    borrower
                );


            let statusText =
                "No active loan";


            let statusClass =
                "none";


            if (currentLoan) {

                statusText =
                    currentLoan.status === "overdue"
                        ? "Overdue"
                        : "Active";


                statusClass =
                    currentLoan.status;

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "borrower-card";


            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `borrower-detail.html?id=${borrower.id}`;

                }
            );


            card.innerHTML = `

                <div class="borrower-main">

                    <div class="borrower-avatar">
                        ${getInitials(borrower)}
                    </div>


                    <div>

                        <div class="borrower-name">
                            ${getFullName(borrower)}
                        </div>

                        <div class="borrower-phone">
                            ${borrower.phone}
                        </div>

                    </div>

                </div>


                <div class="borrower-loan-info">


                    <div class="loan-info-item">

                        <span>
                            Loan
                        </span>

                        <strong>
                            ${
                                currentLoan
                                    ? formatCurrency(
                                        currentLoan.amount
                                    )
                                    : "--"
                            }
                        </strong>

                    </div>


                    <div class="loan-info-item">

                        <span>
                            Next Due
                        </span>

                        <strong>
                            ${
                                currentLoan
                                    ? formatDate(
                                        currentLoan.nextDueDate
                                    )
                                    : "--"
                            }
                        </strong>

                    </div>


                    <span
                        class="loan-status ${statusClass}"
                    >
                        ${statusText}
                    </span>


                </div>


                <span class="borrower-arrow">
                    →
                </span>

            `;


            borrowersList.appendChild(
                card
            );

        }
    );

}



/* ============================================================
   SORT ALPHABETICALLY
============================================================ */

const sortedBorrowers =
    [...borrowers].sort(
        (a, b) => {

            const nameA =
                getFullName(a).toLowerCase();

            const nameB =
                getFullName(b).toLowerCase();

            return nameA.localeCompare(
                nameB
            );

        }
    );



/* ============================================================
   SEARCH
============================================================ */

borrowerSearch.addEventListener(
    "input",
    () => {

        const searchTerm =
            borrowerSearch.value
                .trim()
                .toLowerCase();


        const filtered =
            sortedBorrowers.filter(
                borrower => {

                    const fullName =
                        getFullName(
                            borrower
                        ).toLowerCase();


                    return fullName.includes(
                        searchTerm
                    );

                }
            );


        displayBorrowers(
            filtered
        );

    }
);



/* ============================================================
   CREATE BORROWER
============================================================ */

createBorrowerBtn.addEventListener(
    "click",
    () => {

        /*
            We can replace this with a
            proper create-borrower page later.
        */

        window.location.href =
            "create-borrower.html";

    }
);



/* ============================================================
   INITIALIZE
============================================================ */

displayBorrowers(
    sortedBorrowers
);