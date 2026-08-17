// ============================================================
// NOTIFICATION ELEMENTS
// ============================================================

const notificationList =
    document.getElementById("notificationList");

const notificationCount =
    document.getElementById("notificationCount");

const emptyNotifications =
    document.getElementById("emptyNotifications");


// ============================================================
// UPDATE NOTIFICATION COUNT
// ============================================================

function updateNotificationCount() {

    const notifications =
        document.querySelectorAll(
            ".notification-item"
        );


    const count =
        notifications.length;


    if (count === 1) {

        notificationCount.textContent =
            "1 notification";

    } else {

        notificationCount.textContent =
            `${count} notifications`;

    }


    // Show empty state when there
    // are no notifications left.

    if (count === 0) {

        notificationList.style.display =
            "none";

        emptyNotifications.style.display =
            "block";

    }

}


// ============================================================
// DELETE NOTIFICATION
// ============================================================

const deleteButtons =
    document.querySelectorAll(
        ".delete-notification"
    );


deleteButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const notification =
                    button.closest(
                        ".notification-item"
                    );


                if (!notification) {
                    return;
                }


                notification.remove();


                updateNotificationCount();

            }
        );

    }
);


// ============================================================
// INITIAL COUNT
// ============================================================

updateNotificationCount();