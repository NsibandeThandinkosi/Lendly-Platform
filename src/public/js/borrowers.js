/* ============================================================
   LENDLY - BORROWERS
============================================================ */


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
   DATA  BORROWERS
============================================================ */

/*
    Borrowers are loaded from the server.

    We do NOT hard-code borrowers here anymore.
*/

let borrowers = [];

let sortedBorrowers = [];



/* ============================================================
   GET ACCESS TOKEN
============================================================ */

function getAccessToken() {

    const storedSession =
        localStorage.getItem("lendlySession");

    if (!storedSession) {
        return null;
    }

    try {

        const session =
            JSON.parse(storedSession);

        return session.access_token || null;

    } catch (error) {

        console.error(
            "Unable to read login session:",
            error
        );

        return null;

    }

}


/* ============================================================
   HELPERS
============================================================ */

function getFullName(borrower) {

    return `${borrower.first_name} ${borrower.last_name}`;

}



function getInitials(borrower) {

    return (
        borrower.first_name.charAt(0) +
        borrower.last_name.charAt(0)
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



/*
    There are currently no loans in the borrowers
    table.

    We will integrate this with the loans table
    when we build the loans functionality.
*/

function getCurrentLoan(borrower) {

    if (
        !borrower.loans ||
        borrower.loans.length === 0
    ) {

        return null;

    }


    const currentLoan =
        borrower.loans.find(
            loan =>
                loan.status === "active" ||
                loan.status === "overdue"
        );


    return currentLoan || null;

}



/* ============================================================
   LOAD BORROWERS
============================================================ */

async function loadBorrowers() {

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
                "/api/borrowers",
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
                "Borrowers loading error:",
                result
            );


            if (response.status === 401) {

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
                "Unable to load borrowers."
            );

        }


        borrowers =
            result.borrowers || [];


        sortedBorrowers =
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


        displayBorrowers(
            sortedBorrowers
        );


    } catch (error) {

        console.error(
            "Error loading borrowers:",
            error
        );


        borrowersList.innerHTML = `

            <div class="borrowers-empty">

                <h3>
                    Unable to load borrowers
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

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
                    You don't have any borrowers yet
                </h3>

                <p>
                    Add your first borrower.
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
                        `/borrowers/details?id=${borrower.id}`;

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
                                currentLoan &&
                                currentLoan.nextDueDate
                                    ? currentLoan.nextDueDate
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


                    const phone =
                        borrower.phone
                            .toLowerCase();


                    return (
                        fullName.includes(
                            searchTerm
                        ) ||
                        phone.includes(
                            searchTerm
                        )
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

        window.location.href =
            "/borrowers/create";

    }
);



/* ============================================================
   INITIALIZE
============================================================ */

loadBorrowers();