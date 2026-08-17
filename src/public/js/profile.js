const logoutButton =
            document.getElementById("logoutButton");


        logoutButton.addEventListener(
            "click",
            function() {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmed) {

                    // For now this simply returns
                    // the user to the home/login page.

                    window.location.href =
                        "index.html";

                }

            }
        );
        