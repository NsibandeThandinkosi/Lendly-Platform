// ============================================================
// LENDLY - LOANS
// ============================================================


// ============================================================
// STATE
// ============================================================

let loans = [];


// ============================================================
// ELEMENTS
// ============================================================

const loansList =
    document.getElementById("loansList");

const loansEmpty =
    document.getElementById("loansEmpty");

const activeLoanCount =
    document.getElementById("activeLoanCount");

const overdueLoanCount =
    document.getElementById("overdueLoanCount");

const notificationButton =
    document.getElementById("notificationButton");

const profileButton =
    document.getElementById("profileButton");


// ============================================================
// AUTHENTICATION
// ============================================================

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


// ============================================================
// LOAD LOANS FROM SERVER
// ============================================================

async function loadLoans() {

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
                "/api/loans/active",
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
                "Load loans error:",
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


            loansList.style.display =
                "none";

            loansEmpty.style.display =
                "block";

            loansEmpty.textContent =
                result.message ||
                "Unable to load loans.";

            return;

        }


        /*
            Map server rows into the shape
            the rest of this file expects.
        */

        loans =
            (result.loans || []).map(
                function(loan) {

                    const borrowerName =
                        loan.borrowers
                            ? `${loan.borrowers.first_name} ${loan.borrowers.last_name}`
                            : "Unknown borrower";


                    const borrowerPhone =
                        loan.borrowers
                            ? loan.borrowers.phone
                            : "";


                    return {

                        id:
                            loan.id,

                        borrower:
                            borrowerName,

                        phone:
                            borrowerPhone,

                        amount:
                            loan.principal_amount,

                        remaining:
                            loan.remaining_amount,

                        monthlyPayment:
                            loan.monthly_payment,

                        nextDueDate:
                            loan.next_due_date,

                        startDate:
                            loan.start_date,

                        term:
                            loan.duration_months,

                        interestRate:
                            loan.interest_rate,

                        status:
                            loan.status

                    };

                }
            );


        renderLoans();

    } catch (error) {

        console.error(
            "Load loans request failed:",
            error
        );

        loansList.style.display =
            "none";

        loansEmpty.style.display =
            "block";

        loansEmpty.textContent =
            "Unable to connect to the server.";

    }

}


// ============================================================
// TODAY
// ============================================================

function getToday() {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return today;

}


// ============================================================
// CHECK IF LOAN IS OVERDUE
// ============================================================

function isOverdue(loan) {

    const dueDate =
        new Date(
            loan.nextDueDate + "T00:00:00"
        );

    return dueDate < getToday();

}


// ============================================================
// DAYS OVERDUE
// ============================================================

