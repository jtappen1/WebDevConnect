const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});