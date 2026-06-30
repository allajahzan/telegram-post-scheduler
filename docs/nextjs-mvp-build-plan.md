# Next.js MVP — Post Scheduler App
### Build Plan for Antigravity / Code Generation

---

## 1. Project Overview

A minimal Next.js app to manage scheduled posts that feed into an existing n8n automation workflow (Google Sheets/MongoDB → Gemini → Telegram).

**Core rule:** Each user can have a maximum of **3 posts at a time** (pending or completed combined). To add a 4th, they must delete or repurpose an existing one — practically, once a post's status is `completed`, the user updates that same row with new content for the next post.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Database | MongoDB (Atlas, free tier) via official `mongodb` driver |
| Auth | Custom JWT-based auth (email + password) — no third-party auth library needed for MVP |
| Password hashing | `bcryptjs` |
| Styling | Plain CSS / Tailwind (optional, keep minimal) |
| Session | HTTP-only cookie storing JWT |

---

## 3. Environment Variables (`.env.local`)

```
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=post_scheduler
JWT_SECRET=a_long_random_secret_string
```

---

## 4. Database Schema

### Collection: `users`
```js
{
  _id: ObjectId,
  name: String,
  email: String,          // unique index
  password: String,       // bcrypt hashed
  telegram_chat_id: String,
  created_at: Date
}
```

### Collection: `posts`
```js
{
  _id: ObjectId,
  user_id: ObjectId,       // ref to users._id
  date: String,             // "YYYY-MM-DD"
  time: String,             // "HH:mm"
  title: String,
  description: String,
  image_url: String,        // optional, default ""
  generate_image: Boolean,  // default false
  status: String,           // "pending" | "completed"
  created_at: Date,
  updated_at: Date
}
```

> Note: n8n will read from this same `posts` collection directly (via the MongoDB node), filtering by `status: "pending"` and matching `date`/`time`. After posting, n8n updates `status` to `"completed"`.

---

## 5. Folder Structure

```
/app
  /api
    /auth
      /signup/route.js
      /login/route.js
      /logout/route.js
    /user
      /me/route.js              (GET current user info)
      /update-name/route.js     (PATCH name)
      /update-password/route.js (PATCH password)
    /posts
      /route.js                 (GET all posts for user, POST create new post)
      /[id]/route.js             (PATCH update post, DELETE post)
  /signup
    page.jsx
  /login
    page.jsx
  /dashboard
    page.jsx
  /profile
    page.jsx
  layout.jsx
  page.jsx                       (redirect to /login or /dashboard)

/components
  PostList.jsx
  PostCard.jsx
  CreatePostModal.jsx
  EditPostModal.jsx
  DeleteConfirmModal.jsx
  Navbar.jsx

/lib
  mongodb.js          (MongoDB connection singleton)
  auth.js             (JWT sign/verify helpers, getSession helper)
  validators.js        (basic input validation helpers)

/middleware.js          (protect /dashboard and /profile routes)

.env.local
```

---

## 6. Build Order — Step by Step

### Step 1 — Project Setup
1. `npx create-next-app@latest post-scheduler-app` (App Router, no TypeScript for simplicity, Tailwind optional)
2. Install dependencies:
```bash
npm install mongodb bcryptjs jsonwebtoken
```
3. Create `.env.local` with the variables from Section 3

---

### Step 2 — MongoDB Connection (`/lib/mongodb.js`)
- Create a singleton MongoDB client connection (standard Next.js pattern — avoids creating new connections on every hot reload/request)
- Export a function `getDb()` that returns the connected database instance

---

### Step 3 — Auth Helpers (`/lib/auth.js`)
- `hashPassword(password)` → uses bcryptjs
- `comparePassword(password, hash)` → uses bcryptjs
- `signToken(payload)` → creates JWT using `JWT_SECRET`, expiry ~7 days
- `verifyToken(token)` → verifies and decodes JWT
- `getSessionUser(request)` → reads JWT from cookies, verifies, returns user payload or null

---

### Step 4 — Signup API (`/app/api/auth/signup/route.js`)
**POST** — Body: `{ name, email, password, telegram_chat_id }`

Logic:
1. Validate all fields are present
2. Check if email already exists in `users` collection → reject if so
3. Hash password with bcrypt
4. Insert new user document
5. Sign a JWT with `{ userId, email }`
6. Set JWT as HTTP-only cookie
7. Return `{ success: true, user: { name, email } }`

---

### Step 5 — Login API (`/app/api/auth/login/route.js`)
**POST** — Body: `{ email, password }`