function getDaysOverdue(loan) {

    if (!isOverdue(loan)) {
        return 0;
    }


    const dueDate =
        new Date(
            loan.nextDueDate + "T00:00:00"
        );


    const difference =
        getToday() - dueDate;


    return Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(amount) {

    return "R" +
        Number(amount).toLocaleString(
            "en-ZA"
        );

}


// ============================================================
// BORROWER INITIALS
// ============================================================

function getInitials(name) {

    return name
        .split(" ")
        .map(
            word =>
                word[0]
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


// ============================================================
// SORT LOANS
//
// 1. Overdue loans first
// 2. Most overdue first
// 3. Active loans ordered by next due date
// ============================================================

function sortLoans(loanArray) {

    return loanArray.sort(
        function(a, b) {

            const aOverdue =
                isOverdue(a);

            const bOverdue =
                isOverdue(b);


            // Both overdue

            if (
                aOverdue &&
                bOverdue
            ) {

                return (
                    getDaysOverdue(b) -
                    getDaysOverdue(a)
                );

            }


            // A overdue

            if (aOverdue) {
                return -1;
            }


            // B overdue

            if (bOverdue) {
                return 1;
            }


            // Both active

            return (
                new Date(
                    a.nextDueDate
                ) -

                new Date(
                    b.nextDueDate
                )
            );

        }
    );

}


// ============================================================
// RENDER LOANS
// ============================================================

function renderLoans() {

    loansList.innerHTML = "";


    const activeLoans =
        loans.filter(
            loan =>
                loan.status === "active" ||
                loan.status === "overdue"
        );


    const sortedLoans =
        sortLoans(activeLoans);


    // Update counts

    const overdueLoans =
        activeLoans.filter(
            loan =>
                isOverdue(loan)
        );


    activeLoanCount.textContent =
        activeLoans.length;


    overdueLoanCount.textContent =
        overdueLoans.length;


    // Empty state

    if (sortedLoans.length === 0) {

        loansList.style.display =
            "none";

        loansEmpty.style.display =
            "block";

        return;

    }


    loansList.style.display =
        "flex";

    loansEmpty.style.display =
        "none";


    // Render every loan

    sortedLoans.forEach(
        function(loan) {

            const overdue =
                isOverdue(loan);


            const daysOverdue =
                getDaysOverdue(loan);


            const loanElement =
                document.createElement(
                    "div"
                );


            loanElement.className =
                "loan-item";


            loanElement.innerHTML = `

                <div
                    class="
                        loan-status-indicator
                        ${overdue ? "overdue" : ""}
                    "
                ></div>


                <div class="loan-borrower">

                    <div class="loan-avatar">

                        ${getInitials(
                            loan.borrower
                        )}

                    </div>


                    <div class="loan-borrower-info">

                        <strong>
                            ${loan.borrower}
                        </strong>

                        <span>
                            ${loan.phone}
                        </span>

                    </div>

                </div>


                <div class="loan-amount">

                    <span class="loan-info-label">
                        Remaining
                    </span>

                    <strong>
                        ${formatMoney(
                            loan.remaining
                        )}
                    </strong>

                </div>


                <div
                    class="
                        loan-next-payment
                        ${overdue ? "overdue" : ""}
                    "
                >

                    <span class="loan-info-label">
                        Next due date
                    </span>

                    <strong>
                        ${formatDate(
                            loan.nextDueDate
                        )}
                    </strong>

                    ${
                        overdue
                        ?
                        `
                        <span>
                            ${daysOverdue}
                            ${
                                daysOverdue === 1
                                ? "day"
                                : "days"
                            }
                            overdue
                        </span>
                        `
                        :
                        `
                        <span>
                            Monthly payment:
                            ${formatMoney(
                                loan.monthlyPayment
                            )}
                        </span>
                        `
                    }

                </div>


                <div class="loan-actions">

                    <button
                        class="loan-action-button"
                        data-action="details"
                        data-id="${loan.id}"
                    >
                        View Details
                    </button>


                    <button
                        class="
                            loan-action-button
                            payment
                        "
                        data-action="payment"
                        data-id="${loan.id}"
                    >
                        Monthly Payment
                    </button>


                    <button
                        class="
                            loan-action-button
                            clear
                        "
                        data-action="clear"
                        data-id="${loan.id}"
                    >
                        Clear Loan
                    </button>

                </div>

            `;


            loansList.appendChild(
                loanElement
            );

        }
    );

}


// ============================================================
// BUTTON HANDLER
// ============================================================

loansList.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".loan-action-button"
            );


        if (!button) {
            return;
        }


        const loanId =
            button.dataset.id;


        const action =
            button.dataset.action;


        // -------------------------
        // VIEW DETAILS
        // -------------------------

        if (
            action ===
            "details"
        ) {

            window.location.href =
                `/loans/details?id=${loanId}`;

            return;

        }


        // -------------------------
        // MONTHLY PAYMENT
        // -------------------------

        if (
            action ===
            "payment"
        ) {

            const accessToken =
                getAccessToken();


            if (!accessToken) {

                window.location.href =
                    "/login";

                return;

            }


            const selectedLoan =
                loans.find(
                    loan =>
                        loan.id === loanId
                );


            if (!selectedLoan) {

                alert(
                    "Loan could not be found."
                );

                return;

            }


            const paymentAmount =
                Math.min(
                    Number(selectedLoan.remaining),
                    Number(selectedLoan.monthlyPayment)
                );


            const confirmed =
                confirm(
                    `Record a monthly payment of ${formatMoney(
                        paymentAmount
                    )}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/loans/${loanId}/payment`,
                        {
                            method: "PATCH",

                            headers: {
                                Authorization:
                                    `Bearer ${accessToken}`
                            }
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to record payment."
                    );

                    return;

                }


                alert(
                    result.message
                );


                await loadLoans();


            } catch (error) {

                console.error(
                    "Monthly payment error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

            }


            return;

        }


        // -------------------------
        // CLEAR LOAN
        // -------------------------

        if (
            action ===
            "clear"
        ) {

            const accessToken =
                getAccessToken();


            if (!accessToken) {

                window.location.href =
                    "/login";

                return;

            }


            const selectedLoan =
                loans.find(
                    loan =>
                        loan.id === loanId
                );


            if (!selectedLoan) {

                alert(
                    "Loan could not be found."
                );

                return;

            }


            const confirmed =
                confirm(
                    `Clear this loan by paying the remaining balance of ${formatMoney(
                        selectedLoan.remaining
                    )}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/loans/${loanId}/clear`,
                        {
                            method: "PATCH",

                            headers: {
                                Authorization:
                                    `Bearer ${accessToken}`
                            }
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to clear loan."
                    );

                    return;

                }


                alert(
                    result.message
                );


                await loadLoans();


            } catch (error) {

                console.error(
                    "Clear loan error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

            }


            return;

        }

    }
);

// ============================================================
// NOTIFICATIONS
// ============================================================

notificationButton.addEventListener(
    "click",
    function() {

        window.location.href = "notifications.html";

    }
);


// ============================================================
// USER PROFILE
// ============================================================

profileButton.addEventListener(
    "click",
    function() {

        window.location.href = "profile.html";

    }
);



// ============================================================
// INITIAL LOAD
// ============================================================

loadLoans();