import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Helper function to convert string to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is group admin
const requireGroupAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { groupId } = req.params;
  const groupIdObj = toObjectId(groupId);
  
  if (!groupIdObj) {
    return res.status(400).json({ error: 'Invalid group ID' });
  }
  
  const group = await Group.findById(groupIdObj);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const isGroupAdmin = String(group.adminId) === String(req.user._id);
  const isAppAdmin = req.user.role === 'admin';
  
  if (!isGroupAdmin && !isAppAdmin) {
    return res.status(403).json({ error: 'Group admin access required' });
  }
  
  next();
};

// ==========================================
// PUBLIC ROUTES (Available to all authenticated users)
// ==========================================

// Get all active groups (users can see available groups)
router.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    
    const groups = await Group.find({ isActive: true })
      .populate('adminId', 'username email profilePicture')
      .populate('members.userId', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    // Convert ObjectIds to strings and add member count and membership status
    const groupsWithCounts = groups.map(group => {
      const isMember = group.members?.some(m => String(m.userId?._id || m.userId) === String(userId));
      const isGroupAdmin = String(group.adminId?._id || group.adminId) === String(userId);
      
      return {
        ...group,
        adminId: group.adminId?._id?.toString() || group.adminId?.toString(),
        adminName: group.adminId?.username || 'Unknown',
        memberCount: group.members?.length || 0,
        isMember: isMember || isGroupAdmin,
        isGroupAdmin: isGroupAdmin,
        members: group.members?.map(m => ({
          ...m,
          userId: m.userId?._id?.toString() || m.userId?.toString(),
          username: m.userId?.username || 'Unknown'
        })) || [],
        internshipOpportunities: group.internshipOpportunities?.map(opp => ({
          ...opp,
          postedBy: opp.postedBy?.toString()
        })) || [],
        workflowUpdates: group.workflowUpdates?.map(update => ({
          ...update,
          createdBy: update.createdBy?.toString()
        })) || []
      };
    });

    res.json(groupsWithCounts);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get user's joined groups
router.get('/api/groups/my', authenticateToken, async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    
    const groups = await Group.find({ 
      isActive: true,
      'members.userId': userId
    })
      .populate('adminId', 'username email profilePicture')
      .populate('members.userId', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    const groupsWithCounts = groups.map(group => ({
      ...group,
      adminId: group.adminId?._id?.toString() || group.adminId?.toString(),
      adminName: group.adminId?.username || 'Unknown',
      memberCount: group.members?.length || 0,
      isAdmin: String(group.adminId?._id || group.adminId) === String(userId),
      members: group.members?.map(m => ({
        ...m,
        userId: m.userId?._id?.toString() || m.userId?.toString(),
        username: m.userId?.username || 'Unknown'
      })) || [],
      internshipOpportunities: group.internshipOpportunities?.map(opp => ({
        ...opp,
        postedBy: opp.postedBy?.toString()
      })) || [],
      workflowUpdates: group.workflowUpdates?.map(update => ({
        ...update,
        createdBy: update.createdBy?.toString()
      })) || []
    }));

    res.json(groupsWithCounts);
  } catch (err) {
    console.error('Error fetching user groups:', err);
    res.status(500).json({ error: 'Failed to fetch your groups' });
  }
});

