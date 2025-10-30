# HealthLedger Deployment Guide 🚀

Welcome! This guide provides a detailed, step-by-step walkthrough for deploying your HealthLedger application. We will use the following services:

-   **[Render](https://render.com)**: For hosting both the backend Node.js API and frontend React application.
-   **[Neon](https://neon.tech)**: For the PostgreSQL database (serverless and free tier available).
-   **[Pinata](https://pinata.cloud)**: For IPFS storage of medical records.

No prior deployment experience is needed. Just follow along!

---

## 📋 Prerequisites

Before you begin, make sure you have the following ready:

1.  **A GitHub Account**: Your code should be in a GitHub repository.
2.  **Your Environment Variables**: Keep these values handy:
    -   `PRIVATE_KEY` (Wallet private key for blockchain transactions)
    -   `CONTRACT_ADDRESS` (Your deployed smart contract address)
    -   `PINATA_API_KEY` (From Pinata dashboard)
    -   `PINATA_SECRET_KEY` (From Pinata dashboard)
    -   `PINATA_JWT` (Optional, from Pinata dashboard)
    -   `POLYGON_AMOY_RPC` (Your RPC URL for Polygon Amoy testnet)

---

## PART 1: Setting Up Neon PostgreSQL Database

Neon provides a serverless PostgreSQL database with a generous free tier.

### Step 1: Create a Neon Account

1.  Go to **[neon.tech](https://neon.tech)**.
2.  Click **"Sign Up"** and sign up using your **GitHub account**.
3.  Verify your email if prompted.

### Step 2: Create a New Project

1.  From your Neon Console, click **"Create a project"**.
2.  **Configure your project:**
    -   **Project Name**: `HealthLedger` (or any name you prefer).
    -   **Database Name**: `neondb` (default is fine).
    -   **Region**: Choose a region closest to you (e.g., US East, EU Central).
3.  Click **"Create Project"**.

### Step 3: Get Database Connection Details

Once your project is created, you'll see the connection details.

1.  Click on **"Connection Details"** or find the **"Connection string"** section.
2.  **Copy and save the following details** (you'll need these for Render):
    -   **PGHOST**: Your Neon hostname (e.g., `ep-xxx-xxx.us-east-1.aws.neon.tech`)
    -   **PGDATABASE**: `neondb` (or your custom database name)
    -   **PGUSER**: Your database username (e.g., `neondb_owner`)
    -   **PGPASSWORD**: Your database password
    -   **Connection String**: The full PostgreSQL URL (starts with `postgresql://`)

**Important Notes:**
-   Neon requires SSL connections. The connection parameters `PGSSLMODE=require` will be needed.
-   Keep your password secure!

---

## PART 2: Deploying the Backend API on Render

Now let's deploy your Node.js backend server.

### Step 1: Sign Up for Render

1.  Go to **[render.com](https://render.com)**.
2.  Click **"Get Started for Free"**.
3.  Sign up using your **GitHub account**.
4.  Authorize Render to access your repositories when prompted.

### Step 2: Create the Backend Web Service

Now, let's deploy the Node.js server.

1.  From your Render Dashboard, click **"New +"** → **"Web Service"**.
2.  Click **"Build and deploy from a Git repository"** and select your HealthLedger repository.
3.  **Configure the service:**
    -   **Name**: `healthledger-api` (this will be part of your URL).
    -   **Region**: Choose the same region as your Neon database for better performance.
    -   **Branch**: `main` (or your default branch).
    -   **Root Directory**: Leave this **blank** (the backend `package.json` is in the root).
    -   **Runtime**: `Node`.
    -   **Build Command**: `npm install`.
    -   **Start Command**: `npm start`.
    -   **Instance Type**: Select the **Free** plan.

### Step 3: Add Backend Environment Variables

This is critical! Your backend needs environment variables to connect to the database, blockchain, and IPFS.

1.  Scroll down to the **"Environment Variables"** section.
2.  Click **"Add Environment Variable"** for each of the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `PGHOST` | `<your-neon-hostname>` | From Neon connection details |
| `PGDATABASE` | `neondb` | From Neon connection details |
| `PGUSER` | `<your-neon-username>` | From Neon connection details |
| `PGPASSWORD` | `<your-neon-password>` | From Neon connection details |
| `PGSSLMODE` | `require` | Required for Neon SSL connection |
| `PGCHANNELBINDING` | `require` | Required for Neon security |
| `POLYGON_AMOY_RPC`| `<your-rpc-url>` | Your Polygon Amoy RPC endpoint |
| `PRIVATE_KEY` | `<your-wallet-private-key>` | Wallet private key (keep secure!) |
| `CONTRACT_ADDRESS`| `<your-contract-address>` | Your deployed smart contract address |
| `PINATA_API_KEY` | `<your-pinata-api-key>` | From Pinata dashboard |
| `PINATA_SECRET_KEY`| `<your-pinata-secret-key>` | From Pinata dashboard |
| `PINATA_JWT` | `<your-pinata-jwt>` | Optional, from Pinata dashboard |
| `JWT_SECRET` | `<strong-random-string>` | Generate a secure random string for JWT tokens |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | Will update this after frontend deployment |

3.  Click **"Create Web Service"** at the bottom.

Render will now build and deploy your backend. This takes 5-10 minutes. Watch the progress in the **"Logs"** tab.

### Step 4: Initialize the Database

Once your backend shows a **"Live"** status:

1.  Go to your `healthledger-api` service dashboard on Render.
2.  Click the **"Shell"** tab (top right).
3.  Run the database initialization command:
    ```bash
    npm run db:init
    ```
4.  Wait for the script to complete. This creates all necessary tables in your Neon database.

**Backend is now deployed!** Copy your backend URL (e.g., `https://healthledger.onrender.com/api`) - you'll need it for the frontend.

---

## PART 3: Deploying the Frontend on Render

Now let's deploy your React application on Render.

### Step 1: Create the Frontend Web Service

1.  From your Render Dashboard, click **"New +"** → **"Web Service"**.
2.  Select your HealthLedger repository again.
3.  **Configure the service:**
    -   **Name**: `healthledger-frontend` (or any name you prefer).
    -   **Region**: Same region as your backend for best performance.
    -   **Branch**: `main`.
    -   **Root Directory**: `frontend` (**Important!** This tells Render where your React app is).
    -   **Runtime**: `Node`.
    -   **Build Command**: `npm install && npm run build`.
    -   **Start Command**: `npm start` (uses `serve` to serve the built React app).
    -   **Instance Type**: Select the **Free** plan.

### Step 2: Add Frontend Environment Variables

Your frontend needs to know where to send API requests.

1.  In the **"Environment Variables"** section, add:
    -   **Key**: `REACT_APP_API_URL`
    -   **Value**: `https://healthledger-api.onrender.com/api` (Replace with your actual backend URL from Part 2, and add `/api` at the end)

2.  Click **"Create Web Service"**.

Render will now build and deploy your frontend. This takes 5-10 minutes. The build process will:
- Install dependencies
- Build the React production bundle
- Serve it using the `serve` package

---

## PART 4: Final Configuration

Update the backend to allow requests from your frontend.

### Step 1: Update Backend CORS Settings

1.  Go back to your **Render dashboard** and select the `healthledger-api` service.
2.  Click on the **"Environment"** tab.
3.  Find the `FRONTEND_URL` environment variable (you added it earlier).
4.  Update its value to your actual frontend URL:
    -   **Value**: `https://healthledger-frontend.onrender.com` (Replace with your actual frontend URL)
5.  Click **"Save Changes"**.

This will automatically trigger a redeployment of your backend with the correct CORS settings.

---

## 🎉 You're Live!

Your HealthLedger application is now fully deployed! Visit your frontend URL to access the application.

### Your Deployment URLs

-   **Frontend**: `https://healthledger-frontend.onrender.com`
-   **Backend API**: `https://healthledger-api.onrender.com`
-   **Database**: Hosted on Neon (serverless)
-   **IPFS Storage**: Pinata

---

## 📝 Important Notes

### Free Tier Limitations

**Render Free Tier:**
-   Services **spin down** after 15 minutes of inactivity.
-   First request after spin-down takes 30-60 seconds to wake up.
-   750 hours/month of free usage per service.
-   Both frontend and backend will spin down independently.

**Neon Free Tier:**
-   **Always-available** compute with 0.5 GB RAM.
-   3 GB storage included.
-   Automatic scaling and serverless architecture.
-   No expiration (unlike Render's old free database).

**Pinata Free Tier:**
-   1 GB of IPFS storage.
-   Unlimited pinning requests.
-   Perfect for medical document storage.

### Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify medical record upload (IPFS via Pinata)
- [ ] Check blockchain transaction recording
- [ ] Test access control features
- [ ] Verify database connections
- [ ] Monitor Render logs for any errors

### Monitoring and Maintenance

1.  **Check Logs**: Use Render's "Logs" tab to monitor both services.
2.  **Database Monitoring**: Use Neon's dashboard to monitor database usage and queries.
3.  **IPFS Monitoring**: Check Pinata dashboard for storage usage and pinned files.
4.  **Blockchain**: Monitor transactions on Polygon Amoy testnet explorer.

### Troubleshooting

**Backend won't start:**
-   Check environment variables are set correctly
-   Verify Neon database connection string
-   Check Render logs for specific errors

**Frontend can't connect to backend:**
-   Verify `REACT_APP_API_URL` is set correctly
-   Check CORS settings (FRONTEND_URL in backend)
-   Ensure both services are "Live" on Render

**Database connection errors:**
-   Verify `PGSSLMODE=require` is set
-   Check Neon database is active
-   Confirm all PG* environment variables are correct

**IPFS upload failures:**
-   Verify Pinata API keys are correct
-   Check Pinata dashboard for rate limits
-   Ensure you haven't exceeded free tier storage

---

## 🚀 Upgrading to Production

When you're ready to go to production:

1.  **Render**: Upgrade to a paid plan for always-on services ($7/month per service).
2.  **Neon**: Scale up compute and storage as needed (pay-as-you-go).
3.  **Pinata**: Upgrade for more storage if needed.
4.  **Blockchain**: Deploy to Polygon mainnet (update RPC URL and redeploy contract).
5.  **Domain**: Add a custom domain in Render settings i.e https://healthledger.onrender.com/

Happy deploying! 🥳
