import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";


import fs from "fs";
import path from "path";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log(`✅ Connected to MySQL database (${process.env.DB_NAME})`);
  }
});

// =====================================================
// ✅ LOGIN ROUTE
// =====================================================
app.post("/login", (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ error: "Email is required" });

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "No user found with that email" });

    const user = results[0];
    console.log(`✅ User login: ${user.email} (${user.role})`);
    return res.status(200).json(user);
  });
});

// =====================================================
// ✅ CLIENT SIGNUP
// =====================================================
app.post("/signup-client", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ error: "Name and email are required" });

  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0)
      return res.status(400).json({ error: "User with this email already exists" });

    const insertUser = "INSERT INTO users (name, email, role) VALUES (?, ?, 'client')";
    db.query(insertUser, [name, email], (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to insert into users" });

      const userId = result.insertId;
      const insertClient = "INSERT INTO clients (user_id) VALUES (?)";

      db.query(insertClient, [userId], (err2) => {
        if (err2) return res.status(500).json({ error: "Failed to insert into clients" });

        console.log(`✅ Client created with user_id=${userId}`);
        return res.status(200).json({
          message: "Client registered successfully",
          user_id: userId,
          name,
          email,
          role: "client",
        });
      });
    });
  });
});

// =====================================================
// ✅ FREELANCER SIGNUP
// =====================================================
app.post("/signup-freelancer", (req, res) => {
  const { name, email, occupation, skills, education, phone, description } = req.body;

  if (!name || !email || !occupation || !skills || !education || !phone || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0)
      return res.status(400).json({ error: "User with this email already exists" });

    const insertUser = "INSERT INTO users (name, email, role) VALUES (?, ?, 'freelancer')";
    db.query(insertUser, [name, email], (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to insert into users" });

      const userId = result.insertId;
      const insertFreelancer = `
        INSERT INTO freelancers 
        (user_id, occupation, skills, education, phone, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertFreelancer,
        [userId, occupation, skills, education, phone, description],
        (err2) => {
          if (err2)
            return res.status(500).json({ error: "Failed to insert into freelancers" });

          console.log(`✅ Freelancer created with user_id=${userId}`);
          return res.status(200).json({
            message: "Freelancer registered successfully",
            user_id: userId,
            name,
            email,
            role: "freelancer",
          });
        }
      );
    });
  });
});

// =====================================================
// ✅ GET FREELANCER PROFILE BY EMAIL
// =====================================================
app.get("/freelancer-profile", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  console.log("📩 GET /freelancer-profile called with:", email);

  // Include aggregated rating and most recent review (stars + date) if present
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      f.occupation,
      f.skills,
      f.education,
      f.phone,
      f.description,
      f.created_at,
      -- use stored function to compute average rating centrally
      get_average_rating(u.id) AS avg_rating,
      (
        SELECT stars FROM reviews rr WHERE rr.freelancerID = u.id ORDER BY rr.createdAt DESC LIMIT 1
      ) AS last_review_stars,
      (
        SELECT createdAt FROM reviews rr WHERE rr.freelancerID = u.id ORDER BY rr.createdAt DESC LIMIT 1
      ) AS last_review_date
    FROM users u
    JOIN freelancers f ON u.id = f.user_id
    WHERE u.email = ?
    LIMIT 1;
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.warn(`⚠️ No freelancer found for ${email}`);
      return res.status(404).json({ error: "Freelancer not found" });
    }

    console.log(`✅ Freelancer profile fetched for ${email}`);
    return res.status(200).json(results[0]);
  });
});

// =====================================================
// ✅ GET ALL USERS (optional)
// =====================================================
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users ORDER BY created DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch users" });
    res.status(200).json(results);
  });
});





// =====================================================
// ✅ CREATE LISTING (Freelancer Only)
// =====================================================
// ✅ CREATE LISTING (Freelancer Only, now supports tags safely)
app.post("/create-listing", (req, res) => {
  const { user_id, title, description, selectedSkills, tags, price, duration, category } = req.body;

  // Validate inputs
  if (!user_id || !title || !description || !price || !duration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Convert arrays to comma-separated strings if needed
  const formattedSkills = Array.isArray(selectedSkills)
    ? selectedSkills.join(", ")
    : typeof selectedSkills === "string"
    ? selectedSkills
    : "";

  const formattedTags = Array.isArray(tags)
    ? tags.join(", ")
    : typeof tags === "string"
    ? tags
    : "";

  const query = `
    INSERT INTO listings (user_id, title, description, selectedSkills, tags, price, duration, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_id, title, description, formattedSkills, formattedTags, price, duration, category],
    (err, result) => {
      if (err) {
        console.error("❌ Error creating listing:", err);
        return res.status(500).json({ error: "Failed to create listing" });
      }

      console.log(`✅ New listing created (ID: ${result.insertId}) for user ${user_id}`);
      res.status(200).json({
        message: "Listing created successfully",
        listingID: result.insertId,
      });
    }
  );
});



// =====================================================
// ✅ DELETE LISTING USING STORED PROCEDURE
// =====================================================
app.delete("/listings-delete/:listingId", (req, res) => {
  const { listingId } = req.params;
  const { user_id } = req.query;

  if (!listingId || !user_id) {
    return res.status(400).json({ error: "Missing listingId or user_id" });
  }

  // Call the DeleteListing stored procedure
  db.query("CALL DeleteListing(?, ?)", [listingId, user_id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting listing:", err);
      return res.status(500).json({ error: "Server error while deleting listing" });
    }

    const deleteResult = result[0][0]; // Get the first row of the first result set
    
    if (!deleteResult || deleteResult.deleted_count === 0) {
      return res.status(404).json({ error: "Listing not found or unauthorized" });
    }

    console.log(`✅ Listing ${listingId} deleted by user ${user_id}`);
    res.status(200).json({
      success: true,
      message: "✅ Listing deleted successfully"
    });
  });
});

