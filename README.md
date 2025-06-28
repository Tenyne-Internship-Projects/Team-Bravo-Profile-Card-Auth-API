# Team Bravo – Profile Card & Auth API (Backend)

This is the backend API powering **Tenyne’s Profile Card & Authentication System**. It enables user registration, secure email OTP verification, login with "Remember Me", password resets, and rich profile management, including avatar uploads, document uploads, search, and deletion.

---

##  Project Overview

 Would Add a Loom demo walkthrough and screenshots of Swagger UI, registration, and profile upload APIs here.

 **Loom Demo Link**: _Add Loom video link here_

---

###  Screenshots _(Suggested)_
- **Swagger UI overview**
- **Register + Verify OTP request/response**
- **Avatar/document upload endpoints**

---
 
    API Testing with Postman
You can explore and test all backend endpoints using our official Postman collection:

    Click here to open the Team Bravo Postman Collection: 
    https://team-alpha-tenyne.postman.co/workspace/Team-Alpha-Tenyne-Workspace~146eacc1-3aeb-4d7a-8d2d-583192a0e762/collection/39633508-40817f78-16a0-4871-81cd-e1fe670313f4?action=share&creator=39633508

   Includes full test coverage for:

   Authentication routes (register, login, OTP, reset)

   Profile CRUD

   Avatar & document uploads

   Search with pagination

   Protected routes with token auth

🛠 How to Use
Open the link above

Click "Fork" to add it to your own Postman workspace

Set environment variables (BASE_URL, JWT_TOKEN, etc.)

Run requests directly or as a collection runner suite

##  Tech Stack

- **Node.js + Express**
- **PostgreSQL** (via Neon or local)
- **Prisma ORM**
- **JWT** for authentication
- **Nodemailer (Amazon SES)** for email services
- **Multer** for handling file uploads
- **Passport.js** for social login (OAuth2)
- **Swagger** for auto-generated API docs

---

##  Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Tenyne-Internship-Projects/Team-Bravo-Profile-Card-Auth-API.git
cd Team-Bravo-Profile-Card-Auth-API/hireConnect-backend-api
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

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

### 4. Initialize & Generate Prisma Client

```bash
npx prisma generate
npx prisma migrate dev --name init
```

>  This sets up your PostgreSQL tables using Prisma schema and creates the client for database access.

---

##  Running the App

```bash
npm run dev
```

Access the backend API via:
 `http://localhost:3000`

---

##  Authentication Routes

| Method | Endpoint                 | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| POST   | /api/auth/register       | Register new user (sends OTP email) |
| POST   | /api/auth/verify-otp     | Verify email OTP                    |
| POST   | /api/auth/resend-otp     | Resend OTP                          |
| POST   | /api/auth/login          | Login with email/password           |
| POST   | /api/auth/reset-password | Request password reset via OTP      |
| POST   | /api/auth/confirm-reset  | Confirm and set new password        |
| GET    | /api/auth/google         | Login via Google (OAuth)            |
| GET    | /api/auth/linkedin       | Login via LinkedIn (OAuth)          |

---

##  Profile Routes

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | /api/profile        | Get current user profile       |
| POST   | /api/profile        | Create user profile            |
| PUT    | /api/profile        | Update profile details         |
| DELETE | /api/profile        | Delete entire profile          |
| GET    | /api/profile/search | Search profiles by skills/name |
| GET    | /api/profile/all    | Get paginated list of profiles |

---

##  File Uploads

###  Avatar Upload

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| POST   | /api/profile/upload-avatar | Upload or update avatar |

* Uploaded to: `/uploads/avatars/`
* Saved in DB under `avatar_url`

---

###  Document Upload

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| POST   | /api/profile/documents        | Upload 1–5 documents (PDF/DOC/DOCX) |
| DELETE | /api/profile/documents/\:file | Delete one uploaded document        |

* Uploaded to: `/uploads/documents/`
* Stored in DB as array under `documents[]`
* Access URL: `${BASE_URL}/uploads/documents/<filename>`

---

##  Profile Search & Pagination

```http
GET /api/profile/search?search=react&page=1&limit=10
```

* Filters: `fullName`, `skills`, or `tools`
* Returns: paginated profile results

---

##  Static File Access

All uploaded files are publicly accessible:

```
http://localhost:3000/uploads/avatars/<filename>
http://localhost:3000/uploads/documents/<filename>
```

> Via Express static middleware:

```js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

---

##  Swagger API Docs

Interactive API docs available at:
 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

 *(Insert screenshot of Swagger UI here)*

---

##  Postman Testing

> Download Postman collection: [Team-Bravo-API.postman\_collection.json](./Team-Bravo-API.postman_collection.json)

### Sample Test Cases:

*  `POST /api/auth/register` → Send user details, check email for OTP
*  `POST /api/auth/verify-otp` → Submit received OTP
*  `POST /api/auth/login` → Login with email/password
*  `GET /api/profile` → Fetch authenticated user profile (needs token in headers)
*  `POST /api/profile/upload-avatar` → Upload a JPEG/PNG avatar file via `form-data`
*  `POST /api/profile/documents` → Upload 1–5 PDFs via `form-data`
*  `GET /api/profile/search?search=engineer` → Test search & pagination

---

##  To-Do / Improvements

* [ ] Add frontend support for document deletion
* [ ] Limit file size in Multer config
* [ ] Improve OAuth callback UX
* [ ] Add unit tests with Jest & Supertest

---

##  Team Bravo Members

| Name            | Role            |
| --------------- | --------------- |
| Light Ikoyo     | Backend         |
| Ashaolu Samson  | Backend         |
| Ja’Afar Sallau  | Frontend        |
| Dandy Friday    | Frontend        |
| Victor Idebi    | QA              |
| Solomon Ogar    | Product Manager |
| Emmanuel Olowo  | UI/UX           |
| Omoshebi Akanni | UI/UX           |

---

##  Contributing

We welcome contributions from all team members and collaborators. To contribute:

1. Fork the repository
2. Create a new branch:

   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add my feature"
   ```
4. Push to your fork:

   ```bash
   git push origin feature/my-feature
   ```
5. Open a **Pull Request** against the `dev` branch

>  All code contributions should follow the existing project structure and naming conventions.

---

##  Acknowledgments

Special thanks to **Tenyne Technologies** for initiating this collaborative internship project. This backend API is the result of joint efforts from developers, designers, and team leads working together to solve real-world challenges in authentication and profile management.

> “Alone we can do so little; together we can do so much.” — Helen Keller

```

