/* ============================================================
   LENDLY - COLLECTIONS
============================================================ */


/*
    Hard-coded fulfilled loans for now.

    Later this array can be replaced with
    data retrieved from Supabase.
*/

const collectedLoans = [

    {
        id: 1,

        borrower: {
            name: "Sipho Dlamini",
            initials: "SD",
            phone: "082 555 1234"
        },

        totalPaid: 8500,

        fulfilledDate: "2026-08-15",

        originalLoan: 8000
    },


    {
        id: 2,

        borrower: {
            name: "Lerato Mokoena",
            initials: "LM",
            phone: "071 234 5678"
        },

        totalPaid: 12500,

        fulfilledDate: "2026-08-10",

        originalLoan: 12000
    },


    {
        id: 3,

        borrower: {
            name: "Thabo Nkosi",
            initials: "TN",
            phone: "079 876 5432"
        },

        totalPaid: 6500,

        fulfilledDate: "2026-07-28",

        originalLoan: 6000
    },


    {
        id: 4,

        borrower: {
            name: "Nomsa Zulu",
            initials: "NZ",
            phone: "083 456 7890"
        },

        totalPaid: 15000,

        fulfilledDate: "2026-07-18",

        originalLoan: 14000
    },


    {
        id: 5,

        borrower: {
            name: "Kagiso Molefe",
            initials: "KM",
            phone: "076 321 9876"
        },

        totalPaid: 9200,

        fulfilledDate: "2026-06-30",

        originalLoan: 9000
    }

];

const notificationButton =
    document.getElementById("notificationButton");

const profileButton =
    document.getElementById("profileButton");



/* ============================================================
   SORT COLLECTIONS
============================================================ */

/*
    Most recent fulfilled loan first.
*/

collectedLoans.sort(
    (a, b) =>
        new Date(b.fulfilledDate) -
        new Date(a.fulfilledDate)
);



/* ============================================================
   FORMAT CURRENCY
============================================================ */

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



/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(date) {

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
   DISPLAY COLLECTIONS
============================================================ */

function displayCollections() {

    const list =
        document.getElementById(
            "collectionsList"
        );


    /*
        Clear the current list.
    */

    list.innerHTML = "";



    /*
        If there are no collected loans,
        show an empty state.
    */

    if (collectedLoans.length === 0) {

        list.innerHTML = `

            <div class="collections-empty">

                <h3>
                    No collected loans
                </h3>

                <p>
                    Fulfilled loans will appear here.
                </p>

            </div>

        `;

        updateSummary();

        return;

    }



    /*
        Create each collection record.
    */

    collectedLoans.forEach(
        loan => {

            const item =
                document.createElement("div");


            item.className =
                "collection-item";


            item.innerHTML = `

                <!-- BORROWER -->

                <div class="collection-borrower">

                    <div class="collection-borrower-avatar">

                        ${loan.borrower.initials}

                    </div>


                    <div class="collection-borrower-info">

                        <strong>
                            ${loan.borrower.name}
                        </strong>

                        <span>
                            ${loan.borrower.phone}
                        </span>

                    </div>

                </div>



                <!-- TOTAL PAID -->

                <div class="collection-info">

                    <span class="collection-info-label">
                        Total paid
                    </span>

                    <strong class="collection-info-value">
                        ${formatCurrency(loan.totalPaid)}
                    </strong>

                </div>



                <!-- FULFILLED DATE -->

                <div class="collection-date">

                    <span>
                        Fulfilled
                    </span>

                    <strong>
                        ${formatDate(loan.fulfilledDate)}
                    </strong>

                </div>



                <!-- ACTIONS -->

                <div class="collection-actions">

                    <button
                        class="
                            collection-action-button
                            collection-view-button
                        "
                        onclick="viewCollection(${loan.id})"
                    >
                        View
                    </button>


                    <button
                        class="
                            collection-action-button
                            collection-delete-button
                        "
                        onclick="deleteCollection(${loan.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            list.appendChild(item);

        }
    );


    updateSummary();

}



/* ============================================================
   UPDATE SUMMARY
============================================================ */

function updateSummary() {

    const total =
        collectedLoans.reduce(
            (sum, loan) =>
                sum + loan.totalPaid,
            0
        );


    document.getElementById(
        "totalCollected"
    ).textContent =
        formatCurrency(total);


    document.getElementById(
        "totalLoans"
    ).textContent =
        collectedLoans.length;

}



/* ============================================================
   VIEW COLLECTION
============================================================ */

function viewCollection(id) {

    /*
        For now we send the ID to the
        loan details page.

        Later the loan details page can
        retrieve the matching record from
        Supabase.
    */

    window.location.href =
    `collection-details.html?id=${id}`;

}


/* ============================================================
   DELETE COLLECTION
============================================================ */

function deleteCollection(id) {

    const loan =
        collectedLoans.find(
            loan => loan.id === id
        );


    if (!loan) {
        return;
    }


    const confirmed =
        confirm(
            `Delete the collection record for ${loan.borrower.name}?`
        );


    if (!confirmed) {
        return;
    }


    /*
        Remove the record from the
        hard-coded array.
    */

    const index =
        collectedLoans.findIndex(
            loan => loan.id === id
        );


    if (index !== -1) {

        collectedLoans.splice(
            index,
            1
        );

    }


    /*
        Re-render the page.
    */

    displayCollections();

};

/* ============================================================
   INITIALIZE
============================================================ */

displayCollections();


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