// =====================================================
// ✅ GET ALL LISTINGS FOR A SPECIFIC USER
// =====================================================
// =====================================================
// ✅ DELETE LISTING
// =====================================================
app.delete("/delete-listing/:listingId", (req, res) => {
  const { listingId } = req.params;
  const { user_id } = req.query;

  if (!listingId || !user_id) {
    return res.status(400).json({ error: "Missing listingId or user_id" });
  }

  // Call the DeleteListing stored procedure
  db.query("CALL DeleteListing(?, ?)", [listingId, user_id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting listing:", err);
      return res.status(500).json({ error: "Server error while deleting listing" });
    }

    const deleteResult = result[0][0]; // Get the first row of the first result set

    if (deleteResult.deleted_count === 0) {
      return res.status(404).json({ error: "Listing not found or unauthorized" });
    }

    console.log(`✅ Listing ${listingId} deleted by user ${user_id}`);
    res.status(200).json({
      success: true,
      message: "✅ Listing deleted successfully"
    });
  });
});

// =====================================================
// ✅ DELETE LISTING USING STORED PROCEDURE
// =====================================================
app.delete("/listings-delete/:listingId", (req, res) => {
  const { listingId } = req.params;
  const { user_id } = req.query;

  if (!listingId || !user_id) {
    return res.status(400).json({ error: "Missing listingId or user_id" });
  }

  // Call the DeleteListing stored procedure
  db.query("CALL DeleteListing(?, ?)", [listingId, user_id], (err, results) => {
    if (err) {
      console.error("❌ Error deleting listing:", err);
      return res.status(500).json({ error: "Server error while deleting listing" });
    }

    const result = results[0][0]; // Get the first row of the first result set

    if (result.deleted_count === 0) {
      return res.status(404).json({ error: "Listing not found or unauthorized" });
    }

    console.log(`✅ Listing ${listingId} deleted by user ${user_id}`);
    res.status(200).json({
      success: true,
      message: "✅ " + result.message
    });
  });
});

app.get("/listings", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const query = `
    SELECT listingID, title, description, selectedSkills, tags, price, duration, category, created_at
    FROM listings
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching listings:", err);
      return res.status(500).json({ error: "Failed to fetch listings" });
    }

    // ✅ Normalize fields before sending to frontend
    const formatted = results.map((row) => ({
      ...row,
      selectedSkills: row.selectedSkills
        ? row.selectedSkills.split(",").map((s) => s.trim())
        : [],
      tags: row.tags
        ? row.tags.split(",").map((t) => t.trim())
        : [],
    }));

    console.log(`✅ Retrieved ${formatted.length} listings for user_id=${user_id}`);
    res.status(200).json(formatted);
  });
});

  // =====================================================
  // ✅ FETCH ACCEPTED ORDERS FOR A FREELANCER
  // =====================================================
  app.get("/freelancer-orders", (req, res) => {
    const { freelancer_id } = req.query;
    console.log("GET /freelancer-orders called with:", freelancer_id);

    if (!freelancer_id) {
      return res.status(400).json({ error: "Missing freelancer_id" });
    }

    const query = `
      SELECT 
        lrl.log_id,
        lrl.listingID,
        lrl.user_id AS freelancer_id,
        lrl.requested_by AS client_id,
        lrl.accepted_by,
        lrl.title AS gig_title,
        lrl.description,
        lrl.price,
        lrl.duration,
        lrl.category,
        lrl.selectedSkills,
        lrl.tags,
        lrl.created_at AS requested_at,
        u.name AS client_name,
        u.email AS client_email
      FROM listing_requests_log lrl
      LEFT JOIN users u ON lrl.requested_by = u.id
      WHERE lrl.user_id = ?
        AND lrl.accepted_by IS NOT NULL
      ORDER BY lrl.created_at DESC;
    `;

    db.query(query, [Number(freelancer_id)], (err, results) => {
      if (err) {
        console.error("❌ Error fetching freelancer orders:", err.sqlMessage || err);
        return res.status(500).json({ error: "Server error fetching freelancer orders" });
      }

      console.log(`✅ Found ${results.length} accepted requests for freelancer_id=${freelancer_id}`);

      const formatted = results.map((row) => ({
        ...row,
        selectedSkills: row.selectedSkills
          ? String(row.selectedSkills).split(",").map((s) => s.trim())
          : [],
        tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()) : [],
      }));

      res.status(200).json(formatted);
    });
  });



// ===============================
// 🔹 CREATE REQUEST ROUTE
// ===============================
// 🔹 CREATE REQUEST ROUTE (with tags)
app.post("/create-request", (req, res) => {
  const { user_id, title, description, skills, price, duration, tags } = req.body;

  if (!user_id || !title || !price || !duration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Convert tags array (from frontend) to a comma-separated string
  const formattedTags = Array.isArray(tags)
    ? tags.join(", ")
    : typeof tags === "string"
    ? tags
    : "";

  const query = `
    INSERT INTO requests (user_id, title, description, skills, tags, price_range, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_id, title, description, skills, formattedTags, price, duration],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting request:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(200).json({
        message: "✅ Request created successfully!",
        request_id: result.insertId,
      });
    }
  );
});

// =====================================================
// ✅ FETCH REQUESTS FOR A CLIENT (from listing_requests_log)
// =====================================================
app.get("/client-requests", (req, res) => {
  const { client_id } = req.query;
  console.log("GET /client-requests called with:", client_id);

  if (!client_id) {
    return res.status(400).json({ error: "Missing client_id" });
  }

  const query = `
    SELECT
      lrl.log_id,
      lrl.listingID,
      lrl.user_id AS freelancer_id,
      lrl.requested_by AS client_id,
      lrl.accepted_by,
      lrl.title AS gig_title,
      lrl.description,
      lrl.price,
      lrl.duration,
      lrl.category,
      lrl.selectedSkills,
      lrl.tags,
      lrl.created_at AS requested_at,
      fu.name AS freelancer_name,
      fu.email AS freelancer_email,
      o.orderID,
      o.progress,
      o.finished
    FROM listing_requests_log lrl
    LEFT JOIN users fu ON lrl.user_id = fu.id
    LEFT JOIN orders o ON lrl.listingID = o.listingID AND lrl.requested_by = o.requested_by
    WHERE lrl.requested_by = ?
      AND (o.finished IS NULL OR o.finished = 'no')
    ORDER BY lrl.created_at DESC;
  `;

  db.query(query, [Number(client_id)], (err, results) => {
    if (err) {
      console.error("❌ Error fetching client requests:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error fetching client requests" });
    }

    const formatted = results.map((row) => ({
      ...row,
      selectedSkills: row.selectedSkills
        ? String(row.selectedSkills).split(",").map((s) => s.trim())
        : [],
      tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()) : [],
    }));

    res.status(200).json(formatted);
  });
});

