// ============================================================
// PROFILE PAGE
// ============================================================

document.addEventListener('DOMContentLoaded', async function () {

    await loadProfile();

    setupLogout();

});


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile() {

    try {

        // ==========================================
        // GET STORED SESSION
        // ==========================================

        const sessionData =
            localStorage.getItem('lendlySession');


        if (!sessionData) {

            window.location.href = '/login';

            return;

        }


        const session =
            JSON.parse(sessionData);


        // ==========================================
        // GET ACCESS TOKEN
        // ==========================================

        const accessToken =
            session.access_token;


        if (!accessToken) {

            console.error(
                'No access token found in stored session.'
            );

            localStorage.removeItem('lendlySession');
            localStorage.removeItem('lendlyUser');

            window.location.href = '/login';

            return;

        }


        // ==========================================
        // GET PROFILE FROM SERVER
        // ==========================================

        const response =
            await fetch('/api/profile', {

                method: 'GET',

                headers: {

                    'Authorization':
                        `Bearer ${accessToken}`

                }

            });


        const result =
            await response.json();


        // ==========================================
        // HANDLE AUTHENTICATION ERROR
        // ==========================================

        if (response.status === 401) {

            console.error(
                'Profile authentication failed:',
                result.message
            );

            localStorage.removeItem('lendlySession');
            localStorage.removeItem('lendlyUser');

            window.location.href = '/login';

            return;

        }


        if (!response.ok) {

            console.error(
                'Profile error:',
                result.message
            );

            return;

        }


        // ==========================================
        // PROFILE DATA
        // ==========================================

        const profile =
            result.profile;

        const authUser =
            result.user;


        const firstName =
            profile?.first_name || '';


        const lastName =
            profile?.last_name || '';


        const fullName =
            `${firstName} ${lastName}`.trim()
            || authUser?.email
            || 'Account';


        // ==========================================
        // INITIALS
        // ==========================================

        const initials =
            getInitials(
                firstName,
                lastName,
                authUser?.email
            );


        // ==========================================
        // UPDATE PROFILE PAGE
        // ==========================================

        const largeAvatar =
            document.querySelector('.large-user-avatar');

        const profileName =
            document.querySelector('.profile-header h2');

        const emailField =
            document.getElementById('profileEmail');

        const phoneField =
            document.getElementById('profilePhone');

        const fullNameField =
            document.getElementById('profileFullName');


        if (largeAvatar) {

            largeAvatar.textContent =
                initials;

        }


        if (profileName) {

            profileName.textContent =
                fullName;

        }


        if (fullNameField) {

            fullNameField.textContent =
                fullName;

        }


        if (emailField) {

            emailField.textContent =
                authUser?.email || '';

        }


        if (phoneField) {

            phoneField.textContent =
                profile?.phone || '';

        }

    }
    catch (error) {

        console.error(
            'Load profile error:',
            error
        );

    }

}


// ============================================================
// GET INITIALS
// ============================================================

function getInitials(
    firstName,
    lastName,
    email
) {

    if (
        firstName &&
        lastName
    ) {

        return (
            firstName[0] +
            lastName[0]
        ).toUpperCase();

    }


    if (firstName) {

        return firstName
            .substring(0, 2)
            .toUpperCase();

    }


    if (email) {

        return email
            .substring(0, 2)
            .toUpperCase();

    }


    return '--';

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById('logoutButton');


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        'click',
        function () {

            const confirmed =
                confirm(
                    'Are you sure you want to logout?'
                );


            if (!confirmed) {

                return;

            }


            localStorage.removeItem(
                'lendlySession'
            );

            localStorage.removeItem(
                'lendlyUser'
            );


            window.location.href =
                '/login';

        }
    );

}