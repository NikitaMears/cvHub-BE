const express = require('express');
const userController = require('../controllers/userController');
// const mobileSocialAuthController = require('../controllers/mobileSocialAuthController');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const cvController = require('../controllers/cvController');
const rfpController = require('../controllers/rfpController');
const tpController = require('../controllers/tpController');
const { verifyToken } = require('../middlewares/verifyToken');
const projectController = require('../controllers/projectController');
const cvProjectController = require('../controllers/cvProjectController');

const router = express.Router();

// User routes
router.post('/users', verifyToken, userController.createUser);
router.get('/users', verifyToken, userController.getUsers);
router.post('/users/change-password/:id',verifyToken, userController.changePassword);

router.put('/users/:id', verifyToken, userController.updateUser);
router.delete('/users/:id', verifyToken, userController.deleteUser);
router.post('/login', userController.login);
router.get('/users/:id', verifyToken, userController.getUserById); 

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

router.get('/rfps', rfpController.getAll);
router.post('/rfps', rfpController.create);

router.get('/rfps/:id', rfpController.getOne);
router.get('/rfpsCvs/:id', rfpController.getCvsForRFPs);

router.put('/rfps/:id', rfpController.update);
router.delete('/rfps/:id', rfpController.delete);
router.post('/rfps/search', rfpController.search);

router.get('/tps', tpController.getAll);
router.post('/tps', tpController.createTP);
router.post('/tpMembers', tpController.addTeamForTP);

router.get('/cvProjects/:id', cvProjectController.getOne);
router.get('/projectCvs/:id', cvProjectController.getByProjectId);

router.post('/cvProjects', cvProjectController.create);
router.post('/cvProjects2', cvProjectController.ponts);



router.get('/tps/:id', tpController.getOne);
router.get('/rfpTP/:id', tpController.getOneForRFP);
router.post('/tps/search', tpController.search);


router.put('/tps/:id', tpController.updateTP);
router.delete('/tps/:id', tpController.delete);


router.get('/projects', projectController.getAll);
router.post('/projects', projectController.createFirmExperience);

router.get('/projects/:id', projectController.getOne);
router.put('/projects/:id', projectController.update);
router.delete('/projects/:id', projectController.delete);





router.post('/signup', userController.signup);
router.get('/dashboard',verifyToken, userController.dashboard);
router.post('/signUpWithGmail', userController.signUpWithGmail);
router.post('/signUpWithFacebook', userController.signUpWithFacebook);
router.post('/loginWithGmail', userController.loginWithGmail);
router.post('/loginWithFacebook', userController.loginWithFacebook);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPassword', userController.resetPassword);
module.exports = router;