# Team-Bravo-Profile-Card-Auth

This is the backend API for the Tenyne authentication and user profile system. It supports user registration, OTP email verification, login with "Remember Me", password reset, and profile management including avatar uploads.

## 📦 Tech Stack

- **Node.js**
- **Express**
- **PostgreSQL** (via Neon or local)
- **JWT**
- **Nodemailer (Amazon SES)**
- **bcrypt**
- **multer** (for file uploads)

---

## 🔧 Setup Instructions

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

Create a `.env` file in the root:

```env
PORT=3000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
SMTP_HOST=email-smtp.eu-north-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_ADMIN_EMAIL=admin@tenyne.com
SMTP_SENDER_NAME=Tenyne

ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
```

### 4. Create Database Tables

Run schema files (e.g., via psql):

```sql
-- userSchema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  verify_otp VARCHAR(255) DEFAULT '',
  verify_otp_expire_at BIGINT DEFAULT 0,
  is_account_verified BOOLEAN DEFAULT FALSE,
  reset_otp VARCHAR(255) DEFAULT '',
  reset_otp_expire_at BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- profileSchema
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  github VARCHAR(255),
  bio TEXT,
  skills TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- otpSchema
CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Run the Server

```bash
npm run dev
```

---

## 🧪 API Endpoints

### Auth
| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| `POST` | `/api/auth/register`       | Register new user (sends OTP)      |
| `POST` | `/api/auth/verify-otp`     | Verify OTP and activate user       |
| `POST` | `/api/auth/resend-otp`     | Resend OTP if expired              |
| `POST` | `/api/auth/login`          | Log user in (supports Remember Me) |
| `POST` | `/api/auth/reset-password` | Send reset OTP to email            |
| `POST` | `/api/auth/confirm-reset`  | Confirm new password with OTP      |

### Profile
| Method   | Endpoint              | Description                                              |
|----------|-----------------------|----------------------------------------------------------|
| `GET`    | `/api/profile`        | Get logged-in user’s profile                             |
| `POST`   | `/api/profile/create` | Create profile info & avatar (via `multipart/form-data`) |
| `Delete` | `/api/profile/delete` | Update profile info & avatar (via `multipart/form-data`) |
| `PUT`    | `/api/profile/update` | Update profile info & avatar (via `multipart/form-data`) |

---

## 🖼 Avatar Upload

- Uploads handled via `multer`
- Avatars stored as base64 string or path in DB (`avatar_url`)
