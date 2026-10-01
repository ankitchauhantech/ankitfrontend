const express = require("express");
const router = express.Router();

const API_URL = process.env.API_URL || "http://localhost:5000/api";

// Admin auth middleware
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.flash("error_msg", "Access denied. Admin only.");
  res.redirect("/auth/login");
};

// Dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard`);
    const data = response.ok
      ? await response.json()
      : { stats: { projects: 0, posts: 0, messages: 0, users: 0 }, recentMessages: [] };

    res.render("admin/dashboard", {
      layout: "admin/layout",
      title: "Admin Dashboard - Ankit Chauhan",
      stats: data.stats,
      recentMessages: data.recentMessages || [],
      activePage: "dashboard",
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    req.flash("error_msg", "Failed to load dashboard data.");
    res.redirect("/");
  }
});

// Messages
router.get("/messages", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/contacts`);
    const messages = response.ok ? await response.json() : [];

    res.render("admin/messages", {
      layout: "admin/layout",
      title: "Messages - Admin",
      messages: messages || [],
      activePage: "messages",
    });
  } catch (error) {
    console.error("Messages error:", error.message);
    res.redirect("/admin/dashboard");
  }
});

// Mark message as read
router.post("/messages/:id/read", isAdmin, async (req, res) => {
  try {
    await fetch(`${API_URL}/contacts/${req.params.id}/read`, { method: "PUT" });
  } catch (error) {
    console.error("Mark read error:", error.message);
  }
  res.redirect("/admin/messages");
});

// Services Management
router.get("/services", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/services`);
    const services = response.ok ? await response.json() : [];

    res.render("admin/services", {
      layout: "admin/layout",
      title: "Services - Admin",
      services: services || [],
      activePage: "services",
    });
  } catch (error) {
    console.error("Admin services error:", error.message);
    res.redirect("/admin/dashboard");
  }
});

// Add Service Page
router.get("/services/add", isAdmin, (req, res) => {
  res.render("admin/service-form", {
    layout: "admin/layout",
    title: "Add Service - Admin",
    service: null,
    activePage: "services",
  });
});

// Add Service POST
router.post("/services/add", isAdmin, async (req, res) => {
  const { title, description, icon, icon_color, features, active } = req.body;
  try {
    await fetch(`${API_URL}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        icon,
        icon_color,
        features,
        active: active ? 1 : 0,
      }),
    });
    req.flash("success_msg", "Service added successfully!");
  } catch (err) {
    console.error("Add service error:", err.message);
    req.flash("error_msg", "Failed to add service.");
  }
  res.redirect("/admin/services");
});

// Edit Service Page
router.get("/services/edit/:id", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/services/${req.params.id}`);
    if (!response.ok) return res.redirect("/admin/services");

    const service = await response.json();
    res.render("admin/service-form", {
      layout: "admin/layout",
      title: "Edit Service - Admin",
      service,
      activePage: "services",
    });
  } catch (error) {
    console.error("Edit service form error:", error.message);
    res.redirect("/admin/services");
  }
});

// Update Service POST
router.post("/services/edit/:id", isAdmin, async (req, res) => {
  const { title, description, icon, icon_color, features, active } = req.body;
  try {
    await fetch(`${API_URL}/services/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        icon,
        icon_color,
        features,
        active: active ? 1 : 0,
      }),
    });
    req.flash("success_msg", "Service updated successfully!");
  } catch (err) {
    console.error("Update service error:", err.message);
    req.flash("error_msg", "Failed to update service.");
  }
  res.redirect("/admin/services");
});

// Delete Service
router.post("/services/delete/:id", isAdmin, async (req, res) => {
  try {
    await fetch(`${API_URL}/services/${req.params.id}`, { method: "DELETE" });
    req.flash("success_msg", "Service deleted successfully!");
  } catch (err) {
    console.error("Delete service error:", err.message);
    req.flash("error_msg", "Failed to delete service.");
  }
  res.redirect("/admin/services");
});

// Projects Management
router.get("/projects", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/projects`);
    const projects = response.ok ? await response.json() : [];

    res.render("admin/projects", {
      layout: "admin/layout",
      title: "Projects - Admin",
      projects: projects || [],
      activePage: "projects",
    });
  } catch (error) {
    console.error("Admin projects error:", error.message);
    res.redirect("/admin/dashboard");
  }
});

// Add Project Page
router.get("/projects/add", isAdmin, (req, res) => {
  res.render("admin/project-form", {
    layout: "admin/layout",
    title: "Add Project - Admin",
    project: null,
    activePage: "projects",
  });
});