// =====================================================
// ✅ FETCH ORDERS FOR A CLIENT (from orders table)
// =====================================================
app.get("/client-orders", (req, res) => {
  const { client_id } = req.query;
  console.log("GET /client-orders called with:", client_id);

  if (!client_id) {
    return res.status(400).json({ error: "Missing client_id" });
  }

  const query = `
    SELECT
      o.orderID,
      o.listingID,
      o.requestID,
      o.accepted_by,
      o.requested_by,
      o.duration,
      o.progress,
      o.createdAt,
      l.title AS gig_title,
      l.description AS gig_description,
      l.price AS gig_price,
      f.name AS freelancer_name,
      f.email AS freelancer_email
    FROM orders o
    LEFT JOIN listings l ON o.listingID = l.listingID
    LEFT JOIN users f ON o.accepted_by = f.id
    WHERE o.requested_by = ?
    ORDER BY o.createdAt DESC
  `;

  db.query(query, [Number(client_id)], (err, results) => {
    if (err) {
      console.error("❌ Error fetching client orders:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error fetching client orders" });
    }

    res.status(200).json(results);
  });
});

// =====================================================
// ✅ ACCEPT REQUEST
// =====================================================
app.post("/accept-request", (req, res) => {
  const { request_id, freelancer_id } = req.body;

  if (!request_id || !freelancer_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const acceptQuery = `
    UPDATE requests 
    SET accepted_by = ?, 
        status = 'accepted', 
        accepted_at = NOW() 
    WHERE request_id = ? 
    AND accepted_by IS NULL
  `;

  db.query(acceptQuery, [freelancer_id, request_id], (err, result) => {
    if (err) {
      console.error("❌ Error accepting request:", err);
      return res.status(500).json({ error: "Server error while accepting request" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found or already accepted" });
    }

    // Create an order for the accepted request
    const createOrderQuery = `
      INSERT INTO orders (
        request_id,
        accepted_by,
        requested_by,
        status,
        progress,
        createdAt
      )
      SELECT 
        r.request_id,
        r.accepted_by,
        r.user_id,
        'pending',
        0,
        NOW()
      FROM requests r
      WHERE r.request_id = ?
    `;

    db.query(createOrderQuery, [request_id], (orderErr, orderResult) => {
      if (orderErr) {
        console.error("❌ Error creating order:", orderErr);
        // Even if order creation fails, the request was accepted
        return res.status(200).json({ message: "Request accepted but order creation failed" });
      }

      res.status(200).json({ 
        message: "Request accepted and order created", 
        orderID: orderResult.insertId 
      });
    });
  });
});

// =====================================================
// ✅ CLIENT-FIND: simple endpoint to mark a request as accepted_by a freelancer
// This will ONLY update requests.accepted_by and nothing else (no orders, no status)
app.post("/client-find", (req, res) => {
  const { request_id, freelancer_id } = req.body;

  if (!request_id || !freelancer_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    UPDATE requests
    SET accepted_by = ?
    WHERE request_id = ?
      AND accepted_by IS NULL
  `;

  db.query(query, [freelancer_id, request_id], (err, result) => {
    if (err) {
      console.error("❌ Error in /client-find:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error while updating request" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found or already claimed" });
    }

    return res.status(200).json({ message: "Request claimed (accepted_by set)" });
  });
});

// =====================================================
// ✅ CLIENT CONFIRM: client accepts the freelancer who claimed a request
// This sets requests.confirmed = <client_id> for the given request_id (only if accepted_by is set)
app.post("/client-confirm", (req, res) => {
  const { request_id, client_id } = req.body;

  if (!request_id || !client_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const q = `
    UPDATE requests
    SET confirmed = ?
    WHERE request_id = ?
      AND accepted_by IS NOT NULL
  `;

  db.query(q, [client_id, request_id], (err, result) => {
    if (err) {
      console.error("❌ Error in /client-confirm:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error while confirming request" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found, not claimed, or already confirmed" });
    }

    return res.status(200).json({ message: "Request confirmed by client" });
  });
});

// =====================================================
// ✅ CLIENT REJECT: client rejects the freelancer's claim
// This clears accepted_by and confirmed for the request (so it becomes available again)
app.post("/client-reject", (req, res) => {
  const { request_id, client_id } = req.body;

  if (!request_id || !client_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const q = `
    UPDATE requests
    SET accepted_by = NULL,
        confirmed = NULL
    WHERE request_id = ?
      AND user_id = ?
      AND accepted_by IS NOT NULL
  `;

  db.query(q, [request_id, client_id], (err, result) => {
    if (err) {
      console.error("❌ Error in /client-reject:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error while rejecting request" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found or not claimed by a freelancer" });
    }

    return res.status(200).json({ message: "Request claim rejected and cleared" });
  });
});

// =====================================================
// ✅ SEARCH REQUESTS BY TITLE, TAGS, AND SKILLS
// =====================================================
app.get("/search-requests13", (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const searchTerm = `%${query}%`;
  
  const sqlQuery = `
    SELECT 
      r.request_id,
      r.user_id,
      r.title,
      r.description,
      r.skills,
      r.tags,
      r.price_range as price,
      r.duration,
      r.created_at,
      u.name as client_name,
      u.email as client_email
    FROM requests r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE (r.title LIKE ? OR r.tags LIKE ? OR r.skills LIKE ?)
    ORDER BY r.created_at DESC
  `;

  db.query(sqlQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("❌ Error searching requests:", err);
      return res.status(500).json({ error: "Failed to search requests" });
    }

    const formatted = results.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      skills: row.skills ? row.skills.split(',').map(s => s.trim()) : []
    }));

    res.status(200).json(formatted);
  });
});

// =====================================================
// ✅ SEARCH LISTINGS BY TITLE, TAGS, AND SKILLS
// =====================================================
app.get("/search-listings33", (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const searchTerm = `%${query}%`;
  
  const sqlQuery = `
    SELECT 
      l.listingID,
      l.user_id,
      l.title,
      l.description,
      l.selectedSkills,
      l.tags,
      l.price,
      l.duration,
      l.category,
      l.created_at,
      u.name as freelancer_name,
      u.email as freelancer_email
    FROM listings l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE (l.title LIKE ? OR l.tags LIKE ? OR l.selectedSkills LIKE ?)
    AND l.requested_by IS NULL
    AND l.accepted_by IS NULL
    ORDER BY l.created_at DESC
  `;

  db.query(sqlQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("❌ Error searching listings:", err);
      return res.status(500).json({ error: "Failed to search listings" });
    }

    const formatted = results.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      selectedSkills: row.selectedSkills ? row.selectedSkills.split(',').map(s => s.trim()) : []
    }));

    res.status(200).json(formatted);
  });
});





// ===============================
// 🔹 REQUEST A LISTING
// ===============================
app.post("/listings/request/:listingID", (req, res) => {
  const { listingID } = req.params;
  const { user_id } = req.body; // client making the request

  if (!listingID || !user_id) {
    return res.status(400).json({ error: "Missing listingID or user_id" });
  }

  // We'll fetch the listing details first, then insert a log entry
  const selectListing = `SELECT * FROM listings WHERE listingID = ? LIMIT 1`;

  db.query(selectListing, [listingID], (selectErr, rows) => {
    if (selectErr) {
      console.error("❌ Error fetching listing:", selectErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = rows[0];

    // Start by updating the listings table to mark requested_by
    const updateQuery = `UPDATE listings SET requested_by = ? WHERE listingID = ?`;

    db.query(updateQuery, [user_id, listingID], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("❌ Error updating requested_by:", updateErr);
        return res.status(500).json({ error: "Database error" });
      }

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Before inserting into listing_requests_log, check if a log already exists
      const checkLog = `SELECT log_id FROM listing_requests_log WHERE listingID = ? AND requested_by = ? LIMIT 1`;
      db.query(checkLog, [listingID, user_id], (checkErr, checkRows) => {
        if (checkErr) {
          console.error("❌ Error checking listing_requests_log:", checkErr);
          // proceed to insert (best-effort) so the freelancer still sees request
        }

        if (checkRows && checkRows.length > 0) {
          // A log already exists for this listing/client; return existing log id
          const existingId = checkRows[0].log_id;
          console.log(`ℹ️ listing_requests_log already has entry (log_id=${existingId}) for listing ${listingID} and client ${user_id}`);
          return res.status(200).json({
            message: "Listing requested (already logged)",
            listingID,
            requested_by: user_id,
            log_id: existingId,
          });
        }

        // Insert into listing_requests_log so freelancer notifications will pick it up
        const insertLog = `
          INSERT INTO listing_requests_log
            (listingID, user_id, requested_by, title, description, price, duration, selectedSkills, tags, category, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        // Ensure we get the category from the listing
        const logParams = [
          listingID,
          listing.user_id || listing.userId || null, // freelancer owner
          user_id,
          listing.title || null,
          listing.description || null,
          listing.price || null,
          listing.duration || null,
          listing.selectedSkills || null,
          listing.tags || null,
          listing.category, // Remove the || null to prevent NULL category
        ];

        db.query(insertLog, logParams, (logErr, logResult) => {
          if (logErr) {
            // Log the error but still return success for the listing update
            console.error("❌ Error inserting into listing_requests_log:", logErr);
            return res.status(200).json({
              message: "Listing requested; failed to create request log (DB error)",
              listingID,
              requested_by: user_id,
            });
          }

          console.log(`✅ Listing ${listingID} requested by user ${user_id} (log id ${logResult.insertId})`);
          return res.status(200).json({
            message: "✅ Listing successfully requested!",
            listingID,
            requested_by: user_id,
            log_id: logResult.insertId,
          });
        });
      });
    });
  });
});

