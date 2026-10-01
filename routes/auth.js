const express = require("express");
const router = express.Router();

const API_URL = process.env.API_URL || "http://localhost:5000/api";

// Login Page
router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("auth/login", {
    title: "Login - Ankit Chauhan",
    activePage: "login",
  });
});

// Login POST
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error_msg", "Please fill in all fields.");
    return res.redirect("/auth/login");
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      req.flash("error_msg", data.error || "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    req.session.user = data.user;
    req.flash("success_msg", `Welcome back, ${data.user.name}!`);

    if (data.user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("error_msg", "Authentication server error. Please try again.");
    res.redirect("/auth/login");
  }
});

// Register Page
router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("auth/register", {
    title: "Register - Ankit Chauhan",
    activePage: "register",
  });
});

// Register POST
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push("Please fill in all fields.");
  }
  if (password !== password2) {
    errors.push("Passwords do not match.");
  }
  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  if (errors.length > 0) {
    return res.render("auth/register", {
      title: "Register - Ankit Chauhan",
      errors,
      name,
      email,
      activePage: "register",
    });
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errors.push(data.error || "Registration failed.");
      return res.render("auth/register", {
        title: "Register - Ankit Chauhan",
        errors,
        name,
        email,
        activePage: "register",
      });
    }

    req.flash("success_msg", "Registration successful! Please login.");
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Registration error:", error.message);
    req.flash("error_msg", "Registration failed. Server unreachable.");
    res.redirect("/auth/register");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
