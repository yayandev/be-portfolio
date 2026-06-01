const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const supabase = require("../supabase");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const authMiddleware = require("../middlewares/auth");

// CREATE PORTFOLIO
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, github_url, demo_url, tech_stack } = req.body;

    let imageUrl = null;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        return res.status(400).json({
          error: uploadError.message,
        });
      }

      const { data } = supabase.storage
        .from("portfolio")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from("portfolios")
      .insert([
        {
          title,
          description,
          github_url,
          demo_url,
          tech_stack: tech_stack ? tech_stack.split(",") : [],
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: "Portfolio created",
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    status: "success",
    status_code: 200,
    data,
    message: "Portfolios retrieved",
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    status: "success",
    status_code: 200,
    data,
    message: "Portfolio retrieved",
  });
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    status: "success",
    status_code: 200,
    data,
    message: "Portfolio deleted",
  });
});

router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, github_url, demo_url, tech_stack, image_url } =
    req.body;

  let imageUrl = null;

  if (image_url) {
    imageUrl = image_url;
  } else {
    imageUrl = null;
  }

  if (req.file) {
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      return res.status(400).json({
        error: uploadError.message,
      });
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { data, error } = await supabase
    .from("portfolios")
    .update({
      title,
      description,
      github_url,
      demo_url,
      tech_stack: tech_stack ? tech_stack.split(",") : [],
      image_url: imageUrl,
    })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    status: "success",
    status_code: 200,
    data,
    message: "Portfolio updated",
  });
});

module.exports = router;