// Add Project POST
router.post("/projects/add", isAdmin, async (req, res) => {
  const {
    title,
    description,
    category,
    tech_stack,
    image,
    live_url,
    github_url,
    featured,
  } = req.body;
  try {
    await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        tech_stack,
        image,
        live_url,
        github_url,
        featured: featured ? 1 : 0,
      }),
    });
    req.flash("success_msg", "Project added successfully!");
  } catch (err) {
    console.error("Add project error:", err.message);
    req.flash("error_msg", "Failed to add project.");
  }
  res.redirect("/admin/projects");
});

// Edit Project Page
router.get("/projects/edit/:id", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/projects/${req.params.id}`);
    if (!response.ok) return res.redirect("/admin/projects");

    const project = await response.json();
    res.render("admin/project-form", {
      layout: "admin/layout",
      title: "Edit Project - Admin",
      project,
      activePage: "projects",
    });
  } catch (error) {
    console.error("Edit project error:", error.message);
    res.redirect("/admin/projects");
  }
});

// Update Project POST
router.post("/projects/edit/:id", isAdmin, async (req, res) => {
  const {
    title,
    description,
    category,
    tech_stack,
    image,
    live_url,
    github_url,
    featured,
  } = req.body;
  try {
    await fetch(`${API_URL}/projects/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        tech_stack,
        image,
        live_url,
        github_url,
        featured: featured ? 1 : 0,
      }),
    });
    req.flash("success_msg", "Project updated successfully!");
  } catch (err) {
    console.error("Update project error:", err.message);
    req.flash("error_msg", "Failed to update project.");
  }
  res.redirect("/admin/projects");
});

// Delete Project
router.post("/projects/delete/:id", isAdmin, async (req, res) => {
  try {
    await fetch(`${API_URL}/projects/${req.params.id}`, { method: "DELETE" });
    req.flash("success_msg", "Project deleted successfully!");
  } catch (err) {
    console.error("Delete project error:", err.message);
    req.flash("error_msg", "Failed to delete project.");
  }
  res.redirect("/admin/projects");
});

// Posts Management
router.get("/posts", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/posts?all=true`);
    const posts = response.ok ? await response.json() : [];

    res.render("admin/posts", {
      layout: "admin/layout",
      title: "Blog Posts - Admin",
      posts: posts || [],
      activePage: "posts",
    });
  } catch (error) {
    console.error("Admin posts error:", error.message);
    res.redirect("/admin/dashboard");
  }
});

// Add Post Page
router.get("/posts/add", isAdmin, (req, res) => {
  res.render("admin/post-form", {
    layout: "admin/layout",
    title: "Add Post - Admin",
    post: null,
    activePage: "posts",
  });
});

// Add Post POST
router.post("/posts/add", isAdmin, async (req, res) => {
  const { title, content, excerpt, image, category, tags, published } = req.body;
  try {
    await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        excerpt,
        image,
        category,
        tags,
        published: published ? 1 : 0,
        author_id: req.session.user?.id || null,
        author_name: req.session.user?.name || "Ankit Chauhan",
      }),
    });
    req.flash("success_msg", "Blog post added successfully!");
  } catch (err) {
    console.error("Add post error:", err.message);
    req.flash("error_msg", "Failed to add post. Please try again.");
  }
  res.redirect("/admin/posts");
});

// Edit Post Page
router.get("/posts/edit/:id", isAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/posts/id/${req.params.id}`);
    if (!response.ok) return res.redirect("/admin/posts");

    const post = await response.json();
    res.render("admin/post-form", {
      layout: "admin/layout",
      title: "Edit Post - Admin",
      post,
      activePage: "posts",
    });
  } catch (error) {
    console.error("Edit post form error:", error.message);
    res.redirect("/admin/posts");
  }
});

// Update Post POST
router.post("/posts/edit/:id", isAdmin, async (req, res) => {
  const { title, content, excerpt, image, category, tags, published } = req.body;
  try {
    await fetch(`${API_URL}/posts/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        excerpt,
        image,
        category,
        tags,
        published: published ? 1 : 0,
      }),
    });
    req.flash("success_msg", "Blog post updated successfully!");
  } catch (err) {
    console.error("Update post error:", err.message);
    req.flash("error_msg", "Failed to update post.");
  }
  res.redirect("/admin/posts");
});

// Delete Post
router.post("/posts/delete/:id", isAdmin, async (req, res) => {
  try {
    await fetch(`${API_URL}/posts/${req.params.id}`, { method: "DELETE" });
    req.flash("success_msg", "Blog post deleted successfully!");
  } catch (err) {
    console.error("Delete post error:", err.message);
    req.flash("error_msg", "Failed to delete post.");
  }
  res.redirect("/admin/posts");
});

module.exports = router;
