// ============================================================
// AUTHENTICATION
// ============================================================

// ============================================================
// STORAGE KEYS
// ============================================================

const SESSION_KEY = 'lendlySession';
const USER_KEY = 'lendlyUser';

// ============================================================
// GET STORED SESSION
// ============================================================

export function getStoredSession() {

    const storedSession =
        localStorage.getItem(SESSION_KEY);

    if (!storedSession) {
        return null;
    }

    try {

        return JSON.parse(storedSession);

    }
    catch (error) {

        console.error(
            'Unable to read stored session:',
            error
        );

        localStorage.removeItem(SESSION_KEY);

        return null;

    }

}

// ============================================================
// SAVE SESSION
// ============================================================

export function saveSession(session) {

    if (!session) {
        return;
    }

    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

    if (session.user) {

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(session.user)
        );

    }

}

// ============================================================
// CLEAR SESSION
// ============================================================

export function clearSession() {


    localStorage.removeItem(
        SESSION_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );


}

// ============================================================
// REFRESH SESSION
// ============================================================

export async function refreshSession() {

    const session =
        getStoredSession();


    if (!session?.refresh_token) {

        clearSession();

        return null;

    }


    try {

        const response =
            await fetch(
                '/api/auth/refresh',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        refresh_token:
                            session.refresh_token
                    })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success ||
            !result.session
        ) {

            clearSession();

            return null;

        }


        saveSession(
            result.session
        );


        return result.session;

    }
    catch (error) {

        console.error(
            'Session refresh error:',
            error
        );

        return null;

    }


}

// ============================================================
// GET VALID SESSION
// ============================================================

export async function getSession() {

let session =
    getStoredSession();


if (!session) {

    return null;

}


// --------------------------------------------------------
// Check whether the access token has expired
// --------------------------------------------------------

if (session.expires_at) {

        const currentTime =
            Math.floor(
                Date.now() / 1000
            );


        // Refresh if expired
        // or if it expires within 60 seconds

        if (
            session.expires_at <=
            currentTime + 60
        ) {

            session =
                await refreshSession();


            if (!session) {

                return null;

            }

        }

    }


    return session;

}

// ============================================================
// GET ACCESS TOKEN
// ============================================================

export async function getAccessToken() {

    const session =
        await getSession();


    if (!session) {

        return null;

    }


    return session.access_token || null;


}

// ============================================================
// GET CURRENT USER
// ============================================================

export async function getCurrentUser() {

    const session =
        await getSession();


    if (!session) {

        return null;

    }


    return session.user || null;

}

// ============================================================
// AUTHENTICATED FETCH
// ============================================================

export async function authenticatedFetch(
url,
options = {}
) {

const accessToken =
    await getAccessToken();


if (!accessToken) {

    clearSession();

    window.location.href =
        '/login';

    return null;

}


const headers = {

    ...(options.headers || {}),

    'Authorization':
        `Bearer ${accessToken}`

};


const response =
    await fetch(
        url,
        {
            ...options,
            headers
        }
    );


// --------------------------------------------------------
// Access token rejected
// --------------------------------------------------------

if (response.status === 401) {

    // Try refreshing the session

    const newSession =
        await refreshSession();


    if (!newSession) {

        clearSession();

        window.location.href =
            '/login';

        return null;

    }


    // Retry request with new token

    const retryHeaders = {

        ...(options.headers || {}),

        'Authorization':
            `Bearer ${newSession.access_token}`

    };


    return fetch(
        url,
        {
            ...options,
            headers: retryHeaders
        }
    );

}


return response;


}

// ============================================================
// SIGN OUT
// ============================================================

export function signOut() {

clearSession();

window.location.href =
    '/login';

}
