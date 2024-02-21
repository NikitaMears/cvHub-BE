const express = require('express');
const userController = require('../controllers/userController');
// const mobileSocialAuthController = require('../controllers/mobileSocialAuthController');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const cvController = require('../controllers/cvController');

const { verifyToken } = require('../middlewares/verifyToken');
// const clientController = require('../controllers/clientController');
// const serviceController = require('../controllers/serviceController');


const router = express.Router();

// User routes
router.post('/users', verifyToken, userController.createUser);
router.get('/users', verifyToken, userController.getUsers);
router.post('/users/change-password/:id',verifyToken, userController.changePassword);

router.put('/users/:id', verifyToken, userController.updateUser);
router.delete('/users/:id', verifyToken, userController.deleteUser);
router.post('/login', userController.login);
router.get('/users/:id', verifyToken, userController.getUserById); // Use the middleware to verify the token

// Role routes
router.get('/roles', verifyToken, roleController.getRoles);
router.get('/roles/:id', verifyToken, roleController.getRoleById);

router.post('/roles', verifyToken, roleController.createRole);
router.put('/roles/:id', verifyToken, roleController.updateRole);
router.delete('/roles/:id', verifyToken, roleController.deleteRole);

// Permission routes
router.get('/permissions', verifyToken, permissionController.getPermissions);
router.post('/permissions', verifyToken, permissionController.createPermission);
router.put('/permissions/:id', verifyToken, permissionController.updatePermission);
router.delete('/permissions/:id', verifyToken, permissionController.deletePermission);

router.get('/cvs', cvController.getAll);
router.get('/cvs/:id', cvController.getOne);
router.put('/cvs/:id', cvController.update);
router.delete('/cvs/:id', cvController.delete);
router.post('/cvs/search', cvController.search);

// Routes for services
// router.post('/services', serviceController.createService);
// router.get('/services', serviceController.getAllServices);
// router.get('/services/:id', serviceController.getServiceById);
// router.put('/services/:id', serviceController.updateService);
// router.delete('/services/:id', serviceController.deleteService);

// // Routes for clients
// router.post('/clients', clientController.createClient);
// router.get('/clients', clientController.getAllClientsWithServices);
// router.get('/clients/:id', clientController.getClientByIdWithServices);
// router.put('/clients/:id', clientController.updateClient);
// router.delete('/clients/:id', clientController.deleteClient);

//Latest changes

// router.post('/publicLogin', userController.publicLogin);
router.post('/signup', userController.signup);
// router.post('/clientLogin', clientController.clientLogin);
// router.get('/clientProfile/:id', verifyToken, clientController.clientProfile);
// router.put('/regenerateAPIKey/:id', verifyToken, clientController.regenerateAPIKey);
// router.put('/cancelSubscription/:id', verifyToken, clientController.cancelServiceSubscription);
// router.put('/changeClientPassword/:id', verifyToken, clientController.changeClientPassword);
router.get('/dashboard',verifyToken, userController.dashboard);
router.post('/signUpWithGmail', userController.signUpWithGmail);
router.post('/signUpWithFacebook', userController.signUpWithFacebook);
router.post('/loginWithGmail', userController.loginWithGmail);
router.post('/loginWithFacebook', userController.loginWithFacebook);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPassword', userController.resetPassword);
// router.post('/mobile/signUpWithGmail', mobileSocialAuthController.signUpWithGmailMobile);
// router.post('/mobile/signUpWithFacebook', mobileSocialAuthController.signUpWithFacebookMobile);
// router.post('/mobile/loginWithGmail', mobileSocialAuthController.loginWithGmailMobile);
// router.post('/mobile/loginWithFacebook', mobileSocialAuthController.loginWithFacebookMobile);
module.exports = router;