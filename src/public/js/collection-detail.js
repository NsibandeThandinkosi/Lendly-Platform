/* ============================================================
   LENDLY - COLLECTION DETAILS
============================================================ */


// ============================================================
// STATE
// ============================================================

let loan = null;

let installments = [];


// ============================================================
// GET LOAN ID FROM URL
// ============================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const loanId =
    params.get("id");


// ============================================================
// ELEMENTS
// ============================================================

const notificationButton =
    document.getElementById("notificationButton");

const profileButton =
    document.getElementById("profileButton");

const deleteRecordButton =
    document.getElementById("deleteRecordButton");


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
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount || 0)
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateString) {

    if (!dateString) {

        return "--";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


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
// GET INITIALS
// ============================================================

function getInitials(name) {

    return name
        .split(" ")
        .filter(
            word => word.length > 0
        )
        .map(
            word => word[0]
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


// ============================================================
// LOAD COLLECTION FROM SERVER
// ============================================================

async function loadCollection() {

    if (!loanId) {

        alert(
            "No collection was specified."
        );

        window.location.href =
            "/collections";

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
                `/api/collections/${encodeURIComponent(loanId)}`,
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
                "Load collection error:",
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


            alert(
                result.message ||
                "The collection record could not be found."
            );

            window.location.href =
                "/collections";

            return;

        }


        loan =
            result.loan;


        installments =
            result.installments || [];


        displayLoan();

    } catch (error) {

        console.error(
            "Load collection request failed:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

        window.location.href =
            "/collections";

    }

}


// ============================================================
// DISPLAY LOAN
// ============================================================

function displayLoan() {

    const borrower =
        loan.borrowers;


    const borrowerName =
        borrower
            ? `${borrower.first_name} ${borrower.last_name}`
            : "Unknown borrower";


    const borrowerPhone =
        borrower
            ? borrower.phone
            : "--";


    /* ========================================================
       HEADER
    ======================================================== */

    document.getElementById(
        "borrowerAvatar"
    ).textContent =
        getInitials(
            borrowerName
        );


    document.getElementById(
        "borrowerName"
    ).textContent =
        borrowerName;



    /* ========================================================
       OVERVIEW
    ======================================================== */

    document.getElementById(
        "originalLoan"
    ).textContent =
        formatCurrency(
            loan.principal_amount
        );


    document.getElementById(
        "totalPaid"
    ).textContent =
        formatCurrency(
            loan.total_repayment
        );


    document.getElementById(
        "startDate"
    ).textContent =
        formatDate(
            loan.start_date
        );


    document.getElementById(
        "fulfilledDate"
    ).textContent =
        formatDate(
            loan.settlement_date
        );



    /* ========================================================
       PERSONAL DETAILS
    ======================================================== */

    document.getElementById(
        "firstName"
    ).textContent =
        borrower
            ? borrower.first_name
            : "--";


    document.getElementById(
        "lastName"
    ).textContent =
        borrower
            ? borrower.last_name
            : "--";


    document.getElementById(
        "phone"
    ).textContent =
        borrowerPhone;



    /* ========================================================
       PAYMENT TOTAL
    ======================================================== */

    document.getElementById(
        "paymentTotal"
    ).textContent =
        formatCurrency(
            loan.total_repayment
        );



    /* ========================================================
       PAYMENT HISTORY
    ======================================================== */

    displayPayments();

}


// ============================================================
// DISPLAY PAYMENTS
// ============================================================

function displayPayments() {

    const paymentHistory =
        document.getElementById(
            "paymentHistory"
        );


    paymentHistory.innerHTML = "";


    if (installments.length === 0) {

        paymentHistory.innerHTML = `

            <tr>

                <td colspan="3">
                    No payments recorded for this loan.
                </td>

            </tr>

        `;

        return;

    }


    installments.forEach(
        installment => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    Installment #${installment.installment_number}
                </td>

                <td>
                    ${formatDate(installment.paid_date)}
                </td>

                <td class="payment-amount">
                    ${formatCurrency(installment.amount_paid)}
                </td>

            `;


            paymentHistory.appendChild(row);

        }
    );

}


// ============================================================
// DELETE RECORD
// ============================================================

if (deleteRecordButton) {

    deleteRecordButton.addEventListener(
        "click",
        async () => {

            const borrower =
                loan.borrowers;


            const borrowerName =
                borrower
                    ? `${borrower.first_name} ${borrower.last_name}`
                    : "this borrower";


            const confirmed =
                confirm(
                    `Delete the collection record for ${borrowerName}?`
                );


            if (!confirmed) {
                return;
            }


            const accessToken =
                getAccessToken();


            if (!accessToken) {

                window.location.href =
                    "/login";

                return;

            }


            deleteRecordButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `/api/collections/${encodeURIComponent(loanId)}`,
                        {
                            method: "DELETE",

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
                        "Unable to delete collection."
                    );

                    deleteRecordButton.disabled =
                        false;

                    return;

                }


                window.location.href =
                    "/collections";

            } catch (error) {

                console.error(
                    "Delete collection request failed:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

                deleteRecordButton.disabled =
                    false;

            }

        }
    );

}


// ============================================================
// NOTIFICATIONS
// ============================================================

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "/notifications";

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
// INITIALIZE
// ============================================================

loadCollection();