Logic:
1. Find user by email
2. If not found → 401 error
3. Compare password with bcrypt hash
4. If mismatch → 401 error
5. Sign JWT, set as HTTP-only cookie
6. Return `{ success: true, user: { name, email } }`

---

### Step 6 — Logout API (`/app/api/auth/logout/route.js`)
**POST** — Clears the auth cookie. Returns `{ success: true }`

---

### Step 7 — Middleware (`/middleware.js`)
- Protect `/dashboard` and `/profile` routes
- Read JWT cookie → verify → if invalid/missing, redirect to `/login`
- Apply via `matcher: ['/dashboard/:path*', '/profile/:path*']`

---

### Step 8 — Get Current User API (`/app/api/user/me/route.js`)
**GET** — Returns logged-in user's `{ name, email, telegram_chat_id }` (no password) based on JWT cookie

---

### Step 9 — Posts List + Create API (`/app/api/posts/route.js`)

**GET** — Returns all posts belonging to the logged-in user (max 3), sorted by `date`/`time`

**POST** — Create new post
Body: `{ date, time, title, description, image_url, generate_image }`

Logic:
1. Get logged-in user from JWT
2. Count existing posts for `user_id` → if count >= 3, return 400 error `"You can only have 3 posts at a time. Delete or update an existing post first."`
3. Insert new post with `status: "pending"`, `created_at: now`
4. Return created post

---

### Step 10 — Update / Delete Post API (`/app/api/posts/[id]/route.js`)

**PATCH** — Update existing post (used both for editing a pending post, and for repurposing a completed post into a new one)
Body: `{ date, time, title, description, image_url, generate_image, status }`

Logic:
1. Verify the post belongs to the logged-in user (`user_id` match) — reject otherwise
2. Update fields, set `updated_at: now`
3. If repurposing a completed post for a new run, frontend should send `status: "pending"` along with new date/time/content
4. Return updated post

**DELETE** — Delete the post
Logic:
1. Verify post belongs to logged-in user
2. Delete document
3. Return `{ success: true }`

---

### Step 11 — Update Name API (`/app/api/user/update-name/route.js`)
**PATCH** — Body: `{ name }`
- Update `name` field for logged-in user
- Return updated `{ name }`

---

### Step 12 — Update Password API (`/app/api/user/update-password/route.js`)
**PATCH** — Body: `{ current_password, new_password }`

Logic:
1. Fetch user, compare `current_password` with stored hash
2. If mismatch → 401 `"Current password is incorrect"`
3. Hash `new_password`, update in DB
4. Return `{ success: true }`

---

## 7. Frontend Pages — Step by Step

### Step 13 — Signup Page (`/app/signup/page.jsx`)
- Form fields: Name, Email, Password, Telegram Chat ID
- On submit → POST to `/api/auth/signup`
- On success → redirect to `/dashboard`
- Show inline error messages (e.g. "Email already registered")
- Link to `/login` at the bottom

---

### Step 14 — Login Page (`/app/login/page.jsx`)
- Form fields: Email, Password
- On submit → POST to `/api/auth/login`
- On success → redirect to `/dashboard`
- Show inline error on failure ("Invalid email or password")
- Link to `/signup` at the bottom

---

### Step 15 — Dashboard Page (`/app/dashboard/page.jsx`)
Main page after login. Structure:

1. **Navbar** — app name, link to Profile, Logout button
2. **Header section** — "Your Posts (X/3)" counter
3. **"+ Create New Post" button** — disabled/hidden if user already has 3 posts, with tooltip/message explaining the limit
4. **Post List** — fetched via `GET /api/posts`
   - Each post shown as a card with: title, date, time, status badge (Pending = yellow, Completed = green), Edit button, Delete button
5. **Empty state** — if no posts yet, show a message + prompt to create the first one

---

### Step 16 — Post Card Component (`/components/PostCard.jsx`)
Displays:
- Title (truncated if long)
- Date + Time
- Status badge
- Short description preview
- "Has image" indicator if `image_url` or `generate_image` is set
- Edit and Delete action buttons

---

