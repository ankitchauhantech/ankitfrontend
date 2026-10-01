const express = require("express");
const router = express.Router();

const API_URL = process.env.API_URL || "http://localhost:5000/api";

// Home Page
router.get("/", async (req, res) => {
  try {
    const [pRes, postRes, tRes, sRes] = await Promise.all([
      fetch(`${API_URL}/projects/featured`),
      fetch(`${API_URL}/posts`),
      fetch(`${API_URL}/testimonials`),
      fetch(`${API_URL}/services`),
    ]);

    const [projects, posts, testimonials, services] = await Promise.all([
      pRes.ok ? pRes.json() : [],
      postRes.ok ? postRes.json() : [],
      tRes.ok ? tRes.json() : [],
      sRes.ok ? sRes.json() : [],
    ]);

    res.render("pages/home", {
      title: "Ankit Chauhan - CMS Developer",
      projects: projects || [],
      posts: posts ? posts.slice(0, 3) : [],
      testimonials: testimonials || [],
      services: services ? services.slice(0, 4) : [],
      activePage: "home",
    });
  } catch (error) {
    console.error("Home page error:", error.message);
    res.render("pages/home", {
      title: "Ankit Chauhan - CMS Developer",
      projects: [],
      posts: [],
      testimonials: [],
      services: [],
      activePage: "home",
    });
  }
});

// About Page
router.get("/about", (req, res) => {
  res.render("pages/about", {
    title: "About - Ankit Chauhan",
    activePage: "about",
  });
});

// Services Page
router.get("/services", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/services`);
    const services = response.ok ? await response.json() : [];

    res.render("pages/services", {
      title: "Services - Ankit Chauhan",
      services: services || [],
      activePage: "services",
    });
  } catch (error) {
    console.error("Services page error:", error.message);
    res.render("pages/services", {
      title: "Services - Ankit Chauhan",
      services: [],
      activePage: "services",
    });
  }
});

// Portfolio Page
router.get("/portfolio", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/projects`);
    const projects = response.ok ? await response.json() : [];

    res.render("pages/portfolio", {
      title: "Portfolio - Ankit Chauhan",
      projects: projects || [],
      activePage: "portfolio",
    });
  } catch (error) {
    console.error("Portfolio page error:", error.message);
    res.render("pages/portfolio", {
      title: "Portfolio - Ankit Chauhan",
      projects: [],
      activePage: "portfolio",
    });
  }
});

// Single Project
router.get("/portfolio/:id", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/projects/${req.params.id}`);
    if (!response.ok) return res.redirect("/portfolio");

    const project = await response.json();
    res.render("pages/project-single", {
      title: `${project.title} - Ankit Chauhan`,
      project,
      activePage: "portfolio",
    });
  } catch (error) {
    console.error("Project details error:", error.message);
    res.redirect("/portfolio");
  }
});

// Blog Page
router.get("/blog", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const posts = response.ok ? await response.json() : [];

    res.render("pages/blog", {
      title: "Blog - Ankit Chauhan",
      posts: posts || [],
      activePage: "blog",
    });
  } catch (error) {
    console.error("Blog page error:", error.message);
    res.render("pages/blog", {
      title: "Blog - Ankit Chauhan",
      posts: [],
      activePage: "blog",
    });
  }
});

// Single Blog Post
router.get("/blog/:slug", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/posts/${req.params.slug}`);
    if (!response.ok) return res.redirect("/blog");

    const { post, relatedPosts } = await response.json();

    res.render("pages/blog-single", {
      title: `${post.title} - Ankit Chauhan`,
      post,
      relatedPosts: relatedPosts || [],
      activePage: "blog",
    });
  } catch (error) {
    console.error("Blog single error:", error.message);
    res.redirect("/blog");
  }
});

// Contact Page
router.get("/contact", (req, res) => {
  res.render("pages/contact", {
    title: "Contact - Ankit Chauhan",
    activePage: "contact",
  });
});

// Contact Form Submit
router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    req.flash("error_msg", "Please fill all required fields.");
    return res.redirect("/contact");
  }

  try {
    const response = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (response.ok) {
      req.flash(
        "success_msg",
        "Thank you! Your message has been sent. I'll get back to you soon."
      );
    } else {
      req.flash("error_msg", "Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("Contact form error:", err.message);
    req.flash("error_msg", "Unable to send message right now.");
  }

  res.redirect("/contact");
});

module.exports = router;
