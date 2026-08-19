/* ============================================================
   LENDLY - CREATE BORROWER
============================================================ */


/* ============================================================
   ELEMENTS
============================================================ */

const firstNameInput =
    document.getElementById(
        "firstName"
    );


const lastNameInput =
    document.getElementById(
        "lastName"
    );


const phoneInput =
    document.getElementById(
        "phone"
    );


const createBorrowerBtn =
    document.getElementById(
        "createBorrowerBtn"
    );


const createLoanBtn =
    document.getElementById(
        "createLoanBtn"
    );


const borrowerNote =
    document.getElementById(
        "borrowerNote"
    );


/* ============================================================
   TEMPORARY BORROWER STORAGE
============================================================ */

/*
    For now we simulate the borrower database
    using localStorage.

    Later this can be replaced with a Supabase
    INSERT operation.
*/

let createdBorrower = null;


/* ============================================================
   CREATE BORROWER
============================================================ */

createBorrowerBtn.addEventListener(
    "click",
    () => {

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
           CREATE BORROWER
        ==================================================== */

        createdBorrower = {

            id: Date.now(),

            firstName: firstName,

            lastName: lastName,

            phone: phone,

            loans: []

        };


        /*
            Save the borrower temporarily.

            Later this will be replaced with
            Supabase.
        */

        localStorage.setItem(
            "newBorrower",
            JSON.stringify(
                createdBorrower
            )
        );


        /* ====================================================
           ENABLE CREATE LOAN
        ==================================================== */

        createLoanBtn.disabled =
            false;


        borrowerNote.textContent =
            `${firstName} ${lastName} has been created. You can now create a loan for this borrower.`;


        createBorrowerBtn.textContent =
            "Borrower Created";


        createBorrowerBtn.disabled =
            true;

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


        window.location.href =
            `create-loan.html?borrowerId=${createdBorrower.id}`;

    }
);