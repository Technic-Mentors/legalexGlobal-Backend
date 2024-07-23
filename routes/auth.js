const express = require("express");
// const serverless = require('serverless-http');
const User = require("../Schema/User");
const Admin = require("../Schema/Admin");
const Signup = require("../Schema/Signup")
const Post = require("../Schema/Post");
const Category = require("../Schema/Category");
const JWT_SECRET = "habibisagoodb#oy";
const multer = require("multer");
const bcrypt = require("bcrypt");

// const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

let hardcodedUser = {
  email: "capobrain@gmail.com",
  password: "$2a$10$UQoTsfaaoUYdx0Kzl51.QOU9E5dZsU5dE4yCk53UCfbCHTwl3OAGu",
};
// Route 1: signup user using: api/auth/signUpUser
router.post(
  "/signUpUser", async (req, res) => {
    try {
      const { name, email, schoolName, number } = req.body;

      const checkEmail = await Signup.findOne({ email })
      if (checkEmail) {
        return res.json({ message: "user already exists", user: checkEmail })
      }
      const user = await Signup.create({
        name,
        email,
        number,
        schoolName
      });
      res.json({ user: user });
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error);
    }
  }
);
// get signUp Demo Users
router.get("/getDemoUsers", async (req, res) => {
  try {
    const allusers = await Signup.find({});
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

// Route 1: create user using: api/auth/createuser
router.post(
  "/createuser", async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, schoolname, phoneno, message } = req.body;

      const user = await User.create({
        name,
        email,
        schoolname,
        phoneno,
        message,
      });

      res.json({ user });
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error);
    }
  }
);

router.get("/getallusers", async (req, res) => {
  try {
    const allusers = await User.find({});
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.get("/getusers/:id", async (req, res) => {
  try {
    const getUserId = await User.findById(req.params.id)
    res.json(getUserId)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

router.delete("/deluser/:id", async (req, res) => {
  try {
    const getUserId = await User.findByIdAndDelete(req.params.id)
    if (!getUserId) {
      return res.status(404).json({ message: "user not found" })
    }
    res.status(200).json({ message: "successfully deleted" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

router.get("/edituser/:id", async (req, res) => {
  try {
    const { name, email, schoolname, phoneno, message } = req.body;

    const newUser = {}
    if (name) {
      newUser.name = name
    }
    if (email) {
      newUser.email = email
    }
    if (schoolname) {
      newUser.schoolname = schoolname
    }
    if (phoneno) {
      newUser.phoneno = phoneno
    }
    if (message) {
      newUser.message = message
    }

    let getUserId = await User.findById(req.params.id)
    if (!getUserId) {
      return res.status(404).json({ message: "user not found" })
    }

    getUserId = await User.findByIdAndUpdate(req.params.id, { $set: newUser }, { new: true })
    res.json(getUserId)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})
// post api start
router.post(
  "/createpost",
  [
    body("title", "Enter title"),
    body("title", "Enter category"),
    body("content", "Enter your content here"),
  ],
  upload.single("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, content, category, slug } = req.body;

      const post = await Post.create({
        title,
        content,
        category,
        slug,
      });

      res.json({ post });
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error);
    }
  }
);
// post api end
router.get("/postsCount", async (req, res) => {
  try {
    const postCount = await Post.countDocuments({})
    res.json(postCount)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
})
// get post start
router.get("/getallposts", async (req, res) => {
  try {
    const allposts = await Post.find({});
    res.json(allposts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
});
// get post end

// get post id start
router.get("/getpost/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});
// get post id end
const createAdmin = async () => {
  const adminEmail = "info@legalexglobal.co.uk"
  const adminPassword = "$2b$10$TSiFgY4oS5VnYNd5eZcvfOfh.0/WVGDn.dXq8fyZllIWW1jOTqPXW"
  const existingUser = await Admin.findOne({ email: adminEmail });

  if (existingUser) {
    return;
  } else {
    await Admin.create({
      email: adminEmail,
      password: adminPassword
    })
  }
}

createAdmin()

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the entered credentials match a user in the database
    const user = await Admin.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.sign(
      { user: { email: user.email } },
      "TechnicSecretKey",
      {
        expiresIn: "1h", 
      }
    );

    res.json({ success: true, token });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Change Password
router.put("/changepassword", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Check if the entered credentials match the user in the database
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Old password incorrect" });
    }

    // Hash the new password and update it in the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal server error");
  }
});

// Change Password
router.get("/getposts/:id", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.delete("/delposts/:id", async (req, res) => {
  try {
    const posts = await Post.findByIdAndDelete(req.params.id);
    if (!posts) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.put("/editposts/:id", async (req, res) => {
  try {
    const { title, category, content, slug } = req.body;
    const newPosts = {};
    if (title) {
      newPosts.title = title;
    }
    if (category) {
      newPosts.category = category;
    }
    if (content) {
      newPosts.content = content;
    }
    if (slug) {
      newPosts.slug = slug;
    }

    let posts = Post.findById(req.params.id);
    if (!posts) {
      res.status(404).send({ message: "Posts not find" });
    }
    posts = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: newPosts },
      { new: true }
    );
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

// Category
router.post(
  "/category",
  [body("category", "Enter category")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { category } = req.body;
    const Allategory = await Category.create({
      category,
    });
    res.json(Allategory);
  }
);

router.get("/getcategory", async (req, res) => {
  try {
    const Getcategory = await Category.find({});
    res.json(Getcategory);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal Server Error");
  }
});

router.get("/getcategory/:id", async (req, res) => {
  try {
    const Getcategory = await Category.findById(req.params.id);
    if (!Getcategory) {
      return res.status(404).json({ message: "Dont find Category" });
    }
    res.json(Getcategory);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.delete("/delcategory/:id", async (req, res) => {
  try {
    const Getcategory = await Category.findByIdAndDelete(req.params.id);
    if (!Getcategory) {
      return res.status(404).json({ message: "Dont find Category" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.put("/editcategory/:id", async (req, res) => {
  try {
    const { category } = req.body;
    const newCat = {};
    if (category) {
      newCat.category = category;
    }

    let cat = await Category.findById(req.params.id);
    if (!cat) {
      res.status(404).json("Category not found");
    }

    cat = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: newCat },
      { new: true }
    );
    res.json(cat);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.get("/categoryCount", async (req, res) => {
  try {
    const categoryCount = await Category.countDocuments({})
    res.json(categoryCount)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
})
module.exports = router;
