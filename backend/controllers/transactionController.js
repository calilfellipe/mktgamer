import { Transaction } from '../models/Transaction.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import stripe from '../config/stripe.js';

export const createTransaction = async (req, res) => {
  try {
    const { product_id, payment_method } = req.body;
    const buyer_id = req.user.id;

    // Get product details
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id === buyer_id) {
      return res.status(400).json({ error: 'Cannot buy your own product' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(product.price * 100), // Convert to cents
      currency: 'brl',
      payment_method_types: ['card'],
      metadata: {
        product_id,
        buyer_id,
        seller_id: product.seller_id
      }
    });

    // Create transaction record
    const transaction = await Transaction.create({
      buyer_id,
      seller_id: product.seller_id,
      product_id,
      amount: product.price,
      payment_method,
      stripe_payment_intent_id: paymentIntent.id
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      client_secret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is involved in this transaction
    if (transaction.buyer_id !== req.user.id && transaction.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this transaction' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, metadata } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Only buyer can confirm delivery, seller can mark as delivered
    if (status === 'completed' && transaction.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only buyer can confirm completion' });
    }

    if (status === 'delivered' && transaction.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Only seller can mark as delivered' });
    }

    const updatedTransaction = await Transaction.updateStatus(id, status, metadata);

    // If transaction is completed, increment seller's sales count
    if (status === 'completed') {
      await User.incrementSales(transaction.seller_id);
    }

    res.json({
      message: 'Transaction status updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'all', 'purchases', 'sales'
    
    const transactions = await Transaction.findByUser(req.user.id, type);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Find transaction by stripe payment intent id
        const query = 'SELECT * FROM transactions WHERE stripe_payment_intent_id = $1';
        const result = await pool.query(query, [paymentIntent.id]);
        
        if (result.rows[0]) {
          await Transaction.updateStatus(result.rows[0].id, 'paid');
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        const failedQuery = 'SELECT * FROM transactions WHERE stripe_payment_intent_id = $1';
        const failedResult = await pool.query(failedQuery, [failedPayment.id]);
        
        if (failedResult.rows[0]) {
          await Transaction.updateStatus(failedResult.rows[0].id, 'failed');
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};