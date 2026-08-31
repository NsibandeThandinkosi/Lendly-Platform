/* ============================================================
   LENDLY - COLLECTIONS
============================================================ */


// ============================================================
// STATE
// ============================================================

let collectedLoans = [];


// ============================================================
// ELEMENTS
// ============================================================

const collectionsList =
    document.getElementById("collectionsList");

const totalCollected =
    document.getElementById("totalCollected");

const totalLoans =
    document.getElementById("totalLoans");

const notificationButton =
    document.getElementById("notificationButton");

const profileButton =
    document.getElementById("profileButton");


// ============================================================
// AUTHENTICATION
// ============================================================

function getAccessToken() {

    const storedSession =
        localStorage.getItem("lendlySession");


    if (!storedSession) {

        return null;

    }


    try {

        const session =
            JSON.parse(storedSession);


        return (
            session.access_token ||
            null
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
// LOAD COLLECTIONS FROM SERVER
// ============================================================

async function loadCollections() {

    const accessToken =
        getAccessToken();


    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================

    if (!accessToken) {

        window.location.href =
            "/login";

        return;

    }


    try {

        const response =
            await fetch(
                "/api/collections",
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


        // ==========================================
        // HANDLE SERVER ERRORS
        // ==========================================

        if (!response.ok) {

            console.error(
                "Load collections error:",
                result
            );


            // --------------------------------------
            // SESSION EXPIRED / INVALID
            // --------------------------------------

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


            collectionsList.innerHTML = `

                <div class="collections-empty">

                    <h3>
                        Unable to load collections
                    </h3>

                    <p>
                        ${
                            result.message ||
                            "Unable to load collections."
                        }
                    </p>

                </div>

            `;

            return;

        }


        // ==========================================
        // STORE SERVER DATA
        // ==========================================

        collectedLoans =
            result.collections || [];


        // ==========================================
        // SORT COLLECTIONS
        //
        // Most recently settled first
        // ==========================================

        collectedLoans.sort(
            function(a, b) {

                return (
                    new Date(
                        b.fulfilledDate
                    ) -
                    new Date(
                        a.fulfilledDate
                    )
                );

            }
        );


        // ==========================================
        // DISPLAY
        // ==========================================

        displayCollections();

    }
    catch (error) {

        console.error(
            "Load collections request failed:",
            error
        );


        collectionsList.innerHTML = `

            <div class="collections-empty">

                <h3>
                    Unable to connect to the server
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

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

        return "-";

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
// GET BORROWER INITIALS
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
// DISPLAY COLLECTIONS
// ============================================================

function displayCollections() {

    collectionsList.innerHTML = "";


    // ==========================================
    // EMPTY STATE
    // ==========================================

    if (
        collectedLoans.length === 0
    ) {

        collectionsList.innerHTML = `

            <div class="collections-empty">

                <h3>
                    No collected loans
                </h3>

                <p>
                    Settled loans will appear here.
                </p>

            </div>

        `;


        updateSummary();

        return;

    }


    // ==========================================
    // DISPLAY EACH COLLECTION
    // ==========================================

    collectedLoans.forEach(
        function(loan) {

            const item =
                document.createElement("div");


            item.className =
                "collection-item";


            item.innerHTML = `

                <!-- BORROWER -->

                <div class="collection-borrower">

                    <div class="collection-borrower-avatar">

                        ${getInitials(
                            loan.borrower.name
                        )}

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
                        ${formatCurrency(
                            loan.totalPaid
                        )}
                    </strong>

                </div>



                <!-- FULFILLED DATE -->

                <div class="collection-date">

                    <span>
                        Fulfilled
                    </span>

                    <strong>
                        ${formatDate(
                            loan.fulfilledDate
                        )}
                    </strong>

                </div>



                <!-- ACTIONS -->

                <div class="collection-actions">

                    <button
                        class="
                            collection-action-button
                            collection-view-button
                        "
                        data-action="view"
                        data-id="${loan.id}"
                    >
                        View
                    </button>


                    <button
                        class="
                            collection-action-button
                            collection-delete-button
                        "
                        data-action="delete"
                        data-id="${loan.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            collectionsList.appendChild(
                item
            );

        }
    );


    updateSummary();

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateSummary() {

    const total =
        collectedLoans.reduce(
            function(sum, loan) {

                return (
                    sum +
                    Number(
                        loan.totalPaid || 0
                    )
                );

            },
            0
        );


    totalCollected.textContent =
        formatCurrency(total);


    totalLoans.textContent =
        collectedLoans.length;

}


// ============================================================
// COLLECTION BUTTON HANDLER
// ============================================================

collectionsList.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".collection-action-button"
            );


        if (!button) {

            return;

        }


        const collectionId =
            button.dataset.id;


        const action =
            button.dataset.action;


        // ==========================================
        // VIEW
        // ==========================================

        if (
            action === "view"
        ) {

            window.location.href =
                `/collections/details?id=${collectionId}`;

            return;

        }


        // ==========================================
        // DELETE
        // ==========================================

        if (
            action === "delete"
        ) {

            await deleteCollection(
                collectionId
            );

        }

    }
);


// ============================================================
// DELETE COLLECTION
// ============================================================

async function deleteCollection(id) {

    const accessToken =
        getAccessToken();


    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================

    if (!accessToken) {

        window.location.href =
            "/login";

        return;

    }


    // ==========================================
    // FIND COLLECTION
    // ==========================================

    const loan =
        collectedLoans.find(
            function(collection) {

                return (
                    collection.id === id
                );

            }
        );


    if (!loan) {

        return;

    }


    // ==========================================
    // CONFIRM DELETE
    // ==========================================

    const confirmed =
        confirm(
            `Delete the collection record for ${loan.borrower.name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/collections/${id}`,
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


        // ==========================================
        // HANDLE SERVER ERROR
        // ==========================================

        if (!response.ok) {

            console.error(
                "Delete collection error:",
                result
            );


            // --------------------------------------
            // SESSION EXPIRED / INVALID
            // --------------------------------------

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
                "Unable to delete collection."
            );

            return;

        }


        // ==========================================
        // REMOVE FROM LOCAL STATE
        // ==========================================

        collectedLoans =
            collectedLoans.filter(
                function(collection) {

                    return (
                        collection.id !== id
                    );

                }
            );


        // ==========================================
        // UPDATE DISPLAY
        // ==========================================

        displayCollections();

    }
    catch (error) {

        console.error(
            "Delete collection request failed:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}


// ============================================================
// NOTIFICATIONS
// ============================================================

notificationButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "notifications.html";

    }
);


// ============================================================
// USER PROFILE
// ============================================================

profileButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "profile.html";

    }
);


// ============================================================
// INITIAL LOAD
// ============================================================

loadCollections();