// ===============================
// 🔹 GET REQUESTS FOR A USER
// ===============================
app.get("/requests", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  const query =
    "SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC";

  db.query(query, [user_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching requests:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(result);
  });
});


// GET reviews for a freelancer
// GET /freelancer-reviews?freelancer_id=123
app.get("/freelancer-reviews", (req, res) => {
  const freelancerId = req.query.freelancer_id;
  if (!freelancerId) return res.status(400).json({ error: "freelancer_id is required" });

  const query = `
    SELECT r.reviewID, r.stars, r.comment, r.createdAt, r.orderID,
           u.id as clientID, u.name as clientName, u.email as clientEmail
    FROM reviews r
    JOIN users u ON r.clientID = u.id
    WHERE r.freelancerID = ?
    ORDER BY r.createdAt DESC
  `;
  db.query(query, [freelancerId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    return res.status(200).json(results);
  });
});

// POST create a review (optional endpoint for later)
app.post("/create-review", (req, res) => {
  const { orderID, clientID, freelancerID, stars, comment } = req.body;
  if (!orderID || !clientID || !freelancerID || stars == null) {
    return res.status(400).json({ error: "orderID, clientID, freelancerID and stars are required" });
  }

  const insert = `INSERT INTO reviews (orderID, clientID, freelancerID, stars, comment) VALUES (?, ?, ?, ?, ?)`;
  db.query(insert, [orderID, clientID, freelancerID, stars, comment || null], (err, result) => {
    if (err) return res.status(500).json({ error: "DB insert error", details: err.message });
    return res.status(200).json({ message: "Review created", reviewID: result.insertId });
  });
});


// GET /freelancer-requests?freelancer_id=123
// ===========================
// ✅ FETCH REQUESTED GIGS FOR A FREELANCER
// ===========================
// app.get("/freelancer-requests", async (req, res) => {
//   const { freelancer_id } = req.query;

//   if (!freelancer_id) {
//     return res.status(400).json({ error: "Missing freelancer_id" });
//   }

