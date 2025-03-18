const express = require('express');
const router = express.Router();
const User = require('../model/user');


// Submit user form
router.post('/', async (req, res) => {
    try {
        // Create new user
        const user = new User(req.body);

        // Validate before saving
        const validationError = user.validateSync();
        if (validationError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationError.errors
            });
        }

        // Save user
        await user.save();

        return res.status(201).json({
            message: 'User details submitted successfully',
            userId: user._id
        });
    } catch (error) {
        console.error('Error submitting user form:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;