### Step 17 — Create Post Modal (`/components/CreatePostModal.jsx`)
Form fields:
- Date (date picker)
- Time (time picker, note: IST)
- Title (textarea)
- Description (textarea)
- Image URL (optional text input) — helper text: "Paste a Google Drive shareable link, or leave blank"
- Generate Image checkbox/toggle — only relevant if Image URL is blank
- Submit button → POST `/api/posts`
- On success → close modal, refresh post list
- Show error if limit reached (shouldn't happen if button is properly disabled, but handle gracefully anyway)

---

### Step 18 — Edit Post Modal (`/components/EditPostModal.jsx`)
Same fields as Create modal, but:
- Pre-filled with existing post data
- Submit → PATCH `/api/posts/[id]`
- Used both for editing a still-pending post, and for repurposing a completed post (user changes date/time/title/description, frontend resets `status` to `"pending"` on submit)

---

### Step 19 — Delete Confirm Modal (`/components/DeleteConfirmModal.jsx`)
- Simple confirmation: "Delete this post? This cannot be undone."
- Confirm → DELETE `/api/posts/[id]`
- Cancel → close modal

---

### Step 20 — Profile Page (`/app/profile/page.jsx`)
Two sections:

**Section 1 — Change Name**
- Input pre-filled with current name
- Save button → PATCH `/api/user/update-name`

**Section 2 — Change Password**
- Current Password input
- New Password input
- Confirm New Password input (frontend-only check that it matches New Password)
- Save button → PATCH `/api/user/update-password`
- Show success/error message inline

---

### Step 21 — Navbar Component (`/components/Navbar.jsx`)
- App name/logo (left)
- Links: Dashboard, Profile (center/right)
- Logout button → POST `/api/auth/logout` → redirect to `/login`

---

### Step 22 — Root Page (`/app/page.jsx`)
- Server-side check: if logged in (valid JWT cookie) → redirect to `/dashboard`
- If not logged in → redirect to `/login`

---

## 8. Validation Rules Summary

| Field | Rule |
|---|---|
| `name` | Required, min 2 chars |
| `email` | Required, valid email format, unique |
| `password` | Required, min 6 chars |
| `telegram_chat_id` | Required, numeric string |
| `date` | Required, format YYYY-MM-DD, cannot be in the past |
| `time` | Required, format HH:mm |
| `title` | Required, min 3 chars |
| `description` | Required, min 5 chars |
| `image_url` | Optional |
| `generate_image` | Boolean, default false |

---

## 9. Post Limit Enforcement (Critical Logic)

Enforce in **two places** for safety:

1. **Frontend** — disable "Create New Post" button when `posts.length >= 3`, show message: *"You've reached the 3-post limit. Edit or delete an existing post to add a new one."*
2. **Backend** (`POST /api/posts`) — always re-check count server-side before inserting, regardless of frontend state (prevents bypass via direct API calls)

---

## 10. Status Flow

```
[Create Post] → status: "pending"
       ↓
n8n workflow picks it up at scheduled date/time
       ↓
n8n posts to Telegram → updates status: "completed"
       ↓
User sees it as "Completed" in dashboard
       ↓
User clicks Edit → changes date/time/title/description → Save
       ↓
status resets to "pending" → cycle repeats
```

---

## 11. n8n Workflow Changes Needed (After App Is Built)

Once this app is live, update your existing n8n workflow:
1. Replace **"Get row(s) in sheet"** (Google Sheets node) with a **MongoDB node** → operation `Find`, query: `{ status: "pending", date: <today IST>, time: <now IST> }`
2. Replace the **Filter node** logic — MongoDB query already filters, so Filter node may become unnecessary or simplified to just a safety check
3. Replace the final **"Mark as posted"** Google Sheets node with a **MongoDB node** → operation `Update`, filter by `_id`, set `{ status: "completed" }`
4. Everything else (Gemini polish, image generation, Telegram send) stays exactly the same — they don't care whether the data came from Sheets or MongoDB

*(This integration step is separate from the Next.js app build — handle after the app + DB is working standalone.)*

---

## 12. MVP Scope Boundaries (What NOT to Build Yet)

To keep this MVP fast or use it via antigravity, explicitly skip these for now:
- Email verification on signup
- "Forgot password" flow
- Pagination (max 3 posts, so not needed)
- Image upload directly in the app (still using Drive links / generate_image toggle)
- Admin panel
- Multiple posts beyond 3
- LinkedIn integration in the app itself (still Telegram-only per current n8n setup)

---

## 13. Quick Test Plan After Build

1. Sign up a test user → confirm redirected to dashboard
2. Create 1 post → appears in list as "Pending"
3. Create 2 more posts (total 3) → "Create New Post" button should now disable
4. Try creating a 4th via direct API call (Postman) → should get rejected with limit error
5. Edit a post → confirm changes save and status stays "pending"
6. Delete a post → confirm it's removed, button re-enables for new post
7. Manually update one post's `status` to `"completed"` directly in MongoDB → refresh dashboard → confirm badge shows "Completed"
8. Go to Profile → change name → confirm updates
9. Change password → log out → log back in with new password → confirm works
10. Try logging in with wrong password → confirm proper error shown
