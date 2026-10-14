# Travlr Getaways

## Getting everything running

You will need Node.js, npm, and MongoDB installed first.

Install the project packages from the main project folder:

```bash
npm install
```

Then install the packages for the Angular admin app:

```bash
cd app_admin
npm install
cd ..
```

### Start MongoDB

Start MongoDB directly in its own terminal:

```bash
mongod --config /usr/local/etc/mongod.conf
```

Leave that terminal running while you use the app. Seeing MongoDB log messages is normal—do not press `Ctrl+C`, since that shuts it down. MongoDB should be available at `mongodb://127.0.0.1:27017`.

### Set up the app

1. Make a local `.env` file from the example and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   The `.env` file is ignored by Git, so your JWT secret and admin password stay local.
2. Create the admin account:

   ```bash
   npm run seed:admin
   ```

   You can safely run this more than once. If that email already exists, it leaves the existing account alone.

   If you ever need to change the seeded admin password, update `ADMIN_PASSWORD` in `.env` and run:

   ```bash
   npm run reset:admin
   ```
3. Start the API:

   ```bash
   npm start
   ```

4. In another terminal, start the admin app:

   ```bash
   cd app_admin
   npm start
   ```

Log in at `http://localhost:4200/login` using the admin email and password from `.env`.

The main site/API runs at `http://localhost:3000`, and the admin site runs at `http://localhost:4200`.

Trips can still be viewed without logging in. The admin-only stuff—adding, editing, deleting, uploading images, and reading messages—needs a valid admin token.

`POST /api/register` is still available for the course exercise, but it only creates regular users. It cannot be used to create an admin account.

## Quick test

With MongoDB running, use this to check the authentication flow:

```bash
npm run test:auth
```

It uses a temporary database and removes it when it is done.