//   try {
//     // Select listings that belong to this freelancer and have been requested by a client
//     const [rows] = await db.execute(
//       `
//       SELECT 
//         l.listingID,
//         l.title AS gig_title,
//         l.description,
//         l.price,
//         l.duration,
//         l.category,
//         l.requested_by AS client_id,
//         u.name AS client_name,
//         l.created_at AS requested_at,
//         l.accepted_by
//       FROM listings l
//       LEFT JOIN users u ON l.requested_by = u.id
//       WHERE l.user_id = ? AND l.requested_by IS NOT NULL
//       ORDER BY l.created_at DESC
//       `,
//       [freelancer_id]
//     );

//     res.json(rows);
//   } catch (err) {
//     console.error("❌ Error fetching freelancer requests:", err);
//     res.status(500).json({ error: "Server error fetching freelancer requests" });
//   }
// });

// ===========================
// ✅ ACCEPT A REQUESTED GIG
// ===========================
// app.post("/accept-request", async (req, res) => {
//   const { listingID, request_id, accepted_by } = req.body;

//   if (!listingID || !accepted_by) {
//     return res.status(400).json({ error: "Missing listingID or accepted_by" });
//   }

//   try {
//     // Update listing to mark accepted_by
//     const [result] = await db.execute(
//       `
//       UPDATE listings
//       SET accepted_by = ?
//       WHERE listingID = ?
//       `,
//       [accepted_by, listingID]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Listing not found or already accepted" });
//     }

//     // Optional: you can update requests table if you want to mark which request was accepted
//     if (request_id) {
//       await db.execute(
//         `UPDATE requests SET status = 'accepted' WHERE request_id = ?`,
//         [request_id]
//       );
//     }

//     res.json({ success: true, message: "Request accepted successfully." });
//   } catch (err) {
//     console.error("❌ Error accepting request:", err);
//     res.status(500).json({ error: "Server error while accepting request" });
//   }
// });


// ===========================
// ✅ CLIENT REQUESTS A GIG (when they click request button on client.jsx)
// ===========================
app.post("/request-gig", async (req, res) => {
  const { client_id, listingID } = req.body;

  if (!client_id || !listingID) {
    return res.status(400).json({ error: "Missing client_id or listingID" });
  }

  try {
    // Update listing's requested_by column
    await db.execute(
      `UPDATE listings SET requested_by = ? WHERE listingID = ?`,
      [client_id, listingID]
    );

    res.json({ success: true, message: "Gig requested successfully!" });
  } catch (err) {
    console.error("❌ Error requesting gig:", err);
    res.status(500).json({ error: "Server error while requesting gig" });
  }
});




// =====================================================
// =====================================================
// ✅ Get all top-level occupations (parent_id IS NULL)
app.get("/categories/occupations", (req, res) => {
  const query = `
    SELECT category_id, name 
    FROM categories
    WHERE parent_id IS NULL
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching occupations:", err);
      return res.status(500).json({ error: "Failed to fetch occupations" });
    }
    res.status(200).json(results);
  });
});

// ✅ Get skills/subcategories by parent occupation
app.get("/categories/skills/:parent_id", (req, res) => {
  const { parent_id } = req.params;
  const query = `
    SELECT category_id, name
    FROM categories
    WHERE parent_id = ?
    ORDER BY name ASC
  `;
  db.query(query, [parent_id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching subcategories:", err);
      return res.status(500).json({ error: "Failed to fetch subcategories" });
    }
    res.status(200).json(results);
  });
});


// ✅ Get all top-level occupations
app.get("/categories/occupations", (req, res) => {
  const query = `
    SELECT category_id, name 
    FROM categories
    WHERE parent_id IS NULL
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching occupations:", err);
      return res.status(500).json({ error: "Failed to fetch occupations" });
    }
    res.status(200).json(results);
  });
});


// ✅ Get up to 5 random listings per occupation (category)
app.get("/listings/random/:category", (req, res) => {
  const { category } = req.params;
  // Return listings plus freelancer info and aggregated rating when available
  const query = `
    SELECT
      l.listingID,
      l.title,
      l.description,
      l.price,
      l.duration,
      l.category,
      l.created_at,
      u.id AS freelancer_id,
      u.name AS freelancer_name,
      AVG(r.stars) AS avg_rating,
      COUNT(r.reviewID) AS review_count
    FROM listings l
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN reviews r ON r.freelancerID = u.id
    WHERE l.category = ?
    GROUP BY l.listingID
    ORDER BY RAND()
    LIMIT 5
  `;

  db.query(query, [category], (err, results) => {
    if (err) {
      console.error("❌ Error fetching listings:", err);
      return res.status(500).json({ error: "Failed to fetch listings" });
    }

    // Normalize avg_rating to number (or null) and keep review_count as int
    const normalized = (results || []).map((row) => ({
      ...row,
      avg_rating: row.avg_rating !== null ? Number(Number(row.avg_rating).toFixed(2)) : null,
      review_count: row.review_count ? Number(row.review_count) : 0,
    }));

    res.status(200).json(normalized);
  });
});

// app.get("/freelancer-requests", (req, res) => {
//   const { freelancer_id } = req.query;
//   console.log("GET /freelancer-requests called with:", freelancer_id);
//   if (!freelancer_id) {
//     return res.status(400).json({ error: "Missing freelancer_id" });
//   }

//   // Fetch listings that have been requested by clients but NOT yet accepted
//   const query = `
//     SELECT 
//       l.listingID,
//       l.user_id AS freelancer_id,
//       l.requested_by AS client_id,
//       l.accepted_by,
//       l.title AS gig_title,
//       l.description,
//       l.price,
//       l.duration,
//       l.category,
//       l.selectedSkills,
//       l.tags,
//       l.created_at AS created_at,
//       u.name AS client_name,
//       u.email AS client_email
//     FROM listings l
//     LEFT JOIN users u ON l.requested_by = u.id
//     WHERE l.user_id = ?
//       AND l.requested_by IS NOT NULL
//       AND (l.accepted_by IS NULL OR l.accepted_by = 0)
//     ORDER BY l.created_at DESC
//   `;

//   db.query(query, [Number(freelancer_id)], (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching freelancer requests:", err.sqlMessage || err);
//       return res.status(500).json({ error: "Server error fetching freelancer requests" });
//     }

