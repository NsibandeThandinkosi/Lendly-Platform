# Lendly-Platform
A platform for registered micro lenders to store their user's loan information. It helps registered micro lenders keep basic records of who owes them, how much did they borrow and calculate the total to be paid, given the agreed upon legal interest rate.

Before you write any code, PLEASE make sure you do pull request
git pull

If you have already written some code before doing pull request, PLEASE run this command to pull the code without losing the code you wrote
git pull --no-rebase

How to correctly push to a new branch
(check if you are in the new branch you created by running this command): git branch
git add .
git commit -m "Your commit message"
git checkout -b {name of your new branch}
git push origin {name of your new branch}

HOW TO RUN THE PROJECT LOCALLY
Run the following commands to install the necessary dependancies and to run the project
npm install
npm install express
npm install express-session
npm install @supabase/supabase-js
npm install jsonwebtoken
npm install axios
npm start or node src/server.js
