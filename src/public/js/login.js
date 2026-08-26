const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');


loginForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    loginMessage.textContent = '';
    loginMessage.className = 'form-message';


    const email =
        document.getElementById('loginEmail').value.trim();

    const password =
        document.getElementById('loginPassword').value;


    // =============================
    // VALIDATION
    // =============================

    if (!email || !password) {

        showLoginMessage(
            'Please enter your email and password.',
            'error'
        );

        return;
    }


    try {

        const response = await fetch('/api/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email,
                password
            })

        });


        const result = await response.json();


        if (!response.ok) {

            showLoginMessage(
                result.message || 'Login failed.',
                'error'
            );

            return;
        }


        // Store session temporarily
        localStorage.setItem(
            'lendlySession',
            JSON.stringify(result.session)
        );


        // Store user information
        localStorage.setItem(
            'lendlyUser',
            JSON.stringify(result.user)
        );

        showLoginMessage(
            'Login successful. Redirecting...',
            'success'
        );


        setTimeout(() => {

            window.location.href = '/dashboard';

        }, 1000);


    } catch (error) {

        console.error('Login error:', error);

        showLoginMessage(
            'Unable to connect to the server.',
            'error'
        );

    }

});


function showLoginMessage(message, type) {

    loginMessage.textContent = message;

    loginMessage.className =
        `form-message ${type}`;

}