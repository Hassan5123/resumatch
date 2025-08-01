const UserModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
    register: async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;
            
            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const newUser = new UserModel({
                email,
                password: hashedPassword,
                firstName,
                lastName
            });
            
            await newUser.save();
            
            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            return res.status(201).json({ token });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            
            const existingUser = await UserModel.findOne({ email });
            if (!existingUser) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController;