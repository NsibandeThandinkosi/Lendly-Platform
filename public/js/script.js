// Wait until the page has loaded
document.addEventListener("DOMContentLoaded", () => {

    // Animate feature cards when they enter the screen
    const featureCards = document.querySelectorAll(".feature-card");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    featureCards.forEach((card) => {
        observer.observe(card);
    });


    // Smooth navigation
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {

            const target = link.getAttribute("href");

            if (target && target.startsWith("#")) {
                const section = document.querySelector(target);

                if (section) {
                    event.preventDefault();

                    section.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        });
    });

});

// Loan calculator

const calculateBtn = document.getElementById("calculateBtn");

if (calculateBtn) {

    calculateBtn.addEventListener("click", () => {

        const loanAmount =
            parseFloat(document.getElementById("loanAmount").value) || 0;

        const interestRate =
            parseFloat(document.getElementById("interestRate").value) || 0;

        const interest =
            loanAmount * (interestRate / 100);

        const total =
            loanAmount + interest;


        document.getElementById("totalRepayment").textContent =
            `R${total.toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        document.getElementById("displayAmount").textContent =
            `R${loanAmount.toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        document.getElementById("displayInterest").textContent =
            `R${interest.toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

    });

}