const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
app.set("port", process.env.PORT || 3000)

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
const { Pool } = require('pg');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Knex database connection
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "ebroot",
        password: process.env.RDS_PASSWORD || "ChickenJoe03!",
        database: process.env.RDS_DB_NAME || "ebdb",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    }
});

app.get('/', (req, res) => {
    res.render('index')
})

//use these variables for page redirection
let authenticatedCo = false;
let authenticatedStud = false;

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
    const studEmail = req.body.email;
    const studPassword = req.body.password;
  
    try {
      // Query the database for a user with the provided email
      // Query the database for a user with the provided email
        const user = await knex('Students').where('email', studEmail).select('*').first();
  
      // Check if a user with the provided email was found
        if (user) {
            const storedPassword = user.Password;
  
        // Check if the provided password matches the stored password
        if (studPassword === storedPassword) {
            // Passwords match, user is authenticated
            authenticatedStud = true;
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
    const coEmail = req.body.email;
    const coPassword = req.body.password;
  
    try {
      // Query the database for a user with the provided email
      const company = await knex('Students').where('email', coEmail).select('*').first();
  
      // Check if a user with the provided email was found
      if (company) {
        const storedPassword = company.Password;
  
        // Check if the provided password matches the stored password
        if (coPassword === storedPassword) {
          // Passwords match, user is authenticated
          authenticatedCo = true;
          res.render('companyview1');
        } else {
          // Passwords do not match
          res.status(401).send('Unauthorized');
        }
      } else {
        // No user with the provided email found
        res.status(404).send('Company not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
// student registration
  app.post('/studReg', async (req, res) => {
    try {
        const studData = {
            studFirst: req.body.fName,
            studLast: req.body.lName,
            linkedIn: req.body.linkedin,
            github: req.body.github,
            description: req.body.desc,
            school: req.body.school,
            phoneNum: req.body.phone,
            emaill: req.body.email,
            password: req.body.password
        };

        // then she inserts the survey into the database
        const insertedStud = await knex("Student").insert(studData).returning("*");

        // Log the inserted survey data to make sure that it is right
        console.log("DB updated successfully:", insertedStud);
        res.redirect('studentlogin')


    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  })

  // company registration
  app.post('/coReg', async (req, res) => {
    try {
        const coData = {
            coName: req.body.coName,
            desc: req.body.desc,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password
        };

        // then she inserts the survey into the database
        const insertedCo = await knex("Company").insert(coData).returning("*");

        // Log the inserted survey data to make sure that it is right
        console.log("DB updated successfully:", insertedCo);

        res.redirect('companylogin')

    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  })
  
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
    if (authenticadedStud == true) {
        knex('Jobs')
            .select('*')
            .innerJoin('Companies', 'Jobs.CompanyID', 'Companies.CompanyID')
            .where('Jobs.Completed', false)
            .then(result => {
                console.log(result);
                res.render('studview', { jobs: result });
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        res.redirect('studentlogin');
    }
});


// route to company view
app.get('/companyview1', (req, res) => {
    if (authenticadedCo == true) {
        select('*').from('Student').then(Student => {
            console.log("I work", Student);
            res.render("companyview1", { students: Student });
        });
    } else {
        res.redirect('companylogin');
    }
});

// route to company view 2 (work listed)
app.get('/companyview2', (req, res) => {
    if (authenticadedCo == true){
        res.render('companyview2')
    } else {res.redirect('companylogin')}
})

app.listen(app.get("port"), () => {
    console.log(`Server started on port ${app.get("port")}`);
});