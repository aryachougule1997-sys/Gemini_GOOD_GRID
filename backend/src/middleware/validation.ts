import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

/**
 * User registration validation schema
 */
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  
  characterData: Joi.object({
    baseSprite: Joi.string().valid('DEFAULT', 'CASUAL', 'PROFESSIONAL', 'CREATIVE').required(),
    colorPalette: Joi.object({
      primary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
      secondary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
      accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required()
    }).required(),
    accessories: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid('HAT', 'GLASSES', 'CLOTHING', 'TOOL', 'BADGE_DISPLAY').required(),
      unlockCondition: Joi.string().required()
    })).default([]),
    unlockedItems: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      category: Joi.string().required(),
      unlocked: Joi.boolean().required()
    })).default([])
  }).required(),
  
  locationData: Joi.object({
    coordinates: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required()
    }).required(),
    currentZone: Joi.string().required(),
    discoveredDungeons: Joi.array().items(Joi.string()).default([])
  }).required()
});

/**
 * User login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Profile update validation schema
 */
export const updateProfileSchema = Joi.object({
  characterData: Joi.object({
    baseSprite: Joi.string().valid('DEFAULT', 'CASUAL', 'PROFESSIONAL', 'CREATIVE'),
    colorPalette: Joi.object({
      primary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
      secondary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
      accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/)
    }),
    accessories: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid('HAT', 'GLASSES', 'CLOTHING', 'TOOL', 'BADGE_DISPLAY').required(),
      unlockCondition: Joi.string().required()
    })),
    unlockedItems: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      category: Joi.string().required(),
      unlocked: Joi.boolean().required()
    }))
  }),
  
  locationData: Joi.object({
    coordinates: Joi.object({
      x: Joi.number(),
      y: Joi.number()
    }),
    currentZone: Joi.string(),
    discoveredDungeons: Joi.array().items(Joi.string())
  })
}).min(1); // At least one field must be provided for update

/**
 * Task creation validation schema
 */
export const taskCreationSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description must not exceed 2000 characters',
      'any.required': 'Description is required'
    }),
  
  category: Joi.string()
    .valid('FREELANCE', 'COMMUNITY', 'CORPORATE')
    .messages({
      'any.only': 'Category must be FREELANCE, COMMUNITY, or CORPORATE'
    }),
  
  dungeonId: Joi.string().uuid().allow(null),
  organizationId: Joi.string().uuid().allow(null),
  
  requirements: Joi.object({
    skills: Joi.array()
      .items(Joi.string().min(1))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one skill must be specified',
        'any.required': 'Skills are required'
      }),
    
    trustScoreMin: Joi.number()
      .min(0)
      .max(1000)
      .default(0)
      .messages({
        'number.min': 'Trust score minimum cannot be negative',
        'number.max': 'Trust score minimum cannot exceed 1000'
      }),
    
    timeCommitment: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Time commitment must be positive',
        'any.required': 'Time commitment is required'
      }),
    
    location: Joi.string().allow(''),
    level: Joi.number().min(1).max(100),
    specificBadges: Joi.array().items(Joi.string())
  }).required(),
  
  rewards: Joi.object({
    xp: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'XP reward must be positive',
        'any.required': 'XP reward is required'
      }),
    
    trustScoreBonus: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Trust score bonus cannot be negative',
        'any.required': 'Trust score bonus is required'
      }),
    
    rwisPoints: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'RWIS points cannot be negative',
        'any.required': 'RWIS points are required'
      }),
    
    badges: Joi.array().items(Joi.string()),
    payment: Joi.number().positive()
  }).required(),
  
  deadline: Joi.date().greater('now').allow(null)
});

/**
 * Task application validation schema
 */
export const taskApplicationSchema = Joi.object({
  applicationMessage: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Application message must not exceed 1000 characters'
    })
});

/**
 * Task search validation schema
 */
export const taskSearchSchema = Joi.object({
  category: Joi.string().valid('FREELANCE', 'COMMUNITY', 'CORPORATE'),
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED'),
  dungeonId: Joi.string().uuid(),
  creatorId: Joi.string().uuid(),
  organizationId: Joi.string().uuid(),
  minTrustScore: Joi.number().min(0),
  maxTrustScore: Joi.number().min(0),
  skills: Joi.string(), // Comma-separated skills
  location: Joi.string(),
  minReward: Joi.number().min(0),
  maxReward: Joi.number().min(0),
  deadlineBefore: Joi.date(),
  deadlineAfter: Joi.date(),
  searchText: Joi.string().max(200),
  sortBy: Joi.string().valid('created_at', 'deadline', 'trust_score', 'xp_reward'),
  sortOrder: Joi.string().valid('ASC', 'DESC'),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0)
});

/**
 * Organization registration validation schema
 */
export const organizationRegistrationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Organization name must be at least 2 characters long',
      'string.max': 'Organization name must not exceed 200 characters',
      'any.required': 'Organization name is required'
    }),
  
  description: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 2000 characters'
    }),
  
  contactEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid contact email address',
      'any.required': 'Contact email is required'
    }),
  
  website: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    })
});

/**
 * Organization update validation schema
 */
export const organizationUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .messages({
      'string.min': 'Organization name must be at least 2 characters long',
      'string.max': 'Organization name must not exceed 200 characters'
    }),
  
  description: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 2000 characters'
    }),
  
  contactEmail: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid contact email address'
    }),
  
  website: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    })
}).min(1); // At least one field must be provided for update

/**
 * Organization rating validation schema
 */
export const organizationRatingSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must not exceed 5',
      'any.required': 'Rating is required'
    }),
  
  feedback: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Feedback must not exceed 1000 characters'
    }),
  
  taskId: Joi.string().uuid().allow(null)
});

/**
 * Validation middleware functions
 */
export const validateOrganizationData = validate(organizationRegistrationSchema);
export const validateOrganizationUpdate = validate(organizationUpdateSchema);
export const validateOrganizationRating = validate(organizationRatingSchema);
export const validateTaskCreation = validate(taskCreationSchema);
export const validateTaskApplication = validate(taskApplicationSchema);
export const validateTaskSearch = (req: Request, res: Response, next: NextFunction) => {
  const { error } = taskSearchSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};