// Get single group details
router.get('/api/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj)
      .populate('adminId', 'username email profilePicture')
      .populate('members.userId', 'username email profilePicture')
      .lean();

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members?.some(m => String(m.userId?._id || m.userId) === String(userId));
    const isAdmin = String(group.adminId?._id || group.adminId) === String(userId);
    const isAppAdmin = req.user.role === 'admin';

    const response = {
      ...group,
      adminId: group.adminId?._id?.toString() || group.adminId?.toString(),
      adminName: group.adminId?.username || 'Unknown',
      memberCount: group.members?.length || 0,
      isMember: isMember || isAdmin || isAppAdmin,
      isGroupAdmin: isAdmin || isAppAdmin,
      members: group.members?.map(m => ({
        ...m,
        userId: m.userId?._id?.toString() || m.userId?.toString(),
        username: m.userId?.username || 'Unknown',
        email: m.userId?.email || ''
      })) || [],
      internshipOpportunities: group.internshipOpportunities?.map(opp => ({
        ...opp,
        postedBy: opp.postedBy?.toString()
      })) || [],
      workflowUpdates: group.workflowUpdates?.map(update => ({
        ...update,
        createdBy: update.createdBy?.toString()
      })) || [],
      internshipHistory: group.internshipHistory?.map(opp => ({
        ...opp,
        postedBy: opp.postedBy?.toString()
      })) || [],
      updateHistory: group.updateHistory?.map(update => ({
        ...update,
        createdBy: update.createdBy?.toString()
      })) || []
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching group:', err);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// Join a group (public groups only)
router.post('/api/groups/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check privacy settings
    if (group.privacy === 'private') {
      return res.status(403).json({ error: 'This group is private. You need an invite to join.' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members?.some(m => String(m.userId) === String(userId));
    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Add user to group
    group.members.push({
      userId: userId,
      joinedAt: new Date(),
      role: 'member'
    });
    await group.save();

    // Update user's groups array
    await User.findByIdAndUpdate(userId, {
      $push: {
        groups: {
          groupId: groupIdObj,
          joinedAt: new Date(),
          role: 'member'
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Successfully joined the group',
      groupId: group._id,
      groupName: group.name
    });
  } catch (err) {
    console.error('Error joining group:', err);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Join group via invite code
router.post('/api/groups/join', authenticateToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = toObjectId(req.user._id);

    if (!inviteCode || inviteCode.trim().length === 0) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const group = await Group.findOne({ 
      inviteCode: inviteCode.toUpperCase(),
      isActive: true 
    });

    if (!group) {
      return res.status(404).json({ error: 'Invalid invite code or group not found' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members?.some(m => String(m.userId) === String(userId));
    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Add user to group
    group.members.push({
      userId: userId,
      joinedAt: new Date(),
      role: 'member'
    });
    await group.save();

    // Update user's groups array
    await User.findByIdAndUpdate(userId, {
      $push: {
        groups: {
          groupId: group._id,
          joinedAt: new Date(),
          role: 'member'
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Successfully joined the group!',
      groupId: group._id,
      groupName: group.name
    });
  } catch (err) {
    console.error('Error joining group via code:', err);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave a group
router.post('/api/groups/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the admin
    if (String(group.adminId) === String(userId)) {
      return res.status(400).json({ error: 'Admin cannot leave the group. Transfer admin rights first or delete the group.' });
    }

    // Check if user is a member
    const memberIndex = group.members?.findIndex(m => String(m.userId) === String(userId));
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    // Remove user from group
    group.members.splice(memberIndex, 1);
    await group.save();

    // Update user's groups array
    await User.findByIdAndUpdate(userId, {
      $pull: {
        groups: { groupId: groupIdObj }
      }
    });

    res.json({ 
      success: true, 
      message: 'Successfully left the group',
      groupId: group._id
    });
  } catch (err) {
    console.error('Error leaving group:', err);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// ==========================================
// GROUP ADMIN ROUTES (Group admin can manage their group)
// ==========================================

// Generate shareable invite code
router.post('/api/groups/:groupId/invite', authenticateToken, requireGroupAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Generate new invite code if doesn't exist
    if (!group.inviteCode) {
      group.inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
      await group.save();
    }

    res.json({
      success: true,
      message: 'Invite code generated',
      inviteCode: group.inviteCode,
      inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups/join?code=${group.inviteCode}`
    });
  } catch (err) {
    console.error('Error generating invite:', err);
    res.status(500).json({ error: 'Failed to generate invite code' });
  }
});

// Regenerate invite code
router.post('/api/groups/:groupId/invite/regenerate', authenticateToken, requireGroupAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Generate new invite code
    group.inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    await group.save();

    res.json({
      success: true,
      message: 'Invite code regenerated',
      inviteCode: group.inviteCode,
      inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups/join?code=${group.inviteCode}`
    });
  } catch (err) {
    console.error('Error regenerating invite:', err);
    res.status(500).json({ error: 'Failed to regenerate invite code' });
  }
});

// Get privacy settings
router.get('/api/groups/:groupId/privacy', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isGroupAdmin = String(group.adminId) === String(userId);
    const isAppAdmin = req.user.role === 'admin';

    res.json({
      privacy: group.privacy,
      inviteCode: (isGroupAdmin || isAppAdmin) ? group.inviteCode : null,
      allowPublicJoin: group.allowPublicJoin,
      isAdmin: isGroupAdmin || isAppAdmin
    });
  } catch (err) {
    console.error('Error fetching privacy settings:', err);
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
});

// Update privacy settings
router.put('/api/groups/:groupId/privacy', authenticateToken, requireGroupAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { privacy, allowPublicJoin } = req.body;
    const groupIdObj = toObjectId(groupId);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Update privacy settings
    if (privacy && ['public', 'private', 'invite-only'].includes(privacy)) {
      group.privacy = privacy;
    }
    if (allowPublicJoin !== undefined) {
      group.allowPublicJoin = allowPublicJoin;
    }

    // If making group private, clear invite code
    if (privacy === 'private') {
      group.inviteCode = null;
    }

    // If making group public or invite-only, generate invite code if doesn't exist
    if ((privacy === 'public' || privacy === 'invite-only') && !group.inviteCode) {
      group.inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    await group.save();

    res.json({
      success: true,
      message: 'Privacy settings updated',
      privacy: group.privacy,
      inviteCode: group.inviteCode,
      allowPublicJoin: group.allowPublicJoin
    });
  } catch (err) {
    console.error('Error updating privacy settings:', err);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Get old/historical details
router.get('/api/groups/:groupId/history', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj)
      .populate('internshipHistory.postedBy', 'username email')
      .populate('updateHistory.createdBy', 'username email')
      .lean();

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      internshipHistory: group.internshipHistory?.map(opp => ({
        ...opp,
        postedBy: opp.postedBy?._id?.toString() || opp.postedBy?.toString(),
        postedByName: opp.postedBy?.username || 'Unknown'
      })) || [],
      updateHistory: group.updateHistory?.map(update => ({
        ...update,
        createdBy: update.createdBy?._id?.toString() || update.createdBy?.toString(),
        createdByName: update.createdBy?.username || 'Unknown'
      })) || []
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ==========================================
// ADMIN ROUTES (Only admin can create/manage groups)
// ==========================================

// Create a new group (Available to all authenticated users)
router.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, privacy, allowPublicJoin, members } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const adminIdObj = toObjectId(req.user._id);
    
    // Generate invite code for non-public groups
    let inviteCode = null;
    if (privacy !== 'public') {
      inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    // Prepare members array - start with admin as first member
    const membersArray = [{
      userId: adminIdObj,
      joinedAt: new Date(),
      role: 'admin'
    }];

    // If additional members are provided, validate and add them
    if (members && Array.isArray(members) && members.length > 0) {
      // Validate that all user IDs exist
      const validUserIds = [];
      for (const userId of members) {
        const userIdObj = toObjectId(userId);
        if (userIdObj) {
          const userExists = await User.exists({ _id: userIdObj });
          if (userExists) {
            validUserIds.push(userIdObj);
          }
        }
      }

      // Add validated users as members (excluding admin who is already added)
      for (const userIdObj of validUserIds) {
        if (String(userIdObj) !== String(adminIdObj)) {
          membersArray.push({
            userId: userIdObj,
            joinedAt: new Date(),
            role: 'member'
          });
        }
      }
    }

    // Create group with admin as first member
    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      privacy: privacy || 'public',
      inviteCode: inviteCode,
      allowPublicJoin: allowPublicJoin !== false,
      adminId: adminIdObj,
      members: membersArray,
      isActive: true
    });

    // Add group to admin's groups array
    await User.findByIdAndUpdate(adminIdObj, {
      $push: {
        groups: {
          groupId: group._id,
          joinedAt: new Date(),
          role: 'admin'
        }
      }
    });

    // Add group to all members' groups arrays
    const memberUserIds = membersArray
      .filter(m => String(m.userId) !== String(adminIdObj))
      .map(m => m.userId);
    
    if (memberUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberUserIds } },
        { $push: { groups: { groupId: group._id, joinedAt: new Date(), role: 'member' } } }
      );
    }

    // Populate and return
    await group.populate('adminId', 'username email profilePicture');
    await group.populate('members.userId', 'username email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: {
        ...group.toObject(),
        adminId: group.adminId?._id?.toString() || group.adminId?.toString(),
        memberCount: group.members?.length || 0
      }
    });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group details (Admin only)
router.put('/api/groups/:groupId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, isActive } = req.body;
    const groupIdObj = toObjectId(groupId);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Update fields
    if (name && name.trim()) group.name = name.trim();
    if (description !== undefined) group.description = description;
    if (isActive !== undefined) group.isActive = isActive;
    group.updatedAt = new Date();

    await group.save();

    res.json({
      success: true,
      message: 'Group updated successfully',
      group: {
        ...group.toObject(),
        adminId: group.adminId?.toString(),
        memberCount: group.members?.length || 0
      }
    });
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete a group (Admin only)
router.delete('/api/groups/:groupId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdObj = toObjectId(groupId);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove group from all members' groups array
    const memberIds = group.members?.map(m => m.userId) || [];
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { groups: { groupId: groupIdObj } } }
    );

    // Delete the group
    await Group.findByIdAndDelete(groupIdObj);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Add internship opportunity (Admin only)
router.post('/api/groups/:groupId/internships', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, company, description, requirements, location, duration, stipend, applyLink } = req.body;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Internship title is required' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Add internship opportunity
    const internship = {
      title: title.trim(),
      company: company || '',
      description: description || '',
      requirements: requirements || [],
      location: location || '',
      duration: duration || '',
      stipend: stipend || '',
      applyLink: applyLink || '',
      postedBy: userId,
      postedAt: new Date(),
      isActive: true
    };

    group.internshipOpportunities.push(internship);
    group.updatedAt = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      message: 'Internship opportunity added',
      internship: {
        ...internship,
        postedBy: userId.toString(),
        _id: group.internshipOpportunities[group.internshipOpportunities.length - 1]._id
      }
    });
  } catch (err) {
    console.error('Error adding internship:', err);
    res.status(500).json({ error: 'Failed to add internship opportunity' });
  }
});

// Archive internship (move to history)
router.delete('/api/groups/:groupId/internships/:internshipId/archive', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId, internshipId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const internshipIdObj = toObjectId(internshipId);

    if (!groupIdObj || !internshipIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const internshipIndex = group.internshipOpportunities.findIndex(
      i => i._id.toString() === internshipIdObj.toString()
    );

    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship opportunity not found' });
    }

    // Move to history
    const internship = group.internshipOpportunities[internshipIndex];
    internship.isActive = false;
    internship.archivedAt = new Date();
    
    group.internshipHistory.push(internship);
    group.internshipOpportunities.splice(internshipIndex, 1);
    
    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'Internship moved to history'
    });
  } catch (err) {
    console.error('Error archiving internship:', err);
    res.status(500).json({ error: 'Failed to archive internship' });
  }
});

