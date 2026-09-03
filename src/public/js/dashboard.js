// ============================================================
// DASHBOARD
// ============================================================


// ============================================================
// GET ELEMENTS
// ============================================================

const totalLentElement =
    document.getElementById("totalLent");

const growthElement =
    document.getElementById("growth");

const activeLoansElement =
    document.getElementById("activeLoans");

const collectedElement =
    document.getElementById("collected");

const outstandingElement =
    document.getElementById("outstanding");

const progressTextElement =
    document.getElementById("progressText");

const progressElement =
    document.getElementById("progress");

const collectedProgressElement =
    document.getElementById("collectedProgress");

const outstandingProgressElement =
    document.getElementById("outstandingProgress");

const collectionRateCardElement =
    document.getElementById("collectionRateCard");

const detailsButton =
    document.getElementById("detailsButton");

const activeLoansCard =
    document.getElementById("activeLoansCard");

const collectedCard =
    document.getElementById("collectedCard");

const profileButton =
    document.getElementById("profileButton");

const viewAllButton =
    document.getElementById("viewAllButton");

const loanList =
    document.getElementById("loanList");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const noBorrowersState =
    document.getElementById("noBorrowersState");

const noLoansState =
    document.getElementById("noLoansState");

const summaryGrid =
    document.getElementById("summaryGrid");

const dashboardGrid =
    document.getElementById("dashboardGrid");

const profileName =
    document.getElementById("userName");



// ============================================================
// DIAGNOSTIC: WARN ABOUT MISSING ELEMENTS
// ============================================================

const dashboardElements = {
    totalLentElement,
    growthElement,
    activeLoansElement,
    collectedElement,
    outstandingElement,
    progressTextElement,
    progressElement,
    collectedProgressElement,
    outstandingProgressElement,
    collectionRateCardElement,
    detailsButton,
    activeLoansCard,
    collectedCard,
    profileButton,
    viewAllButton,
    loanList,
    dashboardMessage,
    noBorrowersState,
    noLoansState,
    summaryGrid,
    dashboardGrid,
    profileName
};

Object.entries(dashboardElements).forEach(([name, element]) => {
    if (!element) {
        console.warn(`Dashboard: missing element in HTML for "${name}"`);
    }
});

// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    return "R" +
        Number(amount || 0).toLocaleString(
            "en-ZA",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


function formatCompactCurrency(amount) {

    amount =
        Number(amount || 0);


    if (amount >= 1000000) {

        return "R" +
            (amount / 1000000).toFixed(1) +
            "m";

    }


    if (amount >= 1000) {

        return "R" +
            (amount / 1000).toFixed(1) +
            "k";

    }


    return formatCurrency(amount);

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateString) {

    if (!dateString) {

        return "No due date";

    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================================
// GET SESSION
// ============================================================

function getSession() {

    const storedSession =
        localStorage.getItem(
            "lendlySession"
        );


    if (!storedSession) {

        return null;

    }


    try {

        return JSON.parse(
            storedSession
        );

    }
    catch (error) {

        console.error(
            "Unable to read session:",
            error
        );

        return null;

    }

}


// ============================================================
// HANDLE UNAUTHENTICATED USER
// ============================================================

function handleAuthenticationError() {

    localStorage.removeItem(
        "lendlySession"
    );

    localStorage.removeItem(
        "lendlyUser"
    );


    window.location.href =
        "/login";

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        // ==========================================
        // GET SESSION
        // ==========================================

        const session =
            getSession();


        if (
            !session ||
            !session.access_token
        ) {

            handleAuthenticationError();

            return;

        }


        // ==========================================
        // REQUEST DASHBOARD DATA
        // ==========================================

        const response =
            await fetch(
                "/api/dashboard",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${session.access_token}`
                    }
                }
            );


        // ==========================================
        // AUTHENTICATION FAILURE
        // ==========================================

        if (
            response.status === 401
        ) {

            handleAuthenticationError();

            return;

        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load dashboard."
            );

        }


        // ==========================================
        // RENDER DASHBOARD
        // ==========================================

        renderDashboard(
            result.dashboard
        );

    }
    catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        showMessage(
            "Unable to load dashboard data."
        );

    }

}


// ============================================================
// RENDER DASHBOARD
// ============================================================

function renderDashboard(
    dashboardData
) {

    const borrowers =
        dashboardData.borrowers || 0;

    const loans =
        dashboardData.loans || 0;


    // ==========================================
    // PROFILE
    // ==========================================

    if (
        dashboardData.profileName
    ) {

        profileName.textContent =
            dashboardData.profileName;

    }


    if (
        dashboardData.profileInitials
    ) {

        const profileAvatar =
            document.querySelector(
                ".user-avatar"
            );

        if (profileAvatar) {

            profileAvatar.textContent =
                dashboardData.profileInitials;

        }

    }


    // ==========================================
    // EMPTY STATES
    // ==========================================

    renderEmptyStates(
        borrowers,
        loans
    );


    // ==========================================
    // TOTAL LENT
    // ==========================================

    totalLentElement.textContent =
        formatCurrency(
            dashboardData.totalLent
        );


    // ==========================================
    // GROWTH
    // ==========================================

    const growth =
        Number(
            dashboardData.growth || 0
        );


    growthElement.textContent =
        `${growth >= 0 ? "↗" : "↘"} ${Math.abs(growth).toFixed(1)}%`;


    growthElement.classList.toggle(
        "positive",
        growth >= 0
    );


    // ==========================================
    // ACTIVE LOANS
    // ==========================================

    activeLoansElement.textContent =
        Number(
            dashboardData.activeLoans || 0
        );


    // ==========================================
    // COLLECTED
    // ==========================================

    collectedElement.textContent =
        formatCompactCurrency(
            dashboardData.collected
        );


    // ==========================================
    // OUTSTANDING
    // ==========================================

    outstandingElement.textContent =
        formatCompactCurrency(
            dashboardData.outstanding
        );


    // ==========================================
    // COLLECTION RATE
    // ==========================================

    const collectionRate =
        Number(
            dashboardData.collectionRate || 0
        );


    progressTextElement.textContent =
        `${collectionRate}%`;


    collectionRateCardElement.textContent =
        `${collectionRate}%`;


    progressElement.style.width =
        `${collectionRate}%`;


    // ==========================================
    // COLLECTION NUMBERS
    // ==========================================

    collectedProgressElement.textContent =
        formatCompactCurrency(
            dashboardData.collected
        );


    outstandingProgressElement.textContent =
        formatCompactCurrency(
            dashboardData.outstanding
        );


    // ==========================================
    // LIVE LOANS
    // ==========================================

    renderLiveLoans(
        (dashboardData.liveLoans || []).slice(0, 5)
    );

}


// ============================================================
// EMPTY STATES
// ============================================================

function renderEmptyStates(
    borrowerCount,
    loanCount
) {

    const hasBorrowers =
        Number(borrowerCount) > 0;

    const hasLoans =
        Number(loanCount) > 0;


    // ==========================================
    // NO BORROWERS
    // ==========================================

    if (noBorrowersState) {

        noBorrowersState.hidden =
            hasBorrowers;

    }


    // ==========================================
    // NO LOANS
    // ==========================================

    if (noLoansState) {

        noLoansState.hidden =
            !hasBorrowers ||
            hasLoans;

    }


    // ==========================================
    // DASHBOARD CONTENT
    // ==========================================

    /*
        If there are no borrowers, there cannot
        be any loans.

        In this case we hide the normal dashboard
        statistics and show the borrower empty state.
    */

    if (!hasBorrowers) {

        if (summaryGrid) {

            summaryGrid.hidden =
                true;

        }


        if (dashboardGrid) {

            dashboardGrid.hidden =
                true;

        }

        return;

    }


    /*
        If borrowers exist but there are no loans,
        show the normal dashboard with zeros and
        also show the "no loans" state.
    */

    if (summaryGrid) {

        summaryGrid.hidden =
            false;

    }


    if (dashboardGrid) {

        dashboardGrid.hidden =
            false;

    }

}


// ============================================================
// RENDER LIVE LOANS
// ============================================================

function renderLiveLoans(
    loans
) {

    loanList.innerHTML = "";


    // ==========================================
    // NO LIVE LOANS
    // ==========================================

    if (
        !loans ||
        loans.length === 0
    ) {

        loanList.innerHTML = `

            <div class="loan-item">

                <div class="loan-info">

                    <strong>
                        No live loans
                    </strong>

                    <span>
                        There are currently no active
                        or overdue loans.
                    </span>

                </div>

            </div>

        `;

        return;

    }


    // ==========================================
    // RENDER LOANS
    // ==========================================

    loans.forEach(
        loan => {

            const borrower =
                loan.borrower || {};


            const firstName =
                borrower.first_name ||
                "";

            const lastName =
                borrower.last_name ||
                "";


            const name =
                `${firstName} ${lastName}`.trim() ||
                "Unknown borrower";


            const phone =
                borrower.phone ||
                "No phone number";


            const initials =
                getInitials(name);


            const amount =
                formatCurrency(
                    loan.principal_amount
                );


            const status =
                loan.status;


            const statusText =
                status === "overdue"
                    ? "Overdue"
                    : "Active";


            const loanItem =
                document.createElement(
                    "div"
                );


            loanItem.className =
                "loan-item";


            loanItem.innerHTML = `

                <div class="borrower-avatar">
                    ${escapeHtml(initials)}
                </div>


                <div class="loan-info">

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                    <span>
                        ${escapeHtml(phone)}
                    </span>

                </div>


                <div class="loan-amount">

                    <strong>
                        ${escapeHtml(amount)}
                    </strong>

                    <span
                        class="status ${escapeHtml(status)}"
                    >
                        ${escapeHtml(statusText)}
                    </span>

                </div>

            `;


            loanList.appendChild(
                loanItem
            );

        }
    );

}


// ============================================================
// GET INITIALS
// ============================================================

function getInitials(
    name
) {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 0
    ) {

        return "?";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// SHOW MESSAGE
// ============================================================

let messageTimeout;


function showMessage(
    message
) {

    clearTimeout(
        messageTimeout
    );


    dashboardMessage.textContent =
        message;


    dashboardMessage.classList.add(
        "show"
    );


    messageTimeout =
        setTimeout(
            () => {

                dashboardMessage.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// ============================================================
// VIEW DETAILS
// ============================================================

if (detailsButton) {

    detailsButton.addEventListener(
        "click",
        function() {

            showMessage(
                "Opening collections..."
            );


            window.location.href =
                "/collections";

        }
    );

}


// ============================================================
// ACTIVE LOANS
// ============================================================

if (activeLoansCard) {

    activeLoansCard.addEventListener(
        "click",
        function() {

            showMessage(
                `${activeLoansElement.textContent} active loans`
            );


            window.location.href =
                "/loans";

        }
    );


    activeLoansCard.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                activeLoansCard.click();

            }

        }
    );

}


// ============================================================
// COLLECTED
// ============================================================

if (collectedCard) {

    collectedCard.addEventListener(
        "click",
        function() {

            showMessage(
                `${collectedElement.textContent} has been collected`
            );


            window.location.href =
                "/collections";

        }
    );


    collectedCard.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                collectedCard.click();

            }

        }
    );

}


// ============================================================
// USER PROFILE
// ============================================================

if (profileButton) {

    profileButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "/profile";

        }
    );

}


// ============================================================
// VIEW ALL LOANS
// ============================================================

if (viewAllButton) {

    viewAllButton.addEventListener(
        "click",
        function() {

            showMessage(
                "Opening all loans..."
            );


            window.location.href =
                "/loans";

        }
    );

}


// ============================================================
// INITIAL LOAD
// ============================================================

loadDashboard();
