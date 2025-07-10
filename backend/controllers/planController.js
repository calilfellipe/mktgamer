import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import stripe from '../config/stripe.js';
import redisClient from '../config/redis.js';

export const getPlans = async (req, res) => {
  try {
    // Try cache first
    const cachedPlans = await redisClient.get('plans:all');
    if (cachedPlans) {
      return res.json({ plans: JSON.parse(cachedPlans) });
    }

    const plans = await Plan.findAll();
    
    // Cache for 1 hour
    await redisClient.setEx('plans:all', 3600, JSON.stringify(plans));
    
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const subscribeToPlan = async (req, res) => {
  try {
    const { plan_id, payment_method_id } = req.body;
    const user_id = req.user.id;

    // Get plan details
    const plan = await Plan.findById(plan_id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Free plan doesn't require payment
    if (plan.price === 0) {
      await User.updatePlan(user_id, plan_id);
      await Plan.createSubscription({
        user_id,
        plan_id,
        stripe_subscription_id: null,
        status: 'active'
      });

      return res.json({
        message: 'Successfully subscribed to free plan',
        plan
      });
    }

    // Create Stripe customer if doesn't exist
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: req.user.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.username,
          metadata: { user_id }
        });
      }
    } catch (stripeError) {
      console.error('Stripe customer error:', stripeError);
      return res.status(500).json({ error: 'Payment processing error' });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: plan.name,
            description: `GameMarket ${plan.name} Plan`
          },
          unit_amount: plan.price * 100, // Convert to cents
          recurring: {
            interval: 'month'
          }
        }
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { user_id, plan_id }
    });

    // Update user plan and create subscription record
    await User.updatePlan(user_id, plan_id);
    await Plan.createSubscription({
      user_id,
      plan_id,
      stripe_subscription_id: subscription.id,
      status: 'active'
    });

    res.json({
      message: 'Subscription created successfully',
      subscription_id: subscription.id,
      client_secret: subscription.latest_invoice.payment_intent.client_secret,
      plan
    });
  } catch (error) {
    console.error('Subscribe to plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get user's current subscription
    const subscription = await Plan.findUserSubscription(user_id);
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel Stripe subscription if exists
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    }

    // Update local subscription status
    await Plan.cancelSubscription(user_id);
    
    // Downgrade user to free plan
    await User.updatePlan(user_id, 'free');

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Plan.findUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.json({ subscription: null });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};