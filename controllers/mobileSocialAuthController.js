const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config'); 
const User = require('../models/User');
const Role = require('../models/Role');
const Client = require('../models/Client');
const Service = require('../models/Service');
const nodemailer = require('nodemailer');
const { hasPermission } = require('../middlewares/permissionChecker');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../google-services.json');
// firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert(serviceAccount),
//   appName: 'Ethio Maps'
// });

const {
  createUserSchema,createPublicUserSchema,
  updateUserSchema,changePasswordSchema
} = require('../validations/userValidation');
const { Op } = require('sequelize');
const Permission = require('../models/Permission');

// Get all users

exports.signUpWithFacebookMobile = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const facebookAuthProvider = new firebaseAdmin.auth.FacebookAuthProvider();
    const credential = facebookAuthProvider.credential(accessToken);

    const firebaseUserCredential = await firebaseAdmin.auth().signInWithCredential(credential);
    const { displayName, email } = firebaseUserCredential.user;

       const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ')[1],
        email,
        status: 'Active',
        RoleId: 3
      },
    });

    res.status(200).json({ message: created ? 'User created successfully' : 'User already exists', user });
  } catch (error) {
    console.error('Error during Facebook sign-up:', error);
    res.status(500).json({ error: 'Failed to sign up with Facebook' });
  }
}
exports.loginWithFacebookMobile = async (req, res) => {
  const { accessToken } = req.body; 
  
  try {
    const facebookAuthProvider = new firebaseAdmin.auth.FacebookAuthProvider();
    const credential = facebookAuthProvider.credential(accessToken);

    const firebaseUserCredential = await firebaseAdmin.auth().signInWithCredential(credential);
    const { displayName, email } = firebaseUserCredential.user;

  
    const user = await User.findOne({ where: { email } });

    if (user) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(404).json({ error: 'User not found. Please sign up first.' });
    }
  } catch (error) {
    console.error('Error during Facebook login:', error);
    res.status(500).json({ error: 'Failed to log in with Facebook' });
  }
}
exports.signUpWithGmailMobile = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the user data
    const firebaseUser = await firebaseAdmin.auth().getUser(uid);
    const { displayName, email } = firebaseUser;
    console.log("Dis",displayName)
    let fn = displayName.split(' ')[0];
    let ln = displayName.split(' ')[1];
    if(ln == null){
      ln = fn;
    }

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: fn,
        lastName: ln,
        email,
        status: 'Active',
        RoleId: 3,
      },
    });

    res.status(200).json({ message: created ? 'User created successfully' : 'User already exists', user });
  } catch (error) {
    console.error('Error during Gmail sign-up:', error);
    res.status(500).json({ error: 'Failed to sign up with Gmail' });
  }
}
exports.loginWithGmailMobile = async (req, res) => {
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
      const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1hr' });
      res.status(200).json({ message: 'Login successful', user,token });
    } else {
      res.status(404).json({ error: 'User not found. Please sign up first.' });
    }
  } catch (error) {
    console.error('Error during Gmail login:', error);
    res.status(500).json({ error: error });
  }
}