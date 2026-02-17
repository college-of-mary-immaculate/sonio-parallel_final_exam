For Docker set up with master and 2 slave set up.

db.bootstrap:
    * Used only in the initialization

db.master:
    * master pool connection

db.slave:
    * slave pool connection

Provider:
container.js:
    * Provides the database connection for all
    * Ensures cleaner set up 
    * No messy require/imports