//     console.log(`✅ Found ${results.length} requested listings for freelancer_id=${freelancer_id}`);
//     if (results.length > 0) console.table(results);

//     // Normalize selectedSkills/tags to arrays before sending
//     const formatted = results.map((row) => ({
//       ...row,
//       selectedSkills: row.selectedSkills ? String(row.selectedSkills).split(',').map(s => s.trim()) : [],
//       tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : [],
//     }));

//     res.status(200).json(formatted);
//   });
// });



// app.get("/freelancer-requests", (req, res) => {
//   const { freelancer_id } = req.query;
//   console.log("GET /freelancer-requests called with:", freelancer_id);

//   if (!freelancer_id) {
//     return res.status(400).json({ error: "Missing freelancer_id" });
//   }

//   // ✅ Fetch requests from the log table instead of listings
//   const query = `
//     SELECT 
//       lrl.log_id,
//       lrl.listingID,
//       lrl.user_id AS freelancer_id,
//       lrl.requested_by AS client_id,
//       lrl.accepted_by,
//       lrl.title AS gig_title,
//       lrl.description,
//       lrl.price,
//       lrl.duration,
//       lrl.category,
//       lrl.selectedSkills,
//       lrl.tags,
//       lrl.created_at AS requested_at,
//       u.name AS client_name,
//       u.email AS client_email
//     FROM listing_requests_log lrl
//     LEFT JOIN users u ON lrl.requested_by = u.id
//     WHERE lrl.user_id = ?
//     ORDER BY lrl.created_at DESC;
//   `;

//   db.query(query, [Number(freelancer_id)], (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching freelancer requests:", err.sqlMessage || err);
//       return res.status(500).json({ error: "Server error fetching freelancer requests" });
//     }

//     console.log(`✅ Found ${results.length} logged requests for freelancer_id=${freelancer_id}`);
//     if (results.length > 0) console.table(results);

//     // Normalize selectedSkills/tags for frontend compatibility
//     const formatted = results.map((row) => ({
//       ...row,
//       selectedSkills: row.selectedSkills
//         ? String(row.selectedSkills).split(",").map((s) => s.trim())
//         : [],
//       tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()) : [],
//     }));

//     res.status(200).json(formatted);
//   });
// });

app.get("/freelancer-requests", (req, res) => {
  const { freelancer_id } = req.query;
  console.log("GET /freelancer-requests called with:", freelancer_id);

  if (!freelancer_id) {
    return res.status(400).json({ error: "Missing freelancer_id" });
  }

  // ✅ Fetch only requests not yet accepted (accepted_by IS NULL)
  const query = `
    SELECT 
      lrl.log_id,
      lrl.listingID,
      lrl.user_id AS freelancer_id,
      lrl.requested_by AS client_id,
      lrl.accepted_by,
      lrl.title AS gig_title,
      lrl.description,
      lrl.price,
      lrl.duration,
      lrl.category,
      lrl.selectedSkills,
      lrl.tags,
      lrl.created_at AS requested_at,
      u.name AS client_name,
      u.email AS client_email
    FROM listing_requests_log lrl
    LEFT JOIN users u ON lrl.requested_by = u.id
    WHERE lrl.user_id = ?
      AND lrl.accepted_by IS NULL
    ORDER BY lrl.created_at DESC;
  `;

  db.query(query, [Number(freelancer_id)], (err, results) => {
    if (err) {
      console.error("❌ Error fetching freelancer requests:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error fetching freelancer requests" });
    }

    console.log(`✅ Found ${results.length} pending requests for freelancer_id=${freelancer_id}`);
    if (results.length > 0) console.table(results);

    // Normalize selectedSkills/tags for frontend compatibility
    const formatted = results.map((row) => ({
      ...row,
      selectedSkills: row.selectedSkills
        ? String(row.selectedSkills).split(",").map((s) => s.trim())
        : [],
      tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()) : [],
    }));

    res.status(200).json(formatted);
  });
});



// =====================================================
// ✅ ACCEPT A REQUEST — creates an order entry
// =====================================================
// app.post("/accept-request", (req, res) => {
//   const { listingID, freelancer_id } = req.body;

//   if (!listingID || !freelancer_id) {
//     return res.status(400).json({ error: "Missing listingID or freelancer_id" });
//   }

//   const query = `
//     UPDATE listings
//     SET accepted_by = ?
//     WHERE listingID = ?
//   `;

//   db.query(query, [freelancer_id, listingID], (err, result) => {
//     if (err) {
//       console.error("❌ Error accepting request:", err);
//       return res.status(500).json({ error: "Server error while accepting request" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Listing not found or already accepted" });
//     }

//     console.log(`✅ Listing ${listingID} accepted by freelancer ${freelancer_id}`);
//     res.status(200).json({
//       success: true,
//       message: "✅ Request accepted successfully! Order has been created automatically.",
//     });
//   });
// });

