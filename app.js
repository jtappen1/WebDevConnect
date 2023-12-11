const express = require('express');
const app = express();
const path = require('path');

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/studentlogin', (req, res) => {
    res.render('studentlogin')
})

app.get('/companylogin', (req, res) => {
    res.render('companylogin')
})

app.get('/studentreg', (req, res) => {
    res.render('studentreg')
})

app.get('/companyreg', (req, res) => {
    res.render('companyreg')
})

app.get('/studview', (req, res) => {
    res.render('studview')
})

app.get('/companyview1', (req, res) => {
    res.render('companyview1')
})

app.get('/companyview2', (req, res) => {
    res.render('companyview2')
})

app.listen(app.get("port"), () => {
    console.log(`Server started on port ${app.get("port")}`);
});

// Knex database connection
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "password",
        database: process.env.RDS_DB_NAME || "WebDevDB",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    }
});