// Update internship opportunity (Admin only)
router.put('/api/groups/:groupId/internships/:internshipId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId, internshipId } = req.params;
    const { title, company, description, requirements, location, duration, stipend, applyLink, isActive } = req.body;
    
    const groupIdObj = toObjectId(groupId);
    const internshipIdObj = toObjectId(internshipId);

    if (!groupIdObj || !internshipIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const internshipIndex = group.internshipOpportunities.findIndex(
      i => i._id.toString() === internshipIdObj.toString()
    );

    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship opportunity not found' });
    }

    // Update internship
    const internship = group.internshipOpportunities[internshipIndex];
    if (title) internship.title = title;
    if (company !== undefined) internship.company = company;
    if (description !== undefined) internship.description = description;
    if (requirements) internship.requirements = requirements;
    if (location !== undefined) internship.location = location;
    if (duration !== undefined) internship.duration = duration;
    if (stipend !== undefined) internship.stipend = stipend;
    if (applyLink !== undefined) internship.applyLink = applyLink;
    if (isActive !== undefined) internship.isActive = isActive;

    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'Internship updated successfully',
      internship: {
        ...internship.toObject(),
        postedBy: internship.postedBy?.toString()
      }
    });
  } catch (err) {
    console.error('Error updating internship:', err);
    res.status(500).json({ error: 'Failed to update internship opportunity' });
  }
});

