# Beginner's Guide to Setting Up Supabase

Don't worry! Supabase is just a place on the internet to store your app's data (like users and profiles). Follow these steps to get your "Keys".

## Step 1: Create an Account
1.  Open your web browser and go to: **[https://supabase.com](https://supabase.com)**
2.  Click the green **"Start your project"** button.
3.  **Sign in**: You can sign in with a GitHub account. If you don't have one, you'll need to create a GitHub account first (it's free and standard for developers).

## Step 2: Create a New Project
1.  Once logged in, click **"New Project"**.
2.  **Organization**: Choose the default one (it might be your username).
3.  **Name**: Type `EduPortal`.
4.  **Database Password**: Click "Generate a password" and **COPY IT** to a safe place (like a notepad), just in case. You usually won't need it for what we are doing, but it's good to have.
5.  **Region**: Select a region close to you (e.g., "Mumbai" if you are in India, or any other close city).
6.  Click **"Create new project"**.
7.  *Wait:* It will take about 1-2 minutes to "Setting up...".

## Step 3: Get Your API keys
1.  Once the project is "Active" (green), look at the left sidebar menu.
2.  Click the **Settings Icon** ⚙️ (usually at the very bottom).
3.  Click **API** in the list.
4.  Find **Project URL**: Copy this link.
5.  Find **anon public key**: Copy this long text string.

## Step 4: Update Your Code
1.  Go back to VS Code.
2.  Open the file `supabase.js`.
3.  Paste the **Project URL** where it says `'YOUR_SUPABASE_PROJECT_URL'`.
4.  Paste the **anon key** where it says `'YOUR_SUPABASE_ANON_PUBLIC_KEY'`.

## Step 5: Create the Database Tables
1.  Go back to the Supabase Dashboard.
2.  Click the **SQL Editor** icon on the left (it looks like a terminal `>_`).
3.  Click **"New Query"**.
4.  Copy all the code from your `schema.sql` file in VS Code.
5.  Paste it into the Supabase SQL box.
6.  Click **"Run"** (bottom right).
7.  You should see "Success".

Now your app is ready!
