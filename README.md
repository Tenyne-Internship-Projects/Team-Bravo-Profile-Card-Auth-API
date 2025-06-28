# Team Bravo – Profile Card & Auth API (Backend)

This is the backend API powering **Tenyne’s Profile Card & Authentication System**. It enables user registration, secure email OTP verification, login with "Remember Me", password resets, and rich profile management, including avatar uploads, document uploads, search, and deletion.

---

## Tech Stack

* **Node.js + Express**
* **PostgreSQL** (via Neon or local)
* **Prisma ORM**
* **JWT** for auth
* **Nodemailer (Amazon SES)** for email
* **Multer** for file uploads
* **Passport.js** for social login
* **Swagger** for API docs

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Tenyne-Internship-Projects/Team-Bravo-Profile-Card-Auth-API.git
cd Team-Bravo-Profile-Card-Auth-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret

# Email (Amazon SES / SMTP)
SMTP_HOST=email-smtp.eu-north-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_ADMIN_EMAIL=admin@tenyne.com
SMTP_SENDER_NAME=Tenyne

BASE_URL=http://localhost:3000

ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
```

### 4. Set Up Database

Run Prisma migration or schema SQL scripts:

```bash
npx prisma migrate dev --name init
```

> You can also manually use `psql` to execute the table SQLs in `prisma/schema.sql` if needed.

---

## Running the App

```bash
npm run dev
```

Your API will be running at:
**`http://localhost:3000`**

---

## Authentication Routes

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| POST   | `/api/auth/register`       | Register new user (sends OTP email) |
| POST   | `/api/auth/verify-otp`     | Verify email OTP                    |
| POST   | `/api/auth/resend-otp`     | Resend OTP                          |
| POST   | `/api/auth/login`          | Login with email/password           |
| POST   | `/api/auth/reset-password` | Request password reset via OTP      |
| POST   | `/api/auth/confirm-reset`  | Confirm and set new password        |
| GET    | `/api/auth/google`         | Login via Google (OAuth)            |
| GET    | `/api/auth/linkedin`       | Login via LinkedIn (OAuth)          |

---

## Profile Routes

| Method | Endpoint              | Description                        |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/api/profile`        | Get current user profile           |
| POST   | `/api/profile`        | Create user profile                |
| PUT    | `/api/profile`        | Update profile details             |
| DELETE | `/api/profile`        | Delete entire profile              |
| GET    | `/api/profile/search` | Search profiles by skills or name  |
| GET    | `/api/profile/all`    | Get paginated list of all profiles |

---

## File Uploads

### Avatar Upload

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| POST   | `/api/profile/upload-avatar` | Upload or update avatar (1 file) |

* Uploaded to: `/uploads/avatars/`
* Stored in DB as full URL under `avatar_url`

### Document Upload

| Method | Endpoint                       | Description                         |
| ------ | ------------------------------ | ----------------------------------- |
| POST   | `/api/profile/documents`       | Upload 1–5 documents (PDF/DOC/DOCX) |
| DELETE | `/api/profile/documents/:file` | Delete one uploaded document        |

* Uploaded to: `/uploads/documents/`
* Stored in DB as an array under `documents[]`
* URL format: `${BASE_URL}/uploads/documents/<filename>`

---

## Profile Search & Pagination

* **Search endpoint:**
  `GET /api/profile/search?search=react&page=1&limit=10`
* Filters by: `fullName`, `skills`, or `tools`
* Supports: pagination metadata in response

---

## Static File Access

Uploaded assets are served from `/uploads`:

```
http://localhost:3000/uploads/avatars/<filename>
http://localhost:3000/uploads/documents/<filename>
```

Handled by:

```js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

---

## Swagger API Docs

Access interactive docs at:
**`http://localhost:3000/api-docs`**

All routes and schemas are documented with `swagger-ui-express`.

---

## To-Do / Improvements

* [ ] Add frontend document deletion support
* [ ] Limit file size (via `limits` in multer config)
* [ ] Improve OAuth callback handling
* [ ] Add unit tests with Jest & Supertest

---

## Team Bravo Members

* **Light Ikoyo** (Backend)
* **Ashaolu Samson** (Backend)
* **Ja’Afar Sallau** (Frontend)
* **Friday** (Frontend)
* **Victor** (QA)
* **Solomon Ogar** (Product Manager)
* **Emmanuel Olowo** (UI/UX)
* **Jerry** (UI/UX)

---
