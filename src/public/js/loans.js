// ============================================================
// LENDLY - LOANS
// ============================================================


// ============================================================
// HARD-CODED LOAN DATA
// ============================================================

const defaultLoans = [

    {
        id: "LN-1024",

        borrower: "John Mokoena",

        phone: "+27 71 234 5678",

        amount: 5000,

        remaining: 3500,

        monthlyPayment: 500,

        nextDueDate: "2026-08-10",

        startDate: "2026-04-10",

        term: 12,

        interestRate: 10,

        purpose: "Personal expenses",

        status: "active"
    },


    {
        id: "LN-1021",

        borrower: "Lerato Maseko",

        phone: "+27 72 345 6789",

        amount: 8000,

        remaining: 6000,

        monthlyPayment: 800,

        nextDueDate: "2026-08-05",

        startDate: "2026-03-05",

        term: 12,

        interestRate: 12,

        purpose: "Business expenses",

        status: "active"
    },


    {
        id: "LN-1030",

        borrower: "Thabo Molefe",

        phone: "+27 73 456 7890",

        amount: 3200,

        remaining: 2400,

        monthlyPayment: 400,

        nextDueDate: "2026-08-20",

        startDate: "2026-06-20",

        term: 8,

        interestRate: 8,

        purpose: "School expenses",

        status: "active"
    },


    {
        id: "LN-1019",

        borrower: "Sarah Ndlovu",

        phone: "+27 74 567 8901",

        amount: 12000,

        remaining: 9000,

        monthlyPayment: 1000,

        nextDueDate: "2026-07-25",

        startDate: "2026-02-25",

        term: 12,

        interestRate: 10,

        purpose: "Home improvement",

        status: "active"
    },


    {
        id: "LN-1028",

        borrower: "Sipho Dlamini",

        phone: "+27 75 678 9012",

        amount: 6500,

        remaining: 5200,

        monthlyPayment: 650,

        nextDueDate: "2026-08-28",

        startDate: "2026-05-28",

        term: 10,

        interestRate: 9,

        purpose: "Vehicle expenses",

        status: "active"
    }

];



// ============================================================
// LOAD LOANS
// ============================================================

let loans =
    JSON.parse(
        localStorage.getItem("lendlyLoans")
    );


if (!loans) {

    loans = defaultLoans;

    saveLoans();

}


// ============================================================
// SAVE LOANS
// ============================================================

function saveLoans() {

    localStorage.setItem(
        "lendlyLoans",
        JSON.stringify(loans)
    );

}


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
                loan.status === "active"
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
                            ${loan.id}
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


                    <button
                        class="
                            loan-action-button
                            edit
                        "
                        data-action="edit"
                        data-id="${loan.id}"
                    >
                        Edit
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
// ADD ONE MONTH TO NEXT PAYMENT
// ============================================================

function movePaymentToNextMonth(
    loan
) {

    const currentDate =
        new Date(
            loan.nextDueDate + "T00:00:00"
        );


    const originalDay =
        currentDate.getDate();


    currentDate.setMonth(
        currentDate.getMonth() + 1
    );


    /*
       Handle months with fewer days.

       Example:
       31 August -> 30 September
    */

    if (
        currentDate.getDate() !==
        originalDay
    ) {

        currentDate.setDate(0);

    }


    const year =
        currentDate.getFullYear();


    const month =
        String(
            currentDate.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            currentDate.getDate()
        ).padStart(2, "0");


    loan.nextDueDate =
        `${year}-${month}-${day}`;

}


// ============================================================
// MONTHLY PAYMENT
// ============================================================

function recordMonthlyPayment(
    loanId
) {

    const loan =
        loans.find(
            item =>
                item.id === loanId
        );


    if (!loan) {
        return;
    }


    const confirmed =
        confirm(
            `Record the monthly payment of ${formatMoney(
                loan.monthlyPayment
            )} from ${loan.borrower}?`
        );


    if (!confirmed) {
        return;
    }


    /*
       Reduce remaining balance.

       This assumes the hard-coded monthly
       payment goes directly against the
       remaining balance for now.
    */

    loan.remaining =
        Math.max(
            0,
            loan.remaining -
            loan.monthlyPayment
        );


    movePaymentToNextMonth(
        loan
    );


    saveLoans();

    renderLoans();

}


// ============================================================
// CLEAR LOAN
// ============================================================

function clearLoan(
    loanId
) {

    const loan =
        loans.find(
            item =>
                item.id === loanId
        );


    if (!loan) {
        return;
    }


    const confirmed =
        confirm(
            `Mark ${loan.borrower}'s loan ${loan.id} as fully paid and collected?`
        );


    if (!confirmed) {
        return;
    }


    /*
       Change status to collected.

       It will no longer appear on this page
       because this page only shows active loans.
    */

    loan.status =
        "collected";


    loan.remaining =
        0;


    loan.clearedDate =
        new Date()
            .toISOString()
            .split("T")[0];


    saveLoans();

    renderLoans();

}


// ============================================================
// BUTTON HANDLER
// ============================================================

loansList.addEventListener(
    "click",
    function(event) {

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
                `loan-details.html?id=${loanId}`;

            return;

        }


        // -------------------------
        // MONTHLY PAYMENT
        // -------------------------

        if (
            action ===
            "payment"
        ) {

            recordMonthlyPayment(
                loanId
            );

            return;

        }


        // -------------------------
        // CLEAR LOAN
        // -------------------------

        if (
            action ===
            "clear"
        ) {

            clearLoan(
                loanId
            );

            return;

        }


        // -------------------------
        // EDIT
        // -------------------------

        if (
            action ===
            "edit"
        ) {

            window.location.href =
                `loan-details.html?id=${loanId}&edit=true`;

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
// INITIAL RENDER
// ============================================================

renderLoans();