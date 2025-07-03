Event Manager - Setup Instructions
-----------------------------------

Default Organiser Password:
---------------------------
admin123

Installation Steps:
-------------------
1. Make sure Node.js and npm are installed.
   You can verify with:
     node -v
     npm -v

2. Install all required packages:
     npm install

3. Clean and rebuild the database:
     npm run clean-db
     npm run build-db

4. Start the server:
     npm start

5. Open the app in your browser:
     http://localhost:3000/organiser

Login using the default password: admin123


Available npm scripts in package.json:
--------------------------------------
"clean-db"   - Deletes the existing database (database.db)
"build-db"   - Builds a new database using db_schema.sql
"start"      - Starts the server on port 3000


Requirements:
-------------
- Node.js (v14+ recommended)
- SQLite3 (should be installed on your system)