// Accept a listing request (from listing_requests_log)
app.post("/accept-listing-request", (req, res) => {
  const { log_id, freelancer_id } = req.body;
  console.log("accept-listing-request called with:", { log_id, freelancer_id });

  if (!log_id || !freelancer_id) {
    return res.status(400).json({ error: "Missing log_id or freelancer_id" });
  }

  const query = `
    UPDATE listing_requests_log
    SET accepted_by = ?
    WHERE log_id = ?
  `;

  db.query(query, [freelancer_id, log_id], (err, result) => {
    if (err) {
      console.error("❌ Error accepting listing request:", err);
      return res.status(500).json({ error: "Server error while accepting listing request" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Listing request not found or already accepted." });
    }

    console.log(`✅ Request log ${log_id} accepted by freelancer ${freelancer_id}`);
    res.status(200).json({
      success: true,
      message: "✅ Listing request accepted successfully! Order will be created automatically via trigger.",
    });
  });
});

// =====================================================
// ✅ REJECT A REQUEST — removes the log entry
// =====================================================
app.post("/reject-request", (req, res) => {
  const { log_id } = req.body;

  if (!log_id) {
    return res.status(400).json({ error: "Missing log_id" });
  }

  const query = `
    DELETE FROM listing_requests_log
    WHERE log_id = ?
  `;

  db.query(query, [log_id], (err, result) => {
    if (err) {
      console.error("❌ Error rejecting request:", err);
      return res.status(500).json({ error: "Server error while rejecting request" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    console.log(`🚫 Request log_id ${log_id} removed`);
    res.status(200).json({
      success: true,
      message: "Request rejected and removed successfully.",
    });
  });
});


// =====================================================
// ✅ GET SINGLE LISTING REQUEST BY LOG ID
// =====================================================
app.get("/listing-request/:log_id", (req, res) => {
  const { log_id } = req.params;

  if (!log_id) return res.status(400).json({ error: "log_id is required" });

  const query = `
    SELECT
      lrl.*, 
      req_u.name AS client_name, req_u.email AS client_email,
      fr_u.name AS freelancer_name, fr_u.email AS freelancer_email
    FROM listing_requests_log lrl
    LEFT JOIN users req_u ON lrl.requested_by = req_u.id
    LEFT JOIN users fr_u ON lrl.user_id = fr_u.id
    WHERE lrl.log_id = ?
    LIMIT 1
  `;

  db.query(query, [Number(log_id)], (err, results) => {
    if (err) {
      console.error("❌ Error fetching listing request:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error fetching listing request" });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Listing request not found" });
    }

    const row = results[0];

    // Normalize arrays
    const formatted = {
      ...row,
      selectedSkills: row.selectedSkills
        ? String(row.selectedSkills).split(',').map((s) => s.trim())
        : [],
      tags: row.tags ? String(row.tags).split(',').map((t) => t.trim()) : [],
    };
    // Try to find a corresponding order in the orders table
    const orderQuery = `
      SELECT orderID, listingID, requestID, accepted_by, requested_by, duration, progress, createdAt
      FROM orders
      WHERE listingID = ? AND requested_by = ?
      LIMIT 1
    `;

    db.query(orderQuery, [formatted.listingID, formatted.requested_by], (orderErr, orderResults) => {
      if (orderErr) {
        console.error("❌ Error fetching related order:", orderErr.sqlMessage || orderErr);
        // still return the listing request info even if order lookup fails
        formatted.order = null;
        return res.status(200).json(formatted);
      }

      formatted.order = (orderResults && orderResults.length > 0) ? orderResults[0] : null;
      return res.status(200).json(formatted);
    });
  });
});


// =====================================================
// ✅ UPDATE ORDER PROGRESS BY orderID
// =====================================================
app.put("/orders/:orderID/progress", (req, res) => {
  const { orderID } = req.params;
  const { progress } = req.body;

  if (progress == null) return res.status(400).json({ error: "Missing progress value" });

  const query = `UPDATE orders SET progress = ? WHERE orderID = ?`;
  db.query(query, [Number(progress), Number(orderID)], (err, result) => {
    if (err) {
      console.error("❌ Error updating order progress:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error updating progress" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({ success: true, orderID: Number(orderID), progress: Number(progress) });
  });
});


// =====================================================
// ✅ UPDATE ORDER PROGRESS BY listingID + requested_by
// If an order exists for the listing/requestor, update it.
// =====================================================
app.post("/orders/progress", (req, res) => {
  const { listingID, requested_by, progress } = req.body;

  if (!listingID || !requested_by || progress == null) {
    return res.status(400).json({ error: "listingID, requested_by and progress are required" });
  }

  const query = `UPDATE orders SET progress = ? WHERE listingID = ? AND requested_by = ?`;
  db.query(query, [Number(progress), Number(listingID), Number(requested_by)], (err, result) => {
    if (err) {
      console.error("❌ Error updating order progress by listing/requestor:", err.sqlMessage || err);
      return res.status(500).json({ error: "Server error updating progress" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No order found for given listingID and requested_by" });
    }

    return res.status(200).json({ success: true, listingID: Number(listingID), requested_by: Number(requested_by), progress: Number(progress) });
  });
});

// directory to store all message files
const messagesDir = path.join(process.cwd(), "messages");

// ensure messages directory exists
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}

// ✅ route to initialize a CSV for an order
app.post("/init-message-file", (req, res) => {
  const { order_id, freelancer_id, client_id } = req.body;

  if (!order_id || !freelancer_id || !client_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const fileName = `messages_order_${order_id}_freelancer_${freelancer_id}_client_${client_id}.csv`;
  const filePath = path.join(messagesDir, fileName);

  // create file only if it doesn’t exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "sender_id,receiver_id,message\n");
    console.log(`✅ Created new message file: ${fileName}`);
  }

  // If message_logs table is present, ensure a record and return msg_id
  // Ensure the message_logs table exists. If it does not, create it so we can always return a msg_id.
  const createTable = `
    CREATE TABLE IF NOT EXISTS message_logs (
      msg_id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT DEFAULT NULL,
      freelancer_id INT DEFAULT NULL,
      client_id INT DEFAULT NULL,
      file_path TEXT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  db.query(createTable, (createErr) => {
    if (createErr) {
      console.warn('⚠️ Could not ensure message_logs table exists:', createErr.message || createErr);
      // proceed with best-effort behavior: try to read existing row, but if that fails return file_path
    }

    const checkQuery = `SELECT msg_id, file_path, last_updated FROM message_logs WHERE order_id = ? AND freelancer_id = ? AND client_id = ? LIMIT 1`;
    db.query(checkQuery, [order_id, freelancer_id, client_id], (checkErr, checkResults) => {
      if (checkErr) {
        console.warn('⚠️ message_logs check failed:', checkErr.message || checkErr);
        return res.json({ success: true, file_path: filePath });
      }

      if (checkResults && checkResults.length > 0) {
        const row = checkResults[0];
        return res.json({ success: true, msg_id: row.msg_id, file_path: row.file_path, last_updated: row.last_updated });
      }

      const insert = `INSERT INTO message_logs (order_id, freelancer_id, client_id, file_path) VALUES (?, ?, ?, ?)`;
      db.query(insert, [order_id, freelancer_id, client_id, filePath], (insErr, insRes) => {
        if (insErr) {
          console.error('❌ Error inserting message_logs record:', insErr.message || insErr);
          // fallback to returning file_path only
          return res.json({ success: true, file_path: filePath });
        }

        return res.json({ success: true, msg_id: insRes.insertId, file_path: filePath });
      });
    });
  });
});

// ✅ route to append a new message to CSV
app.post("/send-message", (req, res) => {
  const { order_id, freelancer_id, client_id, sender_id, receiver_id, message } = req.body;

  if (!order_id || !sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const fileName = `messages_order_${order_id}_freelancer_${freelancer_id}_client_${client_id}.csv`;
  const filePath = path.join(messagesDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Message file not found. Initialize first." });
  }

  const newLine = `${sender_id},${receiver_id},"${message.replace(/"/g, '""')}"\n`;

  fs.appendFile(filePath, newLine, (err) => {
    if (err) {
      console.error("❌ Error writing to message file:", err);
      return res.status(500).json({ error: "Failed to write message" });
    }
    // update last_updated in message_logs if record exists
    const upd = `UPDATE message_logs SET last_updated = NOW() WHERE order_id = ? AND freelancer_id = ? AND client_id = ?`;
    db.query(upd, [order_id, freelancer_id, client_id], (uErr) => {
      if (uErr) console.warn('⚠️ Failed to update message_logs.last_updated:', uErr.message || uErr);
      return res.json({ success: true });
    });
  });
});


// GET message_logs by order_id
app.get('/message-logs', (req, res) => {
  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: 'order_id is required' });

  const q = 'SELECT msg_id, order_id, freelancer_id, client_id, file_path, last_updated FROM message_logs WHERE order_id = ?';
  db.query(q, [Number(order_id)], (err, results) => {
    if (err) {
      console.error('❌ Error fetching message_logs:', err.message || err);
      return res.status(500).json({ error: 'Server error fetching message logs' });
    }
    res.json(results);
  });
});


// GET messages by msg_id (read CSV)
app.get('/messages/:msg_id', (req, res) => {
  const { msg_id } = req.params;
  if (!msg_id) return res.status(400).json({ error: 'msg_id is required' });

  const q = 'SELECT file_path FROM message_logs WHERE msg_id = ? LIMIT 1';
  db.query(q, [Number(msg_id)], (err, results) => {
    if (err) {
      console.error('❌ Error fetching message_log:', err.message || err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!results || results.length === 0) return res.status(404).json({ error: 'Message log not found' });
    const filePath = results[0].file_path;
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Message file not found' });

    fs.readFile(filePath, 'utf8', (rErr, data) => {
      if (rErr) {
        console.error('❌ Error reading message file:', rErr);
        return res.status(500).json({ error: 'Failed to read message file' });
      }

      const lines = data.split(/\r?\n/).filter(Boolean);
      const rows = lines[0] && lines[0].startsWith('sender_id') ? lines.slice(1) : lines;
      const parsed = rows.map((line) => {
        const parts = line.split(/,(.+)/);
        if (!parts[1]) return null;
        const sender = parts[0];
        const rest = parts[1];
        const recvParts = rest.split(/,(.+)/);
        if (!recvParts[1]) return null;
        const receiver = recvParts[0];
        let msg = recvParts[1];
        if (msg.startsWith('"') && msg.endsWith('"')) msg = msg.slice(1, -1).replace(/""/g, '"');
        return { sender_id: sender, receiver_id: receiver, message: msg };
      }).filter(Boolean);

      res.json(parsed.slice(-50));
    });
  });
});

// ✅ Get all entries from requests_log
app.get('/requests-log', (req, res) => {
  const q = `SELECT rq_log_id, rq_requestID, rq_user_id, rq_requested_by, rq_accepted_by, rq_title, rq_description, rq_selectedSkills, rq_tags, rq_price, rq_duration, rq_created_at, finished FROM requests_log ORDER BY rq_created_at DESC`;
  db.query(q, (err, results) => {
    if (err) {
      console.error('❌ Error fetching requests_log:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Server error fetching requests_log' });
    }
    res.status(200).json(results);
  });
});

// ✅ Get freelancer's payment summary and details
app.get('/freelancer-finance/:freelancerId', (req, res) => {
  const { freelancerId } = req.params;
  if (!freelancerId) return res.status(400).json({ error: 'Freelancer ID required' });

  // Get summary using stored procedure
  db.query('CALL get_freelancer_payouts()', (err, results) => {
    if (err) {
      console.error('❌ Error calling get_freelancer_payouts:', err);
      return res.status(500).json({ error: 'Failed to get payment summary' });
    }
    
    // Find this freelancer's summary from procedure results
    const summary = results[0].find(row => Number(row.freelancerID) === Number(freelancerId)) || null;

    // Get detailed payment history
    const detailQuery = `
      SELECT 
        fp.*,
        o.progress,
        l.title as order_title,
        l.description as order_description
      FROM freelancer_payouts fp
      LEFT JOIN orders o ON fp.orderID = o.orderID
      LEFT JOIN listings l ON o.listingID = l.listingID
      WHERE fp.freelancerID = ?
      ORDER BY fp.paidAt DESC
    `;

    db.query(detailQuery, [freelancerId], (detailErr, detailResults) => {
      if (detailErr) {
        console.error('❌ Error fetching payment details:', detailErr);
        return res.status(500).json({ error: 'Failed to get payment details' });
      }

      res.json({
        summary,
        details: detailResults
      });
    });
  });
});

// ✅ Mark a request as finished in requests_log
app.post('/requests-log/finish', (req, res) => {
  const { rq_log_id, freelancer_id } = req.body;
  
  if (!rq_log_id || !freelancer_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const q = `
    UPDATE requests_log 
    SET finished = 1 
    WHERE rq_log_id = ? 
    AND rq_accepted_by = ?`;  // Only allow if this freelancer accepted it

  db.query(q, [rq_log_id, freelancer_id], (err, result) => {
    if (err) {
      console.error('❌ Error marking request as finished:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Server error updating requests_log' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request log not found or not accepted by this freelancer' });
    }

    res.status(200).json({ message: 'Request marked as finished' });
  });
});





// =====================================================
// ✅ START SERVER
// =====================================================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
