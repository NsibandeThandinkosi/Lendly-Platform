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


const menuButton =
    document.getElementById("menuButton");

const menuDropdown =
    document.getElementById("menuDropdown");


const refreshButton =
    document.getElementById("refreshButton");

const detailsButton =
    document.getElementById("detailsButton");


const activeLoansCard =
    document.getElementById("activeLoansCard");

const collectedCard =
    document.getElementById("collectedCard");


const notificationButton =
    document.getElementById("notificationButton");

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
// THREE DOT MENU
// ============================================================

menuButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        menuDropdown.classList.toggle(
            "open"
        );

    }
);


// ============================================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// ============================================================

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".panel-header"
            )
        ) {

            menuDropdown.classList.remove(
                "open"
            );

        }

    }
);


// ============================================================
// REFRESH
// ============================================================

refreshButton.addEventListener(
    "click",
    function() {

        renderDashboard();


        menuDropdown.classList.remove(
            "open"
        );


        showMessage(
            "Dashboard data refreshed"
        );

    }
);


// ============================================================
// VIEW DETAILS
// ============================================================

detailsButton.addEventListener(
    "click",
    function() {

        menuDropdown.classList.remove(
            "open"
        );


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

        showMessage(
            "You have 3 new notifications"
        );

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

    }
);


// ============================================================
// INITIAL LOAD
// ============================================================

renderDashboard();