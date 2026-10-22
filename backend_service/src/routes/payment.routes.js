const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { initiateCheckout, verifyPayment } = require('../services/payment.service');

// Get all active subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plansRes = await query('SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price_etb ASC');
    res.json(plansRes.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans.' });
  }
});

// Initiate Checkout
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { planId, provider, phoneOrAccount } = req.body;
    if (!planId || !provider) {
      return res.status(400).json({ error: 'planId and provider are required.' });
    }

    const validProviders = ['telebirr', 'cbe_birr', 'chapa', 'awash', 'bank_transfer'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ error: `Invalid payment provider. Must be one of: ${validProviders.join(', ')}` });
    }

    const checkoutData = await initiateCheckout({
      userId: req.user.id,
      planId: parseInt(planId, 10),
      provider,
      phoneOrAccount,
    });

    res.status(201).json(checkoutData);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Payment initiation failed.' });
  }
});

// Verify Payment Reference & Activate Entitlement
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { referenceCode } = req.body;
    if (!referenceCode) {
      return res.status(400).json({ error: 'referenceCode is required for payment verification.' });
    }

    const result = await verifyPayment({
      userId: req.user.id,
      referenceCode: referenceCode.trim(),
    });

    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ error: error.message || 'Payment verification failed.' });
  }
});

// Current User Subscription & Transaction History
router.get('/my-status', authenticate, async (req, res) => {
  try {
    const subRes = await query(`
      SELECT us.*, sp.name as plan_name, sp.code as plan_code, sp.price_etb, sp.billing_interval
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
      ORDER BY us.expires_at DESC LIMIT 1;
    `, [req.user.id]);

    const txRes = await query(`
      SELECT tx.*, sp.name as plan_name
      FROM payment_transactions tx
      JOIN subscription_plans sp ON tx.plan_id = sp.id
      WHERE tx.user_id = $1
      ORDER BY tx.created_at DESC
      LIMIT 10;
    `, [req.user.id]);

    res.json({
      activeSubscription: subRes.rows[0] || null,
      transactions: txRes.rows,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status.' });
  }
});

module.exports = router;
