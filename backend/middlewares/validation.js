import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

export const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    avatar: Joi.string().uri().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createProduct: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('accounts', 'skins', 'giftcards', 'services').required(),
    game: Joi.string().required(),
    images: Joi.array().items(Joi.string().uri()).min(1).required(),
    condition: Joi.string().valid('new', 'used', 'excellent').required(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  updateProduct: Joi.object({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    price: Joi.number().positive().optional(),
    condition: Joi.string().valid('new', 'used', 'excellent').optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  createTransaction: Joi.object({
    product_id: Joi.string().uuid().required(),
    payment_method: Joi.string().valid('card', 'pix', 'paypal').required()
  })
};