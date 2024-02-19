const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config'); 
const crypto = require('crypto');

const User = require('../models/User');
const Role = require('../models/Role');
const Client = require('../models/Client');
const Service = require('../models/Service');
const nodemailer = require('nodemailer');
const { hasPermission } = require('../middlewares/permissionChecker');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  appName: "Yeha-web",
});

const {
  createUserSchema,
  createPublicUserSchema,
  updateUserSchema,
  changePasswordSchema,
} = require("../validations/userValidation");
const { Op } = require("sequelize");
const Permission = require("../models/Permission");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const hasAccess = await hasPermission(req, "getUsers");

    if (!hasAccess) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: Role,
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Requested User ID:", userId);

    // Find the user by ID with associated role and permissions
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: {
        model: Role,
        include: Permission, // Include permissions associated with the role
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Determine role name based on RoleId
    const roleName =
      user.RoleId === 1 ? "Admin" : user.RoleId === 2 ? "User" : "Unknown";

    // Extract permissions from the associated role
    const permissions = user.Role
      ? user.Role.Permissions.map((permission) => permission.name)
      : [];

    // Include role name and permissions in the response
    res.json({ ...user.toJSON(), roleName, permissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Create a new user

exports.createUser = async (req, res) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { firstName, lastName, email, phoneNumber, password, RoleId } =
    req.body;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, "createUser");

    if (!hasAccess) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if the user already exists with the same email or phone number
    const existingUserByEmail = await User.findOne({ where: { email } });
    const existingUserByPhoneNumber = await User.findOne({
      where: { phoneNumber },
    });

    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    if (existingUserByPhoneNumber) {
      return res
        .status(400)
        .json({ error: "User with this phone number already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      status: "Candidate",
      RoleId,
    });

    // Generate a JWT token for the user
    const token = jwt.sign({ id: newUser.id }, config.jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
/////

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });


  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  user.verificationCode = verificationCode;
  user.save()

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'minasmelaku@gmail.com',
        pass: 'sxmbwmvwdcftismt' 
      }
    });

    let mailOptions = {
      from: 'minasmelaku@gmail.com',
      to: email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  console.log(email)
  console.log(verificationCode  )

  try {
    const user = await User.findOne({ where: { email } });
console.log("user", user)
    if (!user) {
      return res.status(404).json({ error: 'User not found or invalid verification code' });
    }

    user.password = newPassword;
    user.verificationCode = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};
////

exports.changePassword = async (req, res) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const id = req.params.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Find the user by email

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (newPassword != confirmPassword) {
      return res.status(400).json({
        error: "Password and Confirmation password are not the same.",
      });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    user.lastPasswordChange = new Date();
    user.status = "Active";
    await user.save();
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "minasmelaku@gmail.com",
        pass: "sxmbwmvwdcftismt",
      },
    });

    let mailOptions = {
      from: "minasmelaku@gmail.com",
      to: user.email,
      subject: "Your password is changed.!",
      html: `
      <body style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; padding: 10px; background-color: #f2f2f2;">

  <header style="background-color: #333; color: white; padding: 1rem;">
    <h1 style="font-size: 24px; margin: 0;">Time to Change Your Password!</h1> 
  </header>

  <main style="background-color: white; padding: 1rem; border-radius: 5px;">
    <p style="font-size: 18px; font-weight: bold;">Dear User,</p>

    <p>Your password for yeha maps us changed. 
    
   
    <p>For your security, it's important that you notify you when your password is changed.</p>

    <p>Best Regards,<br>Yeha Team</p>
  </main>
  
  <footer style="background-color: #333; color: white; padding: 0.5rem; text-align: center; font-size: 0.85rem;">
    &copy; 2023 Yeha Maps
  </footer>

</body>
    `,
    };
    return res.status(201).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user based on the phone number
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const changePasswordRequired =
      user.status === "Candidate" ||
      shouldChangePassword(user.lastPasswordChange);

    if (changePasswordRequired) {
      const token = jwt.sign(
        { id: user.id, changePasswordRequired: true },
        config.jwtSecret,
        { expiresIn: "1h" }
      );

      return res
        .status(200)
        .json({ message: "Password change required", token });
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: "1hr",
    });

    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { firstName, lastName, email, phoneNumber, password, RoleId, status } =
    req.body;

  let userStatus = status;
  if (status == null) {
    userStatus = "Active";
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, "editUser");

    if (!hasAccess) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if the new email or phone number is different from the existing ones
    if (email !== user.email) {
      const existingUserByEmail = await User.findOne({
        where: { email, id: { [Op.not]: user.id } },
      });

      if (existingUserByEmail) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }
    }

    if (phoneNumber !== user.phoneNumber) {
      const existingUserByPhoneNumber = await User.findOne({
        where: { phoneNumber, id: { [Op.not]: user.id } },
      });

      if (existingUserByPhoneNumber) {
        return res
          .status(400)
          .json({ error: "User with this phone number already exists" });
      }
    }

    // Hash the new password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.password = hashedPassword;
    user.RoleId = RoleId;
    user.status = userStatus;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function shouldChangePassword(lastPasswordChange) {
  const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  const now = new Date();
  return now - lastPasswordChange >= oneWeekInMillis;
}

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, "deleteUser");

    if (!hasAccess) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await user.destroy();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.signup = async (req, res) => {
  const { error } = createPublicUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { firstName, lastName, email, phoneNumber, password } = req.body;
  try {
    // Check if the user has the required permission
    const RoleId = 3;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists. Please login." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      status: "Candidate",
      RoleId,
    });

    // Generate a JWT token for the user
    const token = jwt.sign({ id: newUser.id }, config.jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.publicLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user based on the phone number
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: "1h",
    });
    console.log("Generated token:", token);

    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.dashboard = async (req, res) => {
  try {
    const clientCount = await Client.count();
    const serviceCount = await Service.count();
    const userCount = await User.count();

    res.json({
      clientCount,
      serviceCount,
      userCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.signUpWithFacebook = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const facebookAuthProvider = await firebaseAdmin
      .auth()
      .verifyIdToken(idToken);
    const uid = facebookAuthProvider.uid;

    const firebaseUserCredential = await firebaseAdmin.auth().getUser(uid);
    const { displayName, email } = firebaseUserCredential;

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: displayName.split(" ")[0],
        lastName: displayName.split(" ")[1],
        email,
        status: "Active",
        RoleId: 3,
      },
    });

    res.status(200).json({
      message: created ? "User created successfully" : "User already exists",
      user,
    });
  } catch (error) {
    console.error("Error during Facebook sign-up:", error);
    res.status(500).json({ error: "Failed to sign up with Facebook" });
  }
};
exports.loginWithFacebook = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const facebookAuthProvider = await firebaseAdmin
      .auth()
      .verifyIdToken(idToken);
    const uid = facebookAuthProvider.uid;

    // Get the user data
    const firebaseUser = await firebaseAdmin.auth().getUser(uid);
    const { email } = firebaseUser;

    const user = await User.findOne({ where: { email } });

    if (user) {
      res.status(200).json({ message: "Login successful", user });
    } else {
      res.status(404).json({ error: "User not found. Please sign up first." });
    }
  } catch (error) {
    console.error("Error during Facebook login:", error);
    res.status(500).json({ error: "Failed to log in with Facebook" });
  }
};
exports.signUpWithGmail = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the user data
    const firebaseUser = await firebaseAdmin.auth().getUser(uid);
    const { displayName, email } = firebaseUser;
    console.log("Dis", displayName);
    let fn = displayName.split(" ")[0];
    let ln = displayName.split(" ")[1];
    if (ln == null) {
      ln = fn;
    }

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: fn,
        lastName: ln,
        email,
        status: "Active",
        RoleId: 3,
      },
    });

    res.status(200).json({
      message: created ? "User created successfully" : "User already exists",
      user,
    });
  } catch (error) {
    console.error("Error during Gmail sign-up:", error);
    res.status(500).json({ error: "Failed to sign up with Gmail" });
  }
};
exports.loginWithGmail = async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the user data
    const firebaseUser = await firebaseAdmin.auth().getUser(uid);
    const { email } = firebaseUser;

    // Check if the user exists in your database
    const user = await User.findOne({ where: { email } });

    if (user) {
      const token = jwt.sign({ id: user.id }, config.jwtSecret, {
        expiresIn: "1hr",
      });
      res.status(200).json({ message: "Login successful", user, token });
    } else {
      res.status(404).json({ error: "User not found. Please sign up first." });
    }
  } catch (error) {
    console.error("Error during Gmail login:", error);
    res.status(500).json({ error: error });
  }
};
