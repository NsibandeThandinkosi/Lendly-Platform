// ============================================================
// LENDLY - LOAN DETAILS
// ============================================================


// ============================================================
// GET LOANS
// ============================================================

let loans =
    JSON.parse(
        localStorage.getItem("lendlyLoans")
    ) || [];


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
// FIND LOAN
// ============================================================

const loan =
    loans.find(
        item =>
            item.id === loanId
    );


const loanDetails =
    document.getElementById(
        "loanDetails"
    );


// ============================================================
// IF LOAN DOES NOT EXIST
// ============================================================

if (!loan) {

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
                This loan may have been removed
                or collected.
            </p>

            <br>

            <a href="loans.html">
                Back to Loans
            </a>

        </div>

    `;

} else {

    renderLoanDetails();

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
            loan.nextDueDate +
            "T00:00:00"
        );


    return dueDate < today;

}


// ============================================================
// RENDER DETAILS
// ============================================================

function renderLoanDetails() {

    const overdue =
        isOverdue();


    loanDetails.innerHTML = `

        <!-- HEADER -->

        <div class="loan-details-header">

            <div class="loan-details-borrower">

                <div class="loan-details-avatar">

                    ${getInitials(
                        loan.borrower
                    )}

                </div>


                <div>

                    <h2>
                        ${loan.borrower}
                    </h2>

                    <p>
                        Loan ${loan.id}
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
                    overdue
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
                                loan.amount
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Remaining Balance
                        </span>

                        <strong>
                            ${formatMoney(
                                loan.remaining
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Monthly Payment
                        </span>

                        <strong>
                            ${formatMoney(
                                loan.monthlyPayment
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Interest Rate
                        </span>

                        <strong>
                            ${loan.interestRate}%
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Loan Term
                        </span>

                        <strong>
                            ${loan.term} months
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Loan Purpose
                        </span>

                        <strong>
                            ${loan.purpose}
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
                                loan.startDate
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Next Due Date
                        </span>

                        <strong>
                            ${formatDate(
                                loan.nextDueDate
                            )}
                        </strong>

                    </div>


                    <div class="loan-detail-field">

                        <span>
                            Borrower Phone
                        </span>

                        <strong>
                            ${loan.phone}
                        </strong>

                    </div>

                </div>

            </div>



            <!-- EDIT FORM -->

            <div
                class="
                    loan-edit-form
                    ${shouldEdit ? "visible" : ""}
                "
                id="loanEditForm"
            >

                <h3>
                    Edit Loan
                </h3>


                <div class="loan-edit-grid">


                    <div class="loan-edit-field">

                        <label>
                            Borrower Name
                        </label>

                        <input
                            type="text"
                            id="editBorrower"
                            value="${loan.borrower}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Phone
                        </label>

                        <input
                            type="text"
                            id="editPhone"
                            value="${loan.phone}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Loan Amount
                        </label>

                        <input
                            type="number"
                            id="editAmount"
                            value="${loan.amount}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Remaining Balance
                        </label>

                        <input
                            type="number"
                            id="editRemaining"
                            value="${loan.remaining}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Monthly Payment
                        </label>

                        <input
                            type="number"
                            id="editMonthlyPayment"
                            value="${loan.monthlyPayment}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Next Due Date
                        </label>

                        <input
                            type="date"
                            id="editNextDueDate"
                            value="${loan.nextDueDate}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Interest Rate
                        </label>

                        <input
                            type="number"
                            id="editInterestRate"
                            value="${loan.interestRate}"
                        >

                    </div>


                    <div class="loan-edit-field">

                        <label>
                            Purpose
                        </label>

                        <input
                            type="text"
                            id="editPurpose"
                            value="${loan.purpose}"
                        >

                    </div>

                </div>


                <button
                    class="save-loan-button"
                    id="saveLoanButton"
                >
                    Save Changes
                </button>

            </div>


        </div>



        <!-- ACTIONS -->

        <div class="loan-details-actions">


            <button
                class="loan-details-action"
                id="editLoanButton"
            >
                Edit Loan
            </button>


            <button
                class="
                    loan-details-action
                    payment
                "
                id="paymentButton"
            >
                Monthly Payment
            </button>


            <button
                class="
                    loan-details-action
                    clear
                "
                id="clearLoanButton"
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

    const editButton =
        document.getElementById(
            "editLoanButton"
        );


    const paymentButton =
        document.getElementById(
            "paymentButton"
        );


    const clearButton =
        document.getElementById(
            "clearLoanButton"
        );


    const saveButton =
        document.getElementById(
            "saveLoanButton"
        );


    // -----------------------------------------
    // EDIT
    // -----------------------------------------

    editButton.addEventListener(
        "click",
        function() {

            const form =
                document.getElementById(
                    "loanEditForm"
                );


            form.classList.toggle(
                "visible"
            );

        }
    );


    // -----------------------------------------
    // MONTHLY PAYMENT
    // -----------------------------------------

    paymentButton.addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    `Record the monthly payment of ${formatMoney(
                        loan.monthlyPayment
                    )}?`
                );


            if (!confirmed) {
                return;
            }


            loan.remaining =
                Math.max(
                    0,
                    loan.remaining -
                    loan.monthlyPayment
                );


            movePaymentToNextMonth();


            saveLoans();


            renderLoanDetails();

        }
    );


    // -----------------------------------------
    // CLEAR LOAN
    // -----------------------------------------

    clearButton.addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    "Mark this loan as fully paid and collected?"
                );


            if (!confirmed) {
                return;
            }


            loan.status =
                "collected";


            loan.remaining =
                0;


            loan.clearedDate =
                new Date()
                    .toISOString()
                    .split("T")[0];


            saveLoans();


            window.location.href =
                "loans.html";

        }
    );


    // -----------------------------------------
    // SAVE CHANGES
    // -----------------------------------------

    saveButton.addEventListener(
        "click",
        function() {

            loan.borrower =
                document.getElementById(
                    "editBorrower"
                ).value;


            loan.phone =
                document.getElementById(
                    "editPhone"
                ).value;


            loan.amount =
                Number(
                    document.getElementById(
                        "editAmount"
                    ).value
                );


            loan.remaining =
                Number(
                    document.getElementById(
                        "editRemaining"
                    ).value
                );


            loan.monthlyPayment =
                Number(
                    document.getElementById(
                        "editMonthlyPayment"
                    ).value
                );


            loan.nextDueDate =
                document.getElementById(
                    "editNextDueDate"
                ).value;


            loan.interestRate =
                Number(
                    document.getElementById(
                        "editInterestRate"
                    ).value
                );


            loan.purpose =
                document.getElementById(
                    "editPurpose"
                ).value;


            saveLoans();


            alert(
                "Loan details updated successfully."
            );


            renderLoanDetails();

        }
    );

}


// ============================================================
// MOVE PAYMENT TO NEXT MONTH
// ============================================================

function movePaymentToNextMonth() {

    const currentDate =
        new Date(
            loan.nextDueDate +
            "T00:00:00"
        );


    const originalDay =
        currentDate.getDate();


    currentDate.setMonth(
        currentDate.getMonth() + 1
    );


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
// SAVE
// ============================================================

function saveLoans() {

    localStorage.setItem(
        "lendlyLoans",
        JSON.stringify(loans)
    );

}