// ============================================
// SpeedxSafety - Input Validation Middleware
// ============================================
// Reusable, declarative request-body validator.
// Replaces repetitive inline validation across route handlers.

/**
 * Supported rule properties:
 *   required  - field must be present and not undefined
 *   type      - expected typeof value ('string', 'number', 'boolean', 'object')
 *   oneOf     - value must be one of the listed options
 *   min       - minimum value (number) or minimum length (string)
 *   max       - maximum value (number) or maximum length (string)
 *   pattern   - RegExp the string value must match
 *   custom    - function(value) → true | errorMessage string
 *
 * @example
 *   router.post('/', validate({
 *     teen_id:   { required: true, type: 'string' },
 *     type:      { required: true, type: 'string', oneOf: ['speed','geo','crash','curfew','sos'] },
 *     lat:       { type: 'number', min: -90, max: 90 },
 *     lng:       { type: 'number', min: -180, max: 180 },
 *   }), handler);
 */

/**
 * Create validation middleware for the request body.
 *
 * @param {Object<string, Object>} schema – field name → rule object
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // ── Required check ────────────────────────
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`"${field}" is required`);
        continue; // skip further checks for missing fields
      }

      // Skip optional fields that are absent
      if (value === undefined || value === null) continue;

      // ── Type check ────────────────────────────
      if (rules.type && typeof value !== rules.type) {
        errors.push(`"${field}" must be of type ${rules.type}`);
        continue;
      }

      // ── oneOf check ───────────────────────────
      if (rules.oneOf && !rules.oneOf.includes(value)) {
        errors.push(`"${field}" must be one of: ${rules.oneOf.join(', ')}`);
      }

      // ── min / max for numbers ─────────────────
      if (rules.type === 'number' || typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`"${field}" must be >= ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`"${field}" must be <= ${rules.max}`);
        }
      }

      // ── min / max for strings (length) ────────
      if (typeof value === 'string') {
        if (rules.min !== undefined && value.length < rules.min) {
          errors.push(`"${field}" must be at least ${rules.min} characters`);
        }
        if (rules.max !== undefined && value.length > rules.max) {
          errors.push(`"${field}" must be at most ${rules.max} characters`);
        }
      }

      // ── Pattern check ─────────────────────────
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`"${field}" has an invalid format`);
      }

      // ── Custom validator ──────────────────────
      if (rules.custom && typeof rules.custom === 'function') {
        const result = rules.custom(value);
        if (result !== true) {
          errors.push(result || `"${field}" failed custom validation`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: errors.length === 1 ? errors[0] : 'Multiple validation errors',
        details: errors,
      });
    }

    next();
  };
};

/**
 * Validate query-string parameters instead of the body.
 * Same rule format as validate().
 *
 * @param {Object<string, Object>} schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    // Temporarily swap body for query so we reuse the same logic
    const originalBody = req.body;
    req.body = req.query;

    const middleware = validate(schema);
    middleware(req, res, (err) => {
      req.body = originalBody;
      if (err) return next(err);
      next();
    });
  };
};

module.exports = { validate, validateQuery };
