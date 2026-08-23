const registerForm = document.getElementById('registerForm');
const formMessage = document.getElementById('formMessage');

registerForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    formMessage.textContent = '';
    formMessage.className = 'form-message';


    // Get values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const businessName =
        document.getElementById('businessName').value.trim();

    const registrationNumber =
        document.getElementById('registrationNumber').value.trim();

    const province =
        document.getElementById('province').value;

    const businessType =
        document.getElementById('businessType').value;

    const password =
        document.getElementById('password').value;

    const confirmPassword =
        document.getElementById('confirmPassword').value;

    const terms =
        document.getElementById('terms').checked;


    // =============================
    // VALIDATION
    // =============================

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !businessName ||
        !registrationNumber ||
        !province ||
        !businessType ||
        !password ||
        !confirmPassword
    ) {
        showMessage(
            'Please complete all required fields.',
            'error'
        );

        return;
    }


    if (password.length < 8) {

        showMessage(
            'Password must be at least 8 characters.',
            'error'
        );

        return;
    }


    if (!/\d/.test(password)) {

        showMessage(
            'Password must contain at least one number.',
            'error'
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            'Passwords do not match.',
            'error'
        );

        return;
    }


    if (!terms) {

        showMessage(
            'You must confirm that the information provided is accurate.',
            'error'
        );

        return;
    }


    // =============================
    // SEND DATA TO SERVER
    // =============================

    const userData = {
        firstName,
        lastName,
        email,
        phone,
        businessName,
        registrationNumber,
        province,
        businessType,
        password
    };


    try {

        const response = await fetch('/api/register', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(userData)

        });


        const result = await response.json();


        if (!response.ok) {

            showMessage(
                result.message || 'Registration failed.',
                'error'
            );

            return;
        }


        // Success
        showMessage(
            result.message,
            'success'
        );


        // Clear form
        registerForm.reset();


        // Redirect to login after a short delay
        setTimeout(() => {

            window.location.href = '/login';

        }, 2000);


    } catch (error) {

        console.error('Registration error:', error);

        showMessage(
            'Unable to connect to the server.',
            'error'
        );

    }

});


// =============================
// MESSAGE FUNCTION
// =============================

function showMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className =
        `form-message ${type}`;

}