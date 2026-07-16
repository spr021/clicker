# Authentication System Documentation

## Overview

A complete authentication system has been implemented for the Clicker Game using Next.js 16.2.9 App Router with the following features:

- **User Registration (Signup)**
- **User Login**
- **Session Management** (JWT-based stateless sessions)
- **Protected Routes** (Game page requires authentication)
- **Secure Password Hashing** (using bcrypt)

## File Structure

```
app/
├── actions/
│   └── auth.ts              # Server actions for signup, login, logout
├── game/
│   └── page.tsx            # Protected game page
├── login/
│   └── page.tsx            # Login page
├── signup/
│   └── page.tsx            # Signup page
└── page.tsx                # Home page (redirects based on auth status)

lib/
├── db.ts                   # In-memory database (replace with real DB)
├── definitions.ts          # TypeScript types and Zod schemas
└── session.ts              # Session management (JWT encrypt/decrypt)

.env.local                  # Environment variables (not in git)
```

## Features

### 1. User Registration
- **Route:** `/signup`
- **Validation:**
  - Username: 3-20 characters, alphanumeric and underscores only
  - Password: Minimum 6 characters
- **Process:**
  1. Validates form inputs using Zod
  2. Checks if username already exists
  3. Hashes password with bcrypt (10 rounds)
  4. Stores user in database
  5. Creates session and redirects to game

### 2. User Login
- **Route:** `/login`
- **Process:**
  1. Validates credentials
  2. Verifies username exists
  3. Compares password with hashed password
  4. Creates session and redirects to game

### 3. Session Management
- **Type:** Stateless JWT sessions stored in HTTP-only cookies
- **Duration:** 7 days
- **Security:**
  - HttpOnly: Prevents client-side JavaScript access
  - Secure: Uses HTTPS in production
  - SameSite: 'lax' for CSRF protection
- **Storage:** Cookie named 'session'

### 4. Protected Routes
- **Game page** (`/game`) checks for valid session
- Redirects to `/login` if not authenticated
- Home page (`/`) redirects to `/game` if already authenticated

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Generate a secure secret key:
# openssl rand -base64 32
SESSION_SECRET=your-secret-key-here
```

**Important:** Never commit `.env.local` to version control!

## Database

Currently using **in-memory storage** (stored in `lib/db.ts`). 

### Migrating to a Real Database

To use a real database (PostgreSQL, MongoDB, etc.):

1. Install database client:
   ```bash
   npm install pg  # for PostgreSQL
   # or
   npm install mongodb  # for MongoDB
   ```

2. Update `lib/db.ts` to connect to your database
3. Create a users table/collection with fields:
   - `id` (string/UUID)
   - `username` (string, unique)
   - `password` (string, hashed)

Example PostgreSQL schema:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

### Current Implementation
✅ Passwords hashed with bcrypt  
✅ HTTP-only cookies prevent XSS  
✅ Input validation with Zod  
✅ Server-side authentication  
✅ Session encryption with JWT  

### Production Recommendations
- [ ] Use a real database instead of in-memory storage
- [ ] Generate strong SESSION_SECRET: `openssl rand -base64 32`
- [ ] Enable HTTPS in production
- [ ] Add rate limiting for login attempts
- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Consider using an auth library (NextAuth.js, Clerk, Auth0)
- [ ] Add CSRF tokens for additional protection
- [ ] Implement refresh tokens for longer sessions

## API Reference

### Server Actions

#### `signup(state, formData)`
Creates a new user account.
- **Location:** `app/actions/auth.ts`
- **Parameters:** FormData with username and password
- **Returns:** FormState with errors or success

#### `login(state, formData)`
Authenticates a user.
- **Location:** `app/actions/auth.ts`
- **Parameters:** FormData with username and password
- **Returns:** FormState with errors or success

#### `logout()`
Logs out the current user.
- **Location:** `app/actions/auth.ts`
- **Returns:** Redirects to `/login`

### Session Functions

#### `createSession(userId, username)`
Creates a new session cookie.
- **Location:** `lib/session.ts`

#### `getSession()`
Retrieves the current session.
- **Location:** `lib/session.ts`
- **Returns:** SessionPayload or null

#### `deleteSession()`
Deletes the current session cookie.
- **Location:** `lib/session.ts`

## Testing the System

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit** `http://localhost:3000`

3. **Create an account:**
   - Click "Get Started"
   - Enter a username (3-20 chars)
   - Enter a password (6+ chars)
   - Click "Sign up"

4. **Login:**
   - Go to `/login`
   - Enter your credentials
   - You'll be redirected to `/game`

5. **Logout:**
   - Click the "Logout" button in the game header
   - You'll be redirected to `/login`

## Next Steps

Now that authentication is complete, you can:

1. **Build your game logic** in `app/game/page.tsx`
2. **Add game state persistence** (save scores to database)
3. **Create leaderboards** (compare scores between users)
4. **Add multiplayer features**
5. **Implement achievements/badges**
6. **Add user profiles**

## Dependencies

The authentication system uses:
- `jose` - JWT encryption/decryption
- `bcryptjs` - Password hashing
- `zod` - Form validation
- `server-only` - Ensures session code runs server-side only

## Troubleshooting

### Session not persisting
- Check that SESSION_SECRET is set in `.env.local`
- Verify cookies are enabled in your browser
- Check browser console for cookie errors

### "Username already exists"
- Usernames must be unique
- Try a different username
- Note: In-memory DB resets on server restart

### Build errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`

## Support

For issues or questions about the authentication system, check:
- Next.js Authentication Guide: `/node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- This project's code comments
