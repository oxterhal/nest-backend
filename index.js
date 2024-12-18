const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 4000;

// Middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());

// MySQL Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bat_thugs",
  database: "e_commerse",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Get routes
app.get("/users", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).send("Error fetching users");
    } else {
      res.json(results);
    }
  });
});

app.get("/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).send("Error fetching products");
    } else {
      res.json(results);
    }
  });
});

app.get("/orders", (req, res) => {
  const query = "SELECT * FROM Orders";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      res.status(500).send("Error fetching orders");
    } else {
      res.json(results);
    }
  });
});

app.get("/reviews", (req, res) => {
  const query = "SELECT * FROM Reviews";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reviews:", err);
      res.status(500).send("Error fetching reviews");
    } else {
      res.json(results);
    }
  });
});

// Create routes
app.post("/createUsers", (req, res) => {
  const { name, email, password } = req.body;
  const query =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error("Error creating user:", err);
      res.status(500).send("Error creating user");
    } else {
      res.status(201).json({ id: result.insertId, name, email });
    }
  });
});

app.post("/createProducts", (req, res) => {
  const { product_name, description, price, stock } = req.body;
  const query =
    "INSERT INTO products (product_name, description, price, stock) VALUES (?, ?, ?, ?)";
  db.query(query, [product_name, description, price, stock], (err, result) => {
    if (err) {
      console.error("Error creating product:", err);
      res.status(500).send("Error creating product");
    } else {
      res.status(201).json({ id: result.insertId, product_name, description });
    }
  });
});

app.post("/createOrders", (req, res) => {
  const { user_id, total_amount, status } = req.body;
  const order_date = new Date().toISOString().slice(0, 19).replace("T", " ");

  const query =
    "INSERT INTO Orders (user_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [user_id, order_date, total_amount, status],
    (err, result) => {
      if (err) {
        console.error("Error creating order:", err);
        res.status(500).send("Error creating order");
      } else {
        res.status(201).json({
          id: result.insertId,
          user_id,
          total_amount,
          status,
          order_date,
        });
      }
    }
  );
});

app.post("/createReviews", (req, res) => {
  const { user_id, product_id, rating, review_text } = req.body;
  const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");

  // First, check if the product exists
  const checkProductQuery = "SELECT * FROM products WHERE product_id = ?";

  db.query(checkProductQuery, [product_id], (checkErr, products) => {
    if (checkErr) {
      console.error("Error checking product:", checkErr);
      return res.status(500).send("Error checking product");
    }

    // If no product found
    if (products.length === 0) {
      return res.status(400).json({
        error: "Invalid Product",
        message: `Product with ID ${product_id} does not exist`,
      });
    }

    // If product exists, proceed with review insertion
    const query =
      "INSERT INTO Reviews (user_id, product_id, rating, review_text, created_at) VALUES (?, ?, ?, ?, ?)";

    db.query(
      query,
      [user_id, product_id, rating, review_text, created_at],
      (err, result) => {
        if (err) {
          console.error("Error creating review:", err);
          return res.status(500).send("Error creating review");
        }

        res.status(201).json({
          id: result.insertId,
          user_id,
          product_id,
          rating,
          review_text,
          created_at,
        });
      }
    );
  });
});

// Update routes
app.put("/updateUser/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;

  const query =
    "UPDATE users SET username = ?, email = ?, password = ? WHERE user_id = ?";

  db.query(query, [name, email, password, userId], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).send("Error updating user");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      userId: userId,
      updatedFields: { name, email },
    });
  });
});

app.put("/updateProduct/:id", (req, res) => {
  const productId = req.params.id;
  const { product_name, description, price, stock } = req.body;

  const query =
    "UPDATE products SET product_name = ?, description = ?, price = ?, stock = ? WHERE product_id = ?";

  db.query(
    query,
    [product_name, description, price, stock, productId],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).send("Error updating product");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({
        message: "Product updated successfully",
        productId: productId,
        updatedFields: { product_name, description, price, stock },
      });
    }
  );
});

app.put("/updateOrder/:id", (req, res) => {
  const orderId = req.params.id;
  const { user_id, total_amount, status } = req.body;

  const query =
    "UPDATE Orders SET user_id = ?, total_amount = ?, status = ? WHERE order_id = ?";

  db.query(query, [user_id, total_amount, status, orderId], (err, result) => {
    if (err) {
      console.error("Error updating order:", err);
      return res.status(500).send("Error updating order");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order updated successfully",
      orderId: orderId,
      updatedFields: { user_id, total_amount, status },
    });
  });
});

app.put("/updateReview/:id", (req, res) => {
  const reviewId = req.params.id;
  const { product_id, rating, review_text } = req.body;

  const query =
    "UPDATE Reviews SET product_id = ?, rating = ?, review_text = ? WHERE review_id = ?";

  db.query(
    query,
    [product_id, rating, review_text, reviewId],
    (err, result) => {
      if (err) {
        console.error("Error updating review:", err);
        return res.status(500).send("Error updating review");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json({
        message: "Review updated successfully",
        reviewId: reviewId,
        updatedFields: { product_id, rating, review_text },
      });
    }
  );
});

// Delete routes
app.delete("/deleteUser/:id", (req, res) => {
  const userId = req.params.id;

  const query = "DELETE FROM users WHERE user_id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).send("Error deleting user");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      userId: userId,
    });
  });
});

app.delete("/deleteProduct/:id", (req, res) => {
  const productId = req.params.id;

  const query = "DELETE FROM products WHERE product_id = ?";

  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).send("Error deleting product");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      productId: productId,
    });
  });
});

app.delete("/deleteOrder/:id", (req, res) => {
  const orderId = req.params.id;

  const query = "DELETE FROM Orders WHERE order_id = ?";

  db.query(query, [orderId], (err, result) => {
    if (err) {
      console.error("Error deleting order:", err);
      return res.status(500).send("Error deleting order");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
      orderId: orderId,
    });
  });
});

app.delete("/deleteReview/:id", (req, res) => {
  const reviewId = req.params.id;

  const query = "DELETE FROM Reviews WHERE review_id = ?";

  db.query(query, [reviewId], (err, result) => {
    if (err) {
      console.error("Error deleting review:", err);
      return res.status(500).send("Error deleting review");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      message: "Review deleted successfully",
      reviewId: reviewId,
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
