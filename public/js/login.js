const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    clearLoginErrors();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    let valid = true;


    // Email validation

    if (email === "") {

        showLoginError(
            "loginEmail",
            "Email address is required."
        );

        valid = false;

    } else if (!isValidEmail(email)) {

        showLoginError(
            "loginEmail",
            "Please enter a valid email address."
        );

        valid = false;
    }


    // Password validation

    if (password === "") {

        showLoginError(
            "loginPassword",
            "Password is required."
        );

        valid = false;

    } else if (password.length < 8) {

        showLoginError(
            "loginPassword",
            "Password must be at least 8 characters."
        );

        valid = false;
    }


    if (valid) {

        const message =
            document.getElementById("loginMessage");

        message.textContent =
            "Validation successful. Authentication will be connected next.";

        message.className =
            "form-message success";

    }

});


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function showLoginError(inputId, message) {

    const input =
        document.getElementById(inputId);

    const inputGroup =
        input.closest(".input-group");

    inputGroup.classList.add("error");

    inputGroup.querySelector(".error-message").textContent =
        message;

}


function clearLoginErrors() {

    document
        .querySelectorAll(".input-group")
        .forEach((group) => {

            group.classList.remove("error");

            const error =
                group.querySelector(".error-message");

            if (error) {
                error.textContent = "";
            }

        });

    const message =
        document.getElementById("loginMessage");

    message.textContent = "";
    message.className = "form-message";

}