// Delete internship opportunity (Admin only)
router.delete('/api/groups/:groupId/internships/:internshipId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId, internshipId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const internshipIdObj = toObjectId(internshipId);

    if (!groupIdObj || !internshipIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const initialLength = group.internshipOpportunities.length;
    group.internshipOpportunities = group.internshipOpportunities.filter(
      i => i._id.toString() !== internshipIdObj.toString()
    );

    if (group.internshipOpportunities.length === initialLength) {
      return res.status(404).json({ error: 'Internship opportunity not found' });
    }

    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'Internship opportunity deleted'
    });
  } catch (err) {
    console.error('Error deleting internship:', err);
    res.status(500).json({ error: 'Failed to delete internship opportunity' });
  }
});

// Add workflow update (Admin only)
router.post('/api/groups/:groupId/updates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, content, category, priority } = req.body;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Update title is required' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Update content is required' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Add workflow update
    const update = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      priority: priority || 'normal',
      createdBy: userId,
      createdAt: new Date()
    };

    group.workflowUpdates.push(update);
    group.updatedAt = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      message: 'Workflow update added',
      update: {
        ...group.workflowUpdates[group.workflowUpdates.length - 1].toObject(),
        createdBy: userId.toString()
      }
    });
  } catch (err) {
    console.error('Error adding update:', err);
    res.status(500).json({ error: 'Failed to add workflow update' });
  }
});

