// In routes/userRoutes.js
router.delete('/profile/delete-image', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.profilePicture) {
      // Optional: delete the actual file from disk if stored locally
      user.profilePicture = '';
      await user.save();
      res.json({ message: 'Profile picture deleted successfully' });
    } else {
      res.status(400).json({ error: 'No profile picture to delete' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
