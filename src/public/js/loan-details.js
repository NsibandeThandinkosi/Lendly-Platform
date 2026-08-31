// ============================================================
// LENDLY - LOAN DETAILS
// ============================================================


// ============================================================
// STATE
// ============================================================

let loan = null;


// ============================================================
// GET LOAN ID FROM URL
// ============================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const loanId =
    params.get("id");


const shouldEdit =
    params.get("edit") === "true";


// ============================================================
// ELEMENTS
// ============================================================

const loanDetails =
    document.getElementById(
        "loanDetails"
    );


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
// FORMAT MONEY
// ============================================================

function formatMoney(
    amount
) {

    return "R" +
        Number(amount).toLocaleString(
            "en-ZA"
        );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// ============================================================
// INITIALS
// ============================================================

function getInitials(
    name
) {

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
// OVERDUE
// ============================================================

function isOverdue() {

    if (
        !loan ||
        loan.status === "settled" ||
        !loan.next_due_date
    ) {

        return false;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const dueDate =
        new Date(
            loan.next_due_date +
            "T00:00:00"
        );


    return dueDate < today;

}

// ============================================================
// SHOW NOT FOUND
// ============================================================

function showNotFound(message) {

    loanDetails.innerHTML = `

        <div
            style="
                padding: 80px;
                text-align: center;
            "
        >

            <h2>
                Loan not found
            </h2>

            <p>
                ${
                    message ||
                    "This loan may have been removed or collected."
                }
            </p>

            <br>

            <a href="/loans">
                Back to Loans
            </a>

        </div>

    `;

}


// ============================================================
// LOAD LOAN FROM SERVER
// ============================================================

async function loadLoan() {

    if (!loanId) {

        showNotFound(
            "No loan was specified."
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
                `/api/loans/${encodeURIComponent(loanId)}`,
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
                "Load loan error:",
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


            showNotFound(
                result.message
            );

            return;

        }


        loan =
            result.loan;


        renderLoanDetails();

    } catch (error) {

        console.error(
            "Load loan request failed:",
            error
        );

        showNotFound(
            "Unable to connect to the server."
        );

    }

}


// ============================================================
// RENDER DETAILS
// ============================================================

function renderLoanDetails() {

    const overdue =
        isOverdue();


    const borrowerName =
        loan.borrowers
            ? `${loan.borrowers.first_name} ${loan.borrowers.last_name}`
            : "Unknown borrower";


    const borrowerPhone =
        loan.borrowers
            ? loan.borrowers.phone
            : "";


    const settled =
        loan.status === "settled";


    loanDetails.innerHTML = `

        <!-- HEADER -->

        <div class="loan-details-header">

            <div class="loan-details-borrower">

                <div class="loan-details-avatar">

                    ${getInitials(
                        borrowerName
                    )}

                </div>


                <div>

                    <h2>
                        ${borrowerName}
                    </h2>

                    <p>
                        ${borrowerPhone}
                    </p>

                </div>

            </div>


            <div
                class="
                    loan-details-status
                    ${overdue ? "overdue" : ""}
                "
            >

                ${
                    settled
                    ? "Settled"
                    : overdue
                    ? "Overdue"
                    : "Active"
                }

            </div>

        </div>



        <!-- BODY -->

        <div class="loan-details-body">


            <!-- LOAN INFORMATION -->

            <div class="loan-details-section">

                <h3>
                    Loan Information
                </h3>


                <div class="loan-details-grid">


                    <div class="loan-detail-field">

                        <span>
                            Original Loan
                        </span>

                        <strong>
                            ${formatMoney(
                                loan.principal_amount
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Remaining Balance
                        </span>

                        <strong>
                            ${formatMoney(
                                loan.remaining_amount
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Monthly Payment
                        </span>

                        <strong>
                            ${formatMoney(
                                loan.monthly_payment
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Interest Rate
                        </span>

                        <strong>
                            ${loan.interest_rate}%
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Loan Term
                        </span>

                        <strong>
                            ${loan.duration_months} months
                        </strong>

                    </div>

                </div>

            </div>



            <!-- PAYMENT INFORMATION -->

            <div class="loan-details-section">

                <h3>
                    Payment Information
                </h3>


                <div class="loan-details-grid">


                    <div class="loan-detail-field">

                        <span>
                            Loan Start Date
                        </span>

                        <strong>
                            ${formatDate(
                                loan.start_date
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Next Due Date
                        </span>

                        <strong>
                            ${
                                loan.next_due_date
                                ? formatDate(
                                    loan.next_due_date
                                )
                                : "—"
                            }
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Borrower Phone
                        </span>

                        <strong>
                            ${borrowerPhone}
                        </strong>

                    </div>

                </div>

            </div>


        </div>



        <!-- ACTIONS -->

        <div class="loan-details-actions">


            <button
                class="
                    loan-details-action
                    payment
                "
                id="paymentButton"
                ${settled ? "disabled" : ""}
            >
                Monthly Payment
            </button>


            <button
                class="
                    loan-details-action
                    clear
                "
                id="clearLoanButton"
                ${settled ? "disabled" : ""}
            >
                Clear Loan
            </button>


        </div>

    `;


    attachButtons();

}


// ============================================================
// ATTACH BUTTONS
// ============================================================

function attachButtons() {

    const paymentButton =
        document.getElementById(
            "paymentButton"
        );


    const clearButton =
        document.getElementById(
            "clearLoanButton"
        );


    // -----------------------------------------
    // MONTHLY PAYMENT
    // -----------------------------------------

    paymentButton.addEventListener(
        "click",
        async function() {

            const confirmed =
                confirm(
                    `Record the monthly payment of ${formatMoney(
                        loan.monthly_payment
                    )}?`
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


            paymentButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `/api/loans/${encodeURIComponent(loanId)}/payment`,
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

                    paymentButton.disabled =
                        false;

                    return;

                }


                loan =
                    result.loan;


                renderLoanDetails();

            } catch (error) {

                console.error(
                    "Record payment request failed:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

                paymentButton.disabled =
                    false;

            }

        }
    );


    // -----------------------------------------
    // CLEAR LOAN
    // -----------------------------------------

    clearButton.addEventListener(
        "click",
        async function() {

            const confirmed =
                confirm(
                    `Clear this loan by recording the remaining balance of ${formatMoney(
                        loan.remaining_amount
                    )} as the final payment?`
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


            clearButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `/api/loans/${encodeURIComponent(loanId)}/clear`,
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

                    clearButton.disabled =
                        false;

                    return;

                }


                window.location.href =
                    "/loans";

            } catch (error) {

                console.error(
                    "Clear loan request failed:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

                clearButton.disabled =
                    false;

            }

        }
    );

}





// ============================================================
// INITIAL LOAD
// ============================================================

loadLoan();