// Archive update (move to history)
router.delete('/api/groups/:groupId/updates/:updateId/archive', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId, updateId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const updateIdObj = toObjectId(updateId);

    if (!groupIdObj || !updateIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const updateIndex = group.workflowUpdates.findIndex(
      u => u._id.toString() === updateIdObj.toString()
    );

    if (updateIndex === -1) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Move to history
    const update = group.workflowUpdates[updateIndex];
    update.archivedAt = new Date();
    
    group.updateHistory.push(update);
    group.workflowUpdates.splice(updateIndex, 1);
    
    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'Update moved to history'
    });
  } catch (err) {
    console.error('Error archiving update:', err);
    res.status(500).json({ error: 'Failed to archive update' });
  }
});

// Delete workflow update (Admin only)
router.delete('/api/groups/:groupId/updates/:updateId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId, updateId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const updateIdObj = toObjectId(updateId);

    if (!groupIdObj || !updateIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const initialLength = group.workflowUpdates.length;
    group.workflowUpdates = group.workflowUpdates.filter(
      u => u._id.toString() !== updateIdObj.toString()
    );

    if (group.workflowUpdates.length === initialLength) {
      return res.status(404).json({ error: 'Update not found' });
    }

    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'Workflow update deleted'
    });
  } catch (err) {
    console.error('Error deleting update:', err);
    res.status(500).json({ error: 'Failed to delete workflow update' });
  }
});

// Remove member from group (Admin only)
router.delete('/api/groups/:groupId/members/:memberId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const memberIdObj = toObjectId(memberId);

    if (!groupIdObj || !memberIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if trying to remove admin
    if (String(group.adminId) === String(memberIdObj)) {
      return res.status(400).json({ error: 'Cannot remove admin from the group' });
    }

    const memberIndex = group.members?.findIndex(
      m => m.userId.toString() === memberIdObj.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    // Remove member
    const removedMember = group.members.splice(memberIndex, 1)[0];
    await group.save();

    // Update user's groups array
    await User.findByIdAndUpdate(memberIdObj, {
      $pull: { groups: { groupId: groupIdObj } }
    });

    res.json({
      success: true,
      message: 'Member removed from group'
    });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Failed to remove member from group' });
  }
});

// ==========================================
// GROUP MESSAGING ROUTES
// ==========================================

