const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
app.set("port", process.env.PORT || 3000)

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const studEmail = req.query.email;
    const studPassword = req.query.password;
  
    try {
      // Query the database for a user with the provided email
        const user = await knex('Students').select('*').where('StudEmail', studEmail).first();
        console.log("this is an email", studEmail)
        console.log("this is an pass", studPassword)
        console.log("this is an user", user);
      // Check if a user with the provided email was found
        if (user) {
            const storedPassword = user.StudPassword;
  
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
let loggedCompanyIdentifier;
app.get('/coLogin', async (req, res) => {
    var coEmail = req.query.email;
    var coPassword = req.query.password;
  
    try {
      // Query the database for a user with the provided email
      var company = await knex('Companies').select('*').where('CompEmail', coEmail).first();
  
      // Check if a user with the provided email was found
      if (company) {
        var storedPassword = company.Password;
  
        // Check if the provided password matches the stored password
        if (coPassword === storedPassword) {
          // Passwords match, user is authenticated
          authenticatedCo = true;
          loggedCompanyIdentifier = await knex('Companies').select('CompanyID').where('CompEmail', coEmail).first();
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
            StudFirstName: req.body.fName,
            StudLastName: req.body.lName,
            Linkedin: req.body.linkedin,
            Github: req.body.github,
            StudDescription: req.body.desc,
            StudSchool: req.body.school,
            StudPhone: req.body.phone,
            StudEmail: req.body.email,
            StudPassword: req.body.password
        };

        // then she inserts the survey into the database
        const insertedStud = await knex("Students").insert(studData).returning("*");

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
            CompName: req.body.coName,
            CompDescription: req.body.desc,
            CompPhone: req.body.phone,
            CompEmail: req.body.email,
            Password: req.body.password
        };

        // then she inserts the survey into the database
        const insertedCo = await knex("Companies").insert(coData).returning("*");

        // Log the inserted survey data to make sure that it is right
        console.log("DB updated successfully:", insertedCo);

        res.redirect('companylogin')

    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  })
  
  // Close the knex when the application is shutting down
  process.on('SIGINT', () => {
    knex.destroy();
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
    if (authenticatedStud == true) {
        knex.select('*').from('Jobs').innerJoin('Companies', 'Jobs.CompanyID', 'Companies.CompanyID')
        .where('Jobs.Completed', false).then(jobs => {
            res.render("companyview1", { jobs: jobs });
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        res.redirect('studentlogin');
    }
});



// route to company view
app.get('/companyview1', async (req, res) => {
    if (authenticatedCo == true) {
        await knex.select('*').from('Students').then(Student => {
            res.render("companyview1", { students: Student });
            res.redirect('studentlogin');
        });
    } else {
        res.redirect('companylogin');
    }
});

// route to company view 2 (work listed)
app.get('/companyview2', (req, res) => {
    if (authenticatedCo == true) {
        console.log(loggedCompanyIdentifier);
        knex.select('*').from('Jobs').where('CompanyId', loggedCompanyIdentifier).then(Jobs => {
            console.log("I work", Jobs);
            res.render("companyview1", { jobs: Jobs });
    }) 
    }else{
        res.redirect('companylogin')}
})

app.listen(app.get("port"), () => {
    console.log(`Server started on port ${app.get("port")}`);
});

//for companies to add additional listings
// company registration
app.post('/postListing', async (req, res) => {
    try {
        const listData = {
            JobName: req.body.JobName,
            JobDescription: req.body.JobDescription,
            Deadline: req.body.Deadline,
            Completed: req.body.Completed,
            CompanyID: req.body.CompanyID
        };

        // then she inserts the survey into the database
        const insertedJob = await knex("Jobs").insert(listData).returning("*");

        // Log the inserted survey data to make sure that it is right
        console.log("DB updated successfully:", insertedJob);

        res.redirect('companyview2')

    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  })

  app.get('/logout', (req, res) => {
    authenticatedCo = false;
    authenticatedStud = false;
    res.redirect('/');
  });