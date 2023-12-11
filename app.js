const express = require('express');
const app = express();
const path = require('path');

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
const { Pool } = require('pg');

app.get('/', (req, res) => {
    res.render('index')
})

const pool = new Pool({
    user: process.env.DB_USERNAME || 'ebroot',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'ebdb',
    password: process.env.DB_PASSWORD || 'ChickenJoe03',
    port: process.env.RDS_PORT || 5432,
  });

let authenticatedCo = false;
let authenticadedStud = false;

//Route to student Login page
app.get('/studentlogin', (req, res) => {
    if (authenticatedCo == false && authenticatedStud == false){
        res.render('studentlogin')
    } else if (authenticatedCo == false && authenticatedStud == true){
        res.redirect('studview')
    } else if (authenticatedCo == true && authenticatedStud == false){
        res.redirect('companyview1')
    }
})

//Route to company login page
app.get('/companylogin', (req, res) => {
    if (authenticatedCo == false && authenticatedStud == false){
        res.render('companylogin')
    } else if (authenticatedCo == false && authenticatedStud == true){
        res.redirect('studview')
    } else if (authenticatedCo == true && authenticatedStud == false){
        res.redirect('companyview1')
    }
})

//when login is attempted by user
app.get('/studlogin', async (req, res) => {
    const userEmail = req.query.email; // Assuming email is sent as a query parameter
    const userPassword = req.query.password; // Assuming password is sent as a query parameter
  
    try {
      // Query the database for a user with the provided email
      const query = 'SELECT * FROM Students WHERE email = $1';
      const { rows } = await pool.query(query, [userEmail]);
  
      // Check if a user with the provided email was found
      if (rows.length > 0) {
        const storedPassword = rows[0].Password;
  
        // Check if the provided password matches the stored password
        if (userPassword === storedPassword) {
          // Passwords match, user is authenticated
          authenticadedStud = true;
          res.render('studview');
        } else {
          // Passwords do not match
          res.status(401).send('Unauthorized');
        }
      } else {
        // No user with the provided email found
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  //when login is attempted by company
app.get('/coLogin', async (req, res) => {
    const coEmail = req.query.email; // Assuming email is sent as a query parameter
    const coPassword = req.query.password; // Assuming password is sent as a query parameter
  
    try {
      // Query the database for a user with the provided email
      const query = 'SELECT * FROM Company WHERE email = $1';
      const { rows } = await pool.query(query, [coEmail]);
  
      // Check if a user with the provided email was found
      if (rows.length > 0) {
        const storedPassword = rows[0].Password;
  
        // Check if the provided password matches the stored password
        if (coPassword === storedPassword) {
          // Passwords match, user is authenticated
          authenticadedCo = true;
          res.render('companyview1');
        } else {
          // Passwords do not match
          res.status(401).send('Unauthorized');
        }
      } else {
        // No user with the provided email found
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  // Close the pool when the application is shutting down
  process.on('SIGINT', () => {
    pool.end();
    process.exit();
  });


  //route to student registration page
app.get('/studentreg', (req, res) => {
    if (authenticatedCo == false && authenticatedStud == false){
        res.render('studentreg')
    } else if (authenticatedCo == false && authenticatedStud == true){
        res.redirect('studview')
    } else if (authenticatedCo == true && authenticatedStud == false){
        res.redirect('companyview1')
    }
})


//route to company registration page
app.get('/companyreg', (req, res) => {
    if (authenticatedCo == false && authenticatedStud == false){
        res.render('companyreg')
    } else if (authenticatedCo == false && authenticatedStud == true){
        res.redirect('studview')
    } else if (authenticatedCo == true && authenticatedStud == false){
        res.redirect('companyview1')
    }
})

//route to student view
app.get('/studview', (req, res) => {
    if (authenticadedStud == true){
        res.render('studview')
    } else (res.redirect('studentlogin'))
})

// route to company view
app.get('/companyview1', (req, res) => {
    if (authenticadedCo == true){
        res.render('companyview1')
    } else (res.redirect('companylogin'))
})

// route to company view 2 (work listed)
app.get('/companyview2', (req, res) => {
    if (authenticadedCo == true){
        res.render('companyview2')
    } else (res.redirect('companylogin'))
})

app.listen(app.get("port"), () => {
    console.log(`Server started on port ${app.get("port")}`);
});

// Knex database connection
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "postgres",
        user: process.env.RDS_USERNAME || "ebroot",
        password: process.env.RDS_PASSWORD || "ChickenJoe03!",
        database: process.env.RDS_DB_NAME || "ebdb",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    }
});