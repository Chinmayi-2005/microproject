const express=require("express");
const mysql=require("mysql2");
const bodyParser=require("body-parser");
const cors=require("cors");
const path=require("path");

const app=express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"public")));

const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Admin@123",
    database:"anichh"
});
db.connect(err=>{
    if(err) throw err;
    console.log("mysql connected successfully")
});

app.post("/signup",(req,res)=>{
    const {username,email}=req.body;
    if(!username || !email) {
        return res.status(400).send('username and email are required');
    }

    const query = "INSERT INTO user(username,email) VALUES (?,?)";
    db.query(query, [username, email], (err, results) => {
        if(err) {
            console.error('DB error during /signup:', err);
            // send back the error message to help debugging (remove in production)
            return res.status(500).send('error saving user: ' + err.message);
        }
        res.send("Signup successful");
    });
});


app.post("/login",(req,res)=>{
    const {username,email}=req.body;
    if(!username || !email) {
        return res.status(400).json({success:false, message:'username and email are required'});
    }
    const query="SELECT * FROM user WHERE username=? AND email=?";
    db.query(query,[username,email],(err,results)=>{
        if(err) {
            console.error('DB error during /login:', err);
            return res.status(500).json({success:false, message:'error during login: ' + err.message});
        }
        if(results.length>0){
            res.json({success:true});
        }   
        else{
            res.json({success:false});
        }
    });
});


// Debug endpoint: check DB connectivity and whether `users` table exists
app.get('/db-check', (req, res) => {
    db.query("SHOW TABLES LIKE 'user'", (err, results) => {
        if (err) {
            console.error('DB error during /db-check:', err);
            return res.status(500).json({ ok: false, error: err.message });
        }

        if (!results || results.length === 0) {
            return res.json({ ok: false, tableExists: false, message: 'users table not found' });
        }

        // Table exists — return a row count
        db.query('SELECT COUNT(*) AS count FROM user', (err2, rows) => {
            if (err2) {
                console.error('DB error when counting users:', err2);
                return res.status(500).json({ ok: false, error: err2.message });
            }
            return res.json({ ok: true, tableExists: true, count: rows[0].count });
        });
    });
});
app.get("/products",(req,res)=>{
    const query=req.query.search||"";
    const sql="SELECT * FROM product WHERE name LIKE ? OR brand LIKE ?";
    db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
        if(err) {
            console.error('DB error during /products:', err);
            return res.status(500).json({error:'error fetching products: ' + err.message});
        }
        res.json(results);
    }   );    
});

app.post("/order_s",(req,res)=>{
   const {orderid, productid, productName, productBrand, productPrice, userid } = req.body;

  const query =
    "INSERT INTO order_s (orderid,productid, name, brand, price, userid) VALUES (?,?,?,?,?,?)";

     db.query(query, [orderid,productid, productName, productBrand, productPrice, userid], (err, results) => {
         if(err) {
             console.error('DB error during /order:', err);
             return res.status(500).send('error placing order: ' + err.message);
         }
         res.send("Order placed successfully"); 
        });        
});

// ------------------------------
// PRODUCT SEARCH API
// ------------------------------
app.get("/search", (req, res) => {
  const query = req.query.query || "";

  const sql = "SELECT * FROM product WHERE name LIKE ? OR brand LIKE ?";
  db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
    if (err) {
      console.error("DB error during /search:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});



const PORT=4000;
app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`));
