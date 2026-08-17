// ============================================================
// HARD-CODED DASHBOARD DATA
// ============================================================

const dashboardData = {

    totalLent: 25480,

    growth: 12.8,

    activeLoans: 24,

    collected: 18200,

    collectionProgress: 82

};


// ============================================================
// GET ELEMENTS
// ============================================================

const totalLentElement =
    document.getElementById("totalLent");

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

const detailsButton =
    document.getElementById("detailsButton");


const activeLoansCard =
    document.getElementById("activeLoansCard");

const collectedCard =
    document.getElementById("collectedCard");


const notificationButton =
    document.getElementById("notificationButton");


const profileButton =
    document.getElementById("profileButton");

const viewAllButton =
    document.getElementById("viewAllButton");


const dashboardMessage =
    document.getElementById("dashboardMessage");


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    return "R" +
        amount.toLocaleString("en-ZA");

}


function formatCompactCurrency(amount) {

    if (amount >= 1000) {

        return "R" +
            (amount / 1000).toFixed(1) +
            "k";

    }

    return formatCurrency(amount);

}


// ============================================================
// RENDER DASHBOARD
// ============================================================

function renderDashboard() {

    totalLentElement.textContent =
        formatCurrency(
            dashboardData.totalLent
        );


    activeLoansElement.textContent =
        dashboardData.activeLoans;


    collectedElement.textContent =
        formatCompactCurrency(
            dashboardData.collected
        );


    const outstanding =
        dashboardData.totalLent -
        dashboardData.collected;


    outstandingElement.textContent =
        formatCompactCurrency(
            outstanding
        );


    progressTextElement.textContent =
        `${dashboardData.collectionProgress}%`;


    progressElement.style.width =
        `${dashboardData.collectionProgress}%`;

}


// ============================================================
// SHOW MESSAGE
// ============================================================

let messageTimeout;


function showMessage(message) {

    clearTimeout(messageTimeout);


    dashboardMessage.textContent =
        message;


    dashboardMessage.classList.add(
        "show"
    );


    messageTimeout =
        setTimeout(() => {

            dashboardMessage.classList.remove(
                "show"
            );

        }, 2500);

}


// ============================================================
// VIEW DETAILS
// ============================================================

detailsButton.addEventListener(
    "click",
    function() {

        showMessage(
            `${dashboardData.activeLoans} active loans with ${dashboardData.collectionProgress}% collected`
        );

    }
);


// ============================================================
// ACTIVE LOANS
// ============================================================

activeLoansCard.addEventListener(
    "click",
    function() {

        showMessage(
            `You currently have ${dashboardData.activeLoans} active loans`
        );
        window.location.href = "loans.html";

    }
);


// ============================================================
// COLLECTED
// ============================================================

collectedCard.addEventListener(
    "click",
    function() {

        showMessage(
            `${formatCurrency(dashboardData.collected)} has been collected`
        );

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
// VIEW ALL LOANS
// ============================================================

viewAllButton.addEventListener(
    "click",
    function() {

        showMessage(
            "Opening all loans..."
        );
        window.location.href = "loans.html";

    }
);


// ============================================================
// INITIAL LOAD
// ============================================================

renderDashboard();