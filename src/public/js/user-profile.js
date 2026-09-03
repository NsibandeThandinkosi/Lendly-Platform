import {
getSession,
getAccessToken,
signOut
} from './auth.js';

// ============================================================
// USER PROFILE
// ============================================================

document.addEventListener(
'DOMContentLoaded',
() => {

    loadUserProfile();

}

);

// ============================================================
// LOAD USER PROFILE
// ============================================================

async function loadUserProfile() {

try {

    // ====================================================
    // GET VALID SESSION
    // ====================================================

    const session =
        await getSession();


    if (!session) {

        window.location.href =
            '/login';

        return;

    }


    // ====================================================
    // GET ACCESS TOKEN
    // ====================================================

    const accessToken =
        await getAccessToken();


    if (!accessToken) {

        signOut();

        return;

    }


    // ====================================================
    // GET PROFILE
    // ====================================================

    const response =
        await fetch(
            '/api/profile',
            {
                method: 'GET',

                headers: {

                    'Authorization':
                        `Bearer ${accessToken}`

                }

            }
        );


    const data =
        await response.json();


    // ====================================================
    // INVALID SESSION
    // ====================================================

    if (response.status === 401) {

        signOut();

        return;

    }


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            'Unable to load profile.'
        );

    }


    // ====================================================
    // PROFILE
    // ====================================================

    const profile =
        data.profile;


    // ====================================================
    // ELEMENTS
    // ====================================================

    const userAvatar =
        document.getElementById(
            'userAvatar'
        );


    const userName =
        document.getElementById(
            'userName'
        );


    const profileButton =
        document.getElementById(
            'profileButton'
        );


    // ====================================================
    // NAME
    // ====================================================

    const firstName =
        profile?.first_name || '';


    const lastName =
        profile?.last_name || '';


    const fullName =
        `${firstName} ${lastName}`
            .trim();


    // ====================================================
    // INITIALS
    // ====================================================

    let initials = '--';


    if (
        firstName &&
        lastName
    ) {

        initials =
            (
                firstName[0] +
                lastName[0]
            ).toUpperCase();

    }
    else if (firstName) {

        initials =
            firstName
                .substring(0, 2)
                .toUpperCase();

    }
    else if (data.user?.email) {

        initials =
            data.user.email
                .substring(0, 2)
                .toUpperCase();

    }


    // ====================================================
    // DISPLAY
    // ====================================================

    if (userAvatar) {

        userAvatar.textContent =
            initials;

    }


    if (userName) {

        userName.textContent =
            fullName ||
            data.user?.email ||
            'User';

    }


    // ====================================================
    // PROFILE BUTTON
    // ====================================================

    if (profileButton) {

        profileButton.addEventListener(
            'click',
            () => {

                window.location.href =
                    '/profile';

            }
        );

    }

}
catch (error) {

    console.error(
        'User profile error:',
        error
    );

}

}
