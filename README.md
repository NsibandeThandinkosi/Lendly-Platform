# Lendly-Platform
A platform for registered micro lenders to store their user's loan information. It helps registered micro lenders keep basic records of who owes them, how much did they borrow and calculate the total to be paid, given the agreed upon legal interest rate.

# Before you write any code, PLEASE make sure you do pull request
git pull

# If you have already written some code before doing pull request, PLEASE run this command to pull the code without losing the code you wrote
git pull --no-rebase

# How to correctly push to a new branch
(check if you are in the new branch you created by running this command): git branch
git add .

git commit -m "Your commit message"

git checkout -b {name of your new branch}

git push origin {name of your new branch}

# HOW TO RUN THE PROJECT LOCALLY
# Run the following commands to install the necessary dependancies and to run the project
npm install

npm install express

npm install express-session

npm install @supabase/supabase-js

npm install jsonwebtoken

npm install axios

npm start or node src/server.js



# Lendly Business Rules For Compliance

## SA rules for loans
There are short-term (Short-term Credit Transaction) and long-term loans (Unsecured Credit Transaction). These 2 have different laws regarding maximum interest rates and extra fees throughout the repayment period. Lendly will focus on short term loans.
Short term loans are loans that take 0-6 months to repay, anything more that is classified as an unsecured Credit Transaction. The maximum amount for this loan is R8000.00.

### Compulsory VAT Threshold:
You are only legally required to register for VAT with SARS if your taxable fee revenue exceeds R2.3 million in a 12-month period. So, I think we should not count VAT on the application for now.

### Three important fees and their rules:
### Interest Rates 
	First loan of the calendar year to a borrower: Maximum 5% per month.
	Subsequent loans in the same calendar year to that borrower: Maximum 3% per month.
  
### Initiation Fee (Charged once per loan agreement)
	R165 plus 10% of the loan amount above R1,000 (plus 15% VAT).
	Cap: Cannot exceed R1,050 + VAT.
#### Example:
#### Here is a step-by-step breakdown of how that calculation works for an R8,000 loan.

### Step 1: Find the amount above R1,000
The rule says you take 10% of the loan amount above R1,000. First, subtract R1,000 from the total loan amount:
"R8,000"-"R1,000"="R7,000" 

### Step 2: Calculate the 10% portion
Next, take 10% of that extra R7,000:
10%×"R7,000"="R700" 

### Step 3: Add the base fee (R165)
Add the flat base fee of R165 to the R700 you just calculated:
"R165"+"R700"="R865" 

### Step 4: Check against the Cap
The legal maximum allowed (before VAT) is R1,050.
Since R865 is less than R1,050, your fee before VAT is R865. (If the calculation had come out to something higher, like R1,200, you would have to drop it down to R1,050).

### Step 5: Add 15% VAT
Finally, add 15% VAT to the R865 fee:
"VAT"=15%×"R865"="R129.75" 
"Total Fee Including VAT"="R865"+"R129.75"=□(R994.75)

#### Quick Summary for R8,000
	Base Fee: R165
	10% of extra R7,000: R700
	Fee before VAT: R865
	15% VAT: R129.75
##### Total Initiation Fee: R994.75

### Monthly Service Fee
	Maximum R60 per month (plus 15% VAT, which equals R69 total).

  
## Application Design:
### We should ask a user:
	Choose existing or create new borrower
	what is the loan amount, 
	how many months the loan will take (less than six months)
	let them choose interest rate. 
	  If first loan to that borrower for that calendar year, charge max of 5% per month. 
	  If not first loan to that borrower, charge max of 3% per month.
	How much for the monthly service fee.
	  Max of R60.
### What we do:
	We calculate Initiation fee.
	We calculate the total monthly repayments. Something like: (loaned amount + Interest + monthly service fee + Initiation fee) / (number of months).
### Display:
	Total repayment
	Total amount borrowed
	Total Interest
   Total monthly repayments

