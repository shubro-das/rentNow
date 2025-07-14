const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

//middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: '01788541577', // Change this to a random and secure key
    resave: false,
    saveUninitialized: true,
  })
);

// Configure MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '01788541577',
  database: 'rent_bd'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database!');
  }
});

// Set up routes
//home page

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
})

// Fetch SEARCH results here only


app.post('/', (req, res) => {
  const location = req.body.location;
  const property_type = req.body.property_type;
  console.log(req.body);
  const query = `
    SELECT 
      form.location,
      form.property_type,
      form.room,
      form.washroom,
      form.balcony,
      form.gas_supply,
      sign_up.name,
      sign_up.mobile
    FROM form JOIN sign_up
    ON form.id = sign_up.id AND location = ? AND property_type = ?
  `;
  connection.query(query, [location,property_type], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
      return;
    }

    // Render the HTML page and pass the fetched records
    res.render('search', { records: results });
  });
});


//login page

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {

  const mobile = req.body.mobile;
  const password = req.body.password;
  console.log(req.body);

  // Check form data validity form the database
  const query = `SELECT id FROM sign_up WHERE mobile = ? AND password = ?`;
  connection.query(query, [mobile, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
      return;
    }

    if (results.length === 1) {
      // Authentication successful
      const userId = results[0].id;
      req.session.userId = userId; // Store the user ID in the session
      res.redirect('/form'); // Redirect to the user form page
    } else {
      // Authentication failed
      res.status(401).send('Invalid credentials.');
    }
  });
});

//form page
app.get('/form', (req, res) => {
  // Check if the user is logged in
  if (!req.session.userId) {
    res.redirect('/login'); // Redirect to the login page if not logged in
    return;
  }

  // Fetch user data based on req.session.userId and populate the form
  // You can retrieve user-specific data from the database here

  // Render the user form (replace this with your actual HTML form)
  res.sendFile(__dirname + '/form.html');
});


app.post('/form', (req, res) => {
  const id = req.session.userId;
  const location = req.body.location;
  const property_type = req.body.property_type;
  const room = req.body.room;
  const washroom = req.body.washroom;
  const balcony = req.body.balcony;
  const gas_supply = req.body.gas_supply;
  console.log(req.body);

  // Insert form data into the database
  const query = 'INSERT INTO form(id, location, property_type, room, washroom, balcony,gas_supply) VALUES (?,?,?,?,?,?,?)';
  connection.query(query, [id, location, property_type, room, washroom, balcony,gas_supply], (err, rows) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.sendStatus(500);
    } else {
      console.log('Data inserted successfully!');
      res.redirect('/');
    }
  });
})

//signup page

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

app.post('/signup', (req, res) => {
  const name = req.body.name;
  const address = req.body.address;
  const nid = req.body.nid;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const password = req.body.password;
  console.log(req.body);

  // Insert form data into the database
  const query = 'INSERT INTO sign_up (name,address,nid,email,mobile,password) VALUES (?,?,?,?,?,?)';
  connection.query(query, [name, address, nid, email, mobile, password], (err, rows) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.sendStatus(500);
    } else {
      console.log('Data inserted successfully!');
      res.redirect('/');
    }
  });
});




// Fetch ALL records from the database


app.get('/all', (req, res) => {
  const query = `
    SELECT 
      form.location,
      form.property_type,
      form.room,
      form.washroom,
      form.balcony,
      form.gas_supply,
      sign_up.name,
      sign_up.mobile
    FROM form JOIN sign_up
    ON form.id = sign_up.id
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
      return;
    }

    // Render the HTML page and pass the fetched records
    res.render('records', { records: results });
  });
});

// Set up the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
