import userModel from '../models/userModel.js';

export const getUserData = async (req, res) => {
    try {
        // get the actual id string (support body.userId, middleware-set req.userId or req.user)
        const userId = req.body?.userId || req.userId || req.user?.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'UserId not provided' });
        }

        const user = await userModel.findById(userId).select('-password -verifyOtp -resetOtp -resetOtpExpiry');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.json({
            success: true,
            userData: {
                name: user.username,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};