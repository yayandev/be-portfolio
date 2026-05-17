const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const supabase = require("../supabase");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check email
    const { data: existingUser } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert admin
    const { data, error } = await supabase
      .from("admins")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: "Register success",
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // get user
    const { data: user, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (!user || error) {
      return res.status(400).json({
        error: "Email not found",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Wrong password",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
