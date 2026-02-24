# Creating and Connecting to Sanity

Follow these steps to create a Sanity project and connect it to Michael-Wolever.

---

## Step 1: Create a Sanity account (if needed)

1. Go to **https://www.sanity.io**
2. Click **Get started** or **Log in**
3. Sign up with Google, GitHub, or email

---

## Step 2: Create a new Sanity project

1. Go to **https://www.sanity.io/manage**
2. Click **Create project** (or **Add project**)
3. Fill in:
   - **Project name:** e.g. `Michael Wolever` or `My Site`
   - **Use the default dataset** (leave as-is; dataset name is usually `production`)
4. Click **Create**
5. You can skip “Invite collaborators” for now (click **Skip** or **I’ll do this later**)

---

## Step 3: Get your Project ID

1. Stay on **https://www.sanity.io/manage**
2. Click your **project name** (the one you just created)
3. In the project dashboard, find **Project ID** (e.g. `abc123xy`)
   - Or go to **Project settings** (gear icon) → **General** → **Project ID**
4. **Copy** the Project ID — you’ll paste it into `.env.local` in Step 5

---

## Step 4: Create an API token

1. In your project on **https://www.sanity.io/manage**, open **Project settings** (gear icon)
2. Go to **API** → **Tokens**
3. Click **Add API token**
4. Set:
   - **Token name:** e.g. `Michael-Wolever dev`
   - **Permissions:** **Viewer** (read-only is enough for the site to read content)
5. Click **Save**
6. **Copy the token** immediately — Sanity only shows it once. If you lose it, create a new token.

---

## Step 5: Connect your app with `.env.local`

1. In your project folder, open **`.env.local`** (in the root of `Michael-Wolever`)
2. Replace the placeholders with your values:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=paste_your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=paste_your_token_here

# Site Configuration (optional)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- **NEXT_PUBLIC_SANITY_PROJECT_ID** — from Step 3  
- **NEXT_PUBLIC_SANITY_DATASET** — keep as `production` unless you used a different dataset  
- **SANITY_API_READ_TOKEN** — the token from Step 4  
- **NEXT_PUBLIC_SITE_URL** — use `http://localhost:3000` for local dev (optional)

3. Save the file.  
   **Important:** Never commit `.env.local` to Git (it’s already in `.gitignore`).

---

## Step 6: Run the app and open Sanity Studio

1. From the project root, run:

```bash
npm run dev
```

2. In your browser:
   - **Website:** http://localhost:3000  
   - **Sanity Studio (admin):** http://localhost:3000/studio  

3. In Studio you can:
   - Create a **Homepage** document (use slug `home`)
   - Create **Global settings** for site title, description, etc.
   - Create **Posts**, **Pages**, and **Navigation** as needed

---

## Quick checklist

- [ ] Sanity account created
- [ ] New project created at sanity.io/manage
- [ ] Project ID copied
- [ ] API token created (Viewer) and copied
- [ ] `.env.local` updated with Project ID, dataset, and token
- [ ] `npm run dev` run successfully
- [ ] Opened http://localhost:3000/studio
- [ ] Created **Homepage** (slug: `home`) and **Global settings** in Studio

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| Studio shows “Project not found” or blank | Check `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local` and restart `npm run dev`. |
| Site loads but no content | Create a **Homepage** with slug `home` and **Global settings** in Studio. |
| “Unauthorized” or token errors | Create a new **Viewer** token in Project settings → API → Tokens and update `SANITY_API_READ_TOKEN`. |
| Changes in Studio not on site | Hard refresh (Cmd+Shift+R / Ctrl+Shift+R). The template uses ISR (e.g. 60s revalidation). |

For more: [Sanity docs](https://www.sanity.io/docs) · [Manage projects](https://www.sanity.io/manage)