// Send a message to a group
router.post('/api/groups/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, type, fileUrl, fileName, fileSize, interests } = req.body;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = group.members?.some(m => String(m.userId) === String(userId));
    const isGroupAdmin = String(group.adminId) === String(userId);
    const isAppAdmin = req.user.role === 'admin';

    if (!isMember && !isGroupAdmin && !isAppAdmin) {
      return res.status(403).json({ error: 'You must be a member of this group to send messages' });
    }

    // Determine if this is an introduction message
    const isIntroduction = type === 'introduction';

    // Create message object
    const message = {
      senderId: userId,
      text: text.trim(),
      type: type || 'text',
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      interests: interests || [], // For introduction messages
      isIntroduction: isIntroduction, // Flag for introduction messages
      createdAt: new Date(),
      isPinned: false
    };

    group.messages.push(message);
    group.updatedAt = new Date();
    await group.save();

    // Get the newly created message with populated sender
    const newMessage = group.messages[group.messages.length - 1];
    
    // Populate sender info
    const populatedMessage = {
      ...newMessage.toObject ? newMessage.toObject() : newMessage,
      senderId: {
        _id: userId.toString(),
        username: req.user.username,
        profilePicture: req.user.profilePicture
      }
    };

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('group_message', {
        groupId,
        message: populatedMessage
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageData: populatedMessage
    });
  } catch (err) {
    console.error('Error sending group message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages from a group
router.get('/api/groups/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const groupIdObj = toObjectId(groupId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(groupIdObj)
      .populate('messages.senderId', 'username profilePicture')
      .lean();

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = group.members?.some(m => String(m.userId) === String(userId));
    const isGroupAdmin = String(group.adminId) === String(userId);
    const isAppAdmin = req.user.role === 'admin';

    if (!isMember && !isGroupAdmin && !isAppAdmin) {
      return res.status(403).json({ error: 'You must be a member of this group to view messages' });
    }

    // Get messages (newest first for pagination)
    const allMessages = group.messages || [];
    const sortedMessages = [...allMessages].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

    // Transform messages to have proper sender info
    const messagesWithSender = paginatedMessages.map(msg => ({
      _id: msg._id,
      text: msg.text,
      type: msg.type,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      interests: msg.interests || [],
      isIntroduction: msg.isIntroduction || false,
      isPinned: msg.isPinned,
      createdAt: msg.createdAt,
      senderId: msg.senderId?._id?.toString() || msg.senderId?.toString(),
      senderUsername: msg.senderId?.username || 'Unknown',
      senderProfilePicture: msg.senderId?.profilePicture
    }));

    // Reverse to show oldest first
    messagesWithSender.reverse();

    res.json({
      success: true,
      messages: messagesWithSender,
      totalMessages: allMessages.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(allMessages.length / limit),
      hasMore: endIndex < allMessages.length
    });
  } catch (err) {
    console.error('Error fetching group messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Pin/unpin a message (Admin only)
router.put('/api/groups/:groupId/messages/:messageId/pin', authenticateToken, async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const messageIdObj = toObjectId(messageId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj || !messageIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isGroupAdmin = String(group.adminId) === String(userId);
    const isAppAdmin = req.user.role === 'admin';

    if (!isGroupAdmin && !isAppAdmin) {
      return res.status(403).json({ error: 'Only group admins can pin messages' });
    }

    const messageIndex = group.messages.findIndex(
      m => m._id.toString() === messageIdObj.toString()
    );

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Toggle pin status
    group.messages[messageIndex].isPinned = !group.messages[messageIndex].isPinned;
    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: group.messages[messageIndex].isPinned ? 'Message pinned' : 'Message unpinned',
      isPinned: group.messages[messageIndex].isPinned
    });
  } catch (err) {
    console.error('Error pinning message:', err);
    res.status(500).json({ error: 'Failed to pin message' });
  }
});

// Delete a message (Admin or sender can delete)
router.delete('/api/groups/:groupId/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const groupIdObj = toObjectId(groupId);
    const messageIdObj = toObjectId(messageId);
    const userId = toObjectId(req.user._id);

    if (!groupIdObj || !messageIdObj) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const group = await Group.findById(groupIdObj);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const messageIndex = group.messages.findIndex(
      m => m._id.toString() === messageIdObj.toString()
    );

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is admin or sender
    const message = group.messages[messageIndex];
    const isGroupAdmin = String(group.adminId) === String(userId);
    const isAppAdmin = req.user.role === 'admin';
    const isSender = String(message.senderId) === String(userId);

    if (!isGroupAdmin && !isAppAdmin && !isSender) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Remove message
    group.messages.splice(messageIndex, 1);
    group.updatedAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;

