const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const MembershipController = require('../controllers/membershipController');

// Public - xem gói
router.get('/membership-plans', MembershipController.getPlans);

// Client - nâng cấp
router.post('/membership/upgrade', checkJWT, MembershipController.upgrade);

// Admin
router.post('/membership-plans', checkJWT, isAdmin, MembershipController.create);
router.put('/membership-plans/:id', checkJWT, isAdmin, MembershipController.update);
router.delete('/membership-plans/:id', checkJWT, isAdmin, MembershipController.delete);

module.exports = router;
