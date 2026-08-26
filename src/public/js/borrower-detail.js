/* ============================================================
   LENDLY - BORROWER DETAILS
============================================================ */


/* ============================================================
   GET BORROWER ID
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const borrowerId =
    params.get("id");



/* ============================================================
   ELEMENTS
============================================================ */

const borrowerAvatar =
    document.getElementById(
        "borrowerAvatar"
    );


const borrowerName =
    document.getElementById(
        "borrowerName"
    );


const borrowerPhone =
    document.getElementById(
        "borrowerPhone"
    );


const firstName =
    document.getElementById(
        "firstName"
    );


const lastName =
    document.getElementById(
        "lastName"
    );


const phone =
    document.getElementById(
        "phone"
    );


const borrowerLoans =
    document.getElementById(
        "borrowerLoans"
    );


const createLoanBtn =
    document.getElementById(
        "createLoanBtn"
    );



/* ============================================================
   AUTHENTICATION
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

        if (!session || !session.access_token) {
            return null;
        }

        return session.access_token;

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

function getInitials(borrower) {

    return (
        borrower.first_name.charAt(0) +
        borrower.last_name.charAt(0)
    ).toUpperCase();

}



function formatCurrency(amount) {

    if (
        amount === null ||
        amount === undefined
    ) {

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
   LOAD BORROWER
============================================================ */

async function loadBorrower() {

    if (!borrowerId) {

        showBorrowerError(
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
                    "lendlyUser"
                );
                localStorage.removeItem(
                    "lendlySession"
                );

                window.location.href =
                    "/login";

                return;

            }


            throw new Error(
                result.message ||
                "Borrower could not be found."
            );

        }


        displayBorrower(
            result.borrower
        );


    } catch (error) {

        console.error(
            "Error loading borrower:",
            error
        );


        showBorrowerError(
            error.message
        );

    }

}



/* ============================================================
   DISPLAY BORROWER
============================================================ */

function displayBorrower(borrower) {

    if (!borrower) {

        showBorrowerError(
            "Borrower could not be found."
        );

        return;

    }


    borrowerAvatar.textContent =
        getInitials(
            borrower
        );


    borrowerName.textContent =
        `${borrower.first_name} ${borrower.last_name}`;


    borrowerPhone.textContent =
        borrower.phone;


    firstName.textContent =
        borrower.first_name;


    lastName.textContent =
        borrower.last_name;


    phone.textContent =
        borrower.phone;


    /*
        The borrowers table currently doesn't
        contain loan information.

        We will connect loans here once the
        loans table/API is implemented.
    */

    displayLoans([]);


    createLoanBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                `/create-loan.html?borrowerId=${borrower.id}`;

        }
    );

}



/* ============================================================
   DISPLAY LOANS
============================================================ */

function displayLoans(loans) {

    borrowerLoans.innerHTML = "";


    if (
        !loans ||
        loans.length === 0
    ) {

        borrowerLoans.innerHTML = `

            <div class="no-loans">

                This borrower has no loan history yet.

            </div>

        `;

        return;

    }


    const sortedLoans =
        [...loans].sort(
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


            borrowerLoans.appendChild(
                row
            );

        }
    );

}



/* ============================================================
   ERROR DISPLAY
============================================================ */

function showBorrowerError(message) {

    borrowerName.textContent =
        "Unable to load borrower";


    borrowerPhone.textContent =
        "--";


    firstName.textContent =
        "--";


    lastName.textContent =
        "--";


    phone.textContent =
        "--";


    borrowerLoans.innerHTML = `

        <div class="no-loans">

            ${message}

        </div>

    `;

}



/* ============================================================
   INITIALIZE
============================================================ */

loadBorrower();