/* ============================================================
   LENDLY - CREATE BORROWER
============================================================ */


/* ============================================================
   ELEMENTS
============================================================ */

const firstNameInput =
    document.getElementById("firstName");

const lastNameInput =
    document.getElementById("lastName");

const phoneInput =
    document.getElementById("phone");

const createBorrowerBtn =
    document.getElementById("createBorrowerBtn");

const createLoanBtn =
    document.getElementById("createLoanBtn");

const borrowerNote =
    document.getElementById("borrowerNote");


/* ============================================================
   CREATED BORROWER
============================================================ */

let createdBorrower = null;


/* ============================================================
   GET LOGIN INFORMATION
============================================================ */

const storedUser =
    JSON.parse(
        localStorage.getItem("lendlyUser")
    );

const storedSession =
    JSON.parse(
        localStorage.getItem("lendlySession")
    );


/* ============================================================
   CHECK AUTHENTICATION
============================================================ */

if (
    !storedUser ||
    !storedUser.id ||
    !storedSession ||
    !storedSession.access_token
) {

    alert(
        "Your session could not be found. Please log in again."
    );

    window.location.href = "/login";

}


/* ============================================================
   CREATE BORROWER
============================================================ */

createBorrowerBtn.addEventListener(
    "click",
    async () => {

        const firstName =
            firstNameInput.value.trim();

        const lastName =
            lastNameInput.value.trim();

        const phone =
            phoneInput.value.trim();


        /* ====================================================
           VALIDATION
        ==================================================== */

        if (!firstName) {

            alert(
                "Please enter the borrower's first name."
            );

            firstNameInput.focus();

            return;
        }


        if (!lastName) {

            alert(
                "Please enter the borrower's last name."
            );

            lastNameInput.focus();

            return;
        }


        if (!phone) {

            alert(
                "Please enter the borrower's phone number."
            );

            phoneInput.focus();

            return;
        }


        /* ====================================================
           DISABLE BUTTON
        ==================================================== */

        createBorrowerBtn.disabled = true;

        createBorrowerBtn.textContent =
            "Creating Borrower...";


        try {

            /* =================================================
               SEND REQUEST TO SERVER
            ================================================= */

            const response =
                await fetch(
                    "/api/borrowers",
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            /*
                                Send the Supabase access token.

                                Express will use this token when
                                communicating with Supabase.

                                This allows RLS to evaluate:

                                auth.uid()
                            */

                            "Authorization":
                                `Bearer ${storedSession.access_token}`

                        },

                        body: JSON.stringify({

                            /*
                                We still send lenderId for now.

                                The server will verify that it
                                matches the authenticated user.
                            */

                            lenderId:
                                storedUser.id,

                            firstName:
                                firstName,

                            lastName:
                                lastName,

                            phone:
                                phone

                        })
                    }
                );


            /* =================================================
               READ SERVER RESPONSE
            ================================================= */

            const result =
                await response.json();


            /* =================================================
               HANDLE ERROR
            ================================================= */

            if (!response.ok) {

                console.error(
                    "Create borrower error:",
                    result
                );

                alert(
                    result.message ||
                    "Unable to create borrower."
                );

                createBorrowerBtn.disabled =
                    false;

                createBorrowerBtn.textContent =
                    "Create Borrower";

                return;
            }


            /* =================================================
               BORROWER CREATED
            ================================================= */

            createdBorrower =
                result.borrower;


            console.log(
                "Borrower created:",
                createdBorrower
            );


            /* =================================================
               ENABLE CREATE LOAN
            ================================================= */

            createLoanBtn.disabled =
                false;


            borrowerNote.textContent =
                `${createdBorrower.first_name} ${createdBorrower.last_name} has been created. You can now create a loan for this borrower.`;


            createBorrowerBtn.textContent =
                "Borrower Created";

            createBorrowerBtn.disabled =
                true;


        } catch (error) {

            console.error(
                "Create borrower request failed:",
                error
            );

            alert(
                "Unable to connect to the server."
            );

            createBorrowerBtn.disabled =
                false;

            createBorrowerBtn.textContent =
                "Create Borrower";

        }

    }
);


/* ============================================================
   CREATE LOAN
============================================================ */

createLoanBtn.addEventListener(
    "click",
    () => {

        if (
            createLoanBtn.disabled ||
            !createdBorrower
        ) {

            return;
        }


        /*
            Supabase generated the real borrower UUID.
        */

        window.location.href =
            `/loans/create?borrowerId=${createdBorrower.id}`;

    }
);