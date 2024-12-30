import Share from '../models/Share.js';

const ShareController = {
  async createShare(req, res) {
    try {
      // Input validation
      const { formbotId, shareToken } = req.body;
      if (!formbotId || !shareToken) {
        return res.status(400).json({
          error: 'Missing required fields: formbotId and shareToken are required'
        });
      }

      // Check if share already exists
      const existingShare = await Share.findOne({ shareToken });
      if (existingShare) {
        return res.status(409).json({
          error: 'Share token already exists'
        });
      }

      // Validate environment variable
      if (!process.env.FRONTEND_URL) {
        console.error('FRONTEND_URL environment variable is not set');
        return res.status(500).json({
          error: 'Server configuration error'
        });
      }

      // Create share with error handling
      const share = await Share.create({
        formbotId,
        shareToken,
        createdAt: new Date(),
      });

      if (!share) {
        return res.status(500).json({
          error: 'Failed to create share record'
        });
      }

      const shareUrl = `${process.env.FRONTEND_URL}/f/${shareToken}`;
      res.json({
        shareUrl,
        shareId: share._id,
        createdAt: share.createdAt
      });
    } catch (error) {
      console.error('Share creation error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Invalid data provided',
          details: error.message
        });
      }
      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(409).json({
          error: 'Share token already exists'
        });
      }
      res.status(500).json({
        error: 'Failed to create share link',
        message: error.message
      });
    }
  },

  async getSharedForm(req, res) {
    try {
      const { shareToken } = req.params;
      
      // Validate share token
      if (!shareToken) {
        return res.status(400).json({
          error: 'Share token is required'
        });
      }

      // First find the share document
      const share = await Share.findOne({ shareToken });

      // If no share found, return specific error
      if (!share) {
        return res.status(404).json({
          error: 'Invalid or expired share link'
        });
      }

      // Then find and populate the form data
      const populatedShare = await Share.findById(share._id)
  .populate({
    path: 'formbotId',
    populate: {
      path: 'elements'
    }
  })
        .lean()
        .exec();

      // If no formbot found after population
      if (!populatedShare?.formbotId) {
        return res.status(404).json({
          error: 'Associated form not found'
        });
      }

      // Add debug logging
      console.log('Share token:', shareToken);
      console.log('Found share:', share);
      console.log('Populated share data:', JSON.stringify(populatedShare, null, 2));

      res.json(populatedShare.formbotId);
    } catch (error) {
      console.error('Share retrieval error:', error);
      res.status(500).json({
        error: 'Failed to get shared form',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
};

export default ShareController;