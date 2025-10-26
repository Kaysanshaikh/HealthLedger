# HealthLedger Free Deployment Guide 🚀

Welcome! This guide provides a detailed, step-by-step walkthrough for deploying your HealthLedger application for **free**. We will use two powerful and easy-to-use services:

-   **[Render](https://render.com)**: For hosting our backend Node.js API and PostgreSQL database.
-   **[Netlify](https://netlify.com)**: For hosting our frontend React application.

No prior deployment experience is needed. Just follow along!

---

## 📋 Prerequisites

Before you begin, make sure you have the following ready:

1.  **A GitHub Account**: Your code should be in a GitHub repository.
2.  **Your `.env` File Values**: Keep your environment variables handy. You will need:
    -   `PRIVATE_KEY`
    -   `CONTRACT_ADDRESS`
    -   `PINATA_API_KEY`
    -   `PINATA_SECRET_KEY`
    -   Your Alchemy RPC URL for Polygon Amoy.

---

## PART 1: Deploying the Backend API on Render

In this part, we'll set up your database and backend server.

### Step 1: Sign Up for Render

1.  Go to **[render.com](https://render.com)**.
2.  Click **"Get Started for Free"**.
3.  Sign up using your **GitHub account**. This makes connecting your repository much easier.
4.  Authorize Render to access your repositories when prompted.

### Step 2: Create a PostgreSQL Database

Your application needs a database to store user and record information. Render provides a free one.

1.  From your Render Dashboard, click **"New +"** in the top left corner.
2.  Select **"PostgreSQL"** from the dropdown menu.
3.  **Configure your database:**
    -   **Name**: `healthledger-db` (or any name you prefer).
    -   **Database Name**: `healthledger`
    -   **User**: Render will auto-generate one for you.
    -   **Region**: Choose a region closest to you for better performance (e.g., Ohio, Frankfurt).
    -   **Instance Type**: Select the **Free** plan.
4.  Click **"Create Database"**.

It will take 2-3 minutes for your database to be created. Once it's ready, go to its page and find the **"Connections"** section. **Copy and save the following details** for the next step:

-   **Hostname**
-   **Port**
-   **Database** name
-   **Username**
-   **Password**

### Step 3: Create the Backend Web Service

Now, let's deploy the Node.js server.

1.  Click **"New +"** → **"Web Service"**.
2.  Click **"Build and deploy from a Git repository"** and connect your `HealthLedger-main` repository.
3.  **Configure the service:**
    -   **Name**: `healthledger-api` (this will be part of your URL).
    -   **Region**: Select the *same region* as your database.
    -   **Branch**: `main`.
    -   **Root Directory**: Leave this blank (as your `package.json` is in the root).
    -   **Runtime**: `Node`.
    -   **Build Command**: `npm install`.
    -   **Start Command**: `npm start`.
    -   **Instance Type**: Select the **Free** plan.

### Step 4: Add Environment Variables

This is the most critical step. Your backend needs its secret keys and database credentials to run.

1.  Scroll down to the **"Advanced"** section and expand it.
2.  Click **"Add Environment Variable"** for each of the following keys. Use the values from your `.env` file and the database you just created.

| Key | Value | Description |
| :--- | :--- | :--- |
| `PGHOST` | `<your-db-hostname>` | From Render Database page |
| `PGDATABASE` | `healthledger` | From Render Database page |
| `PGUSER` | `<your-db-username>` | From Render Database page |
| `PGPASSWORD` | `<your-db-password>` | From Render Database page |
| `PGPORT` | `5432` | Standard PostgreSQL port |
| `POLYGON_AMOY_RPC`| `https://polygon-amoy.g.alchemy.com/v2/...` | Your Alchemy RPC URL |
| `PRIVATE_KEY` | `<your-wallet-private-key>` | From your local `.env` file |
| `CONTRACT_ADDRESS`| `<your-deployed-contract-address>` | From your local `.env` file |
| `PINATA_API_KEY` | `<your-pinata-api-key>` | From your local `.env` file |
| `PINATA_SECRET_KEY`| `<your-pinata-secret-key>` | From your local `.env` file |
| `JWT` | `healthledger_prod_secret_12345` | A secure, random string for production |

3.  After adding all variables, click **"Create Web Service"** at the bottom of the page.

Render will now start building and deploying your backend. This can take 5-10 minutes. You can watch the progress in the **"Events"** tab.

### Step 5: Initialize the Production Database

Once your backend is live (you'll see a "Live" status), you need to create the tables in your new database.

1.  Go to your `healthledger-api` service dashboard on Render.
2.  Click the **"Shell"** tab.
3.  In the command line that appears, type the following command and press Enter:
    ```bash
    npm run db:init
    ```
4.  This will run your database initialization script and set up all the necessary tables.

**Backend is now deployed!** Copy your backend URL (it looks like `https://healthledger-api.onrender.com`) for the next part.

---

## PART 2: Deploying the Frontend on Netlify

Now let's get your React application online.

### Step 1: Sign Up for Netlify

1.  Go to **[netlify.com](https://netlify.com)**.
2.  Click **"Sign up"** and choose to sign up with your **GitHub account**.

### Step 2: Deploy Your Site

1.  From your Netlify dashboard, click **"Add new site"** → **"Import an existing project"**.
2.  Choose **"Deploy with GitHub"** and select your `HealthLedger-main` repository.
3.  **Configure the build settings:**
    -   **Base directory**: `frontend` (This is very important! It tells Netlify where your React app is).
    -   **Build command**: `npm run build`.
    -   **Publish directory**: `frontend/build`.

### Step 3: Add the Backend API URL

Your frontend needs to know where to send API requests.

1.  Click **"Show advanced"** and then **"New variable"**.
2.  Add the following environment variable:
    -   **Key**: `REACT_APP_API_URL`
    -   **Value**: `https://healthledger-api.onrender.com/api` (Paste your Render backend URL here and add `/api` at the end).
3.  Click **"Deploy site"**.

Netlify will now build and deploy your frontend. This usually takes 3-5 minutes.

---

## PART 3: Final Configuration

One last step to make sure the frontend and backend can talk to each other.

1.  Go back to your **Render dashboard** for the `healthledger-api` service.
2.  Go to the **"Environment"** tab.
3.  Add one more environment variable to your backend:
    -   **Key**: `FRONTEND_URL`
    -   **Value**: `https://your-site-name.netlify.app` (Paste your Netlify site URL here).

This change will automatically trigger a new deployment for your backend to apply the new CORS setting.

---

## 🎉 You're Live!

Your HealthLedger application is now deployed and accessible to the world! You can visit your Netlify URL to see your live application.

### Important Notes on Free Tiers

-   **Render's Free Tier**: The backend service will **"spin down"** after 15 minutes of inactivity. The first request after it has spun down will be slow (30-60 seconds) as the server starts up again. This is normal for free plans.
-   **Render's Free Database**: The free PostgreSQL database on Render **expires after 90 days**. Remember to back up your data if you plan to use it long-term or upgrade to a paid plan.

Happy deploying! 🥳
