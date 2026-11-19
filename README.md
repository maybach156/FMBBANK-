# FMB BANK — Complete demo website

A responsive React/Vite customer portal with a Node.js serverless API and PostgreSQL database.

## Important: demo only
This project is a software demonstration, not a licensed bank or financial institution. It does not open real bank accounts, accept deposits, process withdrawals, issue payment cards, or move money. Balances are illustrative and all transaction actions create records labelled `SIMULATED`.

Do not invite the public to deposit or transfer real funds through this project. Real financial services require appropriate authorisations and regulated banking/payment partners.

## Features
- Responsive landing page and premium navy/gold styling
- Customer registration, login and logout
- Password hashing with bcrypt
- HttpOnly, Secure authentication cookie
- PostgreSQL user and demo transaction storage
- Demo-only transfer/deposit/withdrawal activity records
- Admin preview with user list, simulated activity and audit events
- Admin role assigned only to the email configured in `ADMIN_EMAIL`

## Deploy on Vercel (Android-friendly)
1. Create a PostgreSQL database with a managed provider such as Neon.
2. Copy its PostgreSQL connection string.
3. Upload the contents of this project to a new GitHub repository. Keep the folders `api`, `frontend`, and `database` at the repository root.
4. In Vercel, choose **Add New → Project**, import that GitHub repository, and deploy.
5. In Vercel Project → Settings → Environment Variables, add:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `JWT_SECRET` = a long random secret of at least 32 characters
   - `ADMIN_EMAIL` = the email address you will use for the admin profile
   - `PGSSL` = `true`
6. Redeploy after adding environment variables.
7. Open the deployed site and register using the exact `ADMIN_EMAIL` address to create the admin profile. Register other users as customer profiles.

The API creates the required database tables automatically on first request. You can also run `database/schema.sql` manually in your database SQL editor.

## Local development
- Install Node.js 20+
- Run `npm install`
- Copy `.env.example` to `.env` and fill in the variables
- Run `npm run dev` for the frontend
- Vercel API routes are best tested with Vercel CLI (`vercel dev`) because Vite's dev server does not execute the `/api` functions.

## Project structure
- `frontend/` — React user interface
- `api/` — Vercel serverless backend endpoints
- `database/schema.sql` — PostgreSQL schema
- `vercel.json` — Vercel build and function configuration

## Security notes before any real-world use
This starter is not a production banking system. Before any real financial product, engage qualified legal/compliance and security professionals, obtain required approvals, use regulated partners, add robust rate limiting, email verification, password reset, MFA, CSRF controls, monitoring, backups, incident response, and independent security testing.
