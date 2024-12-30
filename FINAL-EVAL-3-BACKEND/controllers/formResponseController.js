// controllers/formResponseController.js
import FormResponse from '../models/FormResponse.js'; // Update paths as per your structure
import FormAnalytics from '../models/FormAnalytics.js';

const formResponseController = {
  // Start tracking a new form response
  startFormResponse: async (req, res) => {
    try {
      const { formId } = req.params;

      // Create new response entry
      const response = await FormResponse.create({
        formId,
        status: 'started',
      });

      // Update analytics
      await FormAnalytics.findOneAndUpdate(
        { formId },
        { $inc: { startCount: 1 } },
        { upsert: true }
      );

      res.json({ responseId: response._id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start form response tracking' });
    }
  },

  // Update form response
  updateFormResponse: async (req, res) => {
    try {
      const { responseId } = req.params;
      const { responses, status } = req.body;

      const formResponse = await FormResponse.findById(responseId);

      if (!formResponse) {
        return res.status(404).json({ error: 'Response not found' });
      }

      // Update response data
      formResponse.responses = responses;
      formResponse.lastActiveAt = new Date();

      // If completing the form
      if (status === 'completed' && formResponse.status !== 'completed') {
        formResponse.status = 'completed';
        formResponse.completedAt = new Date();

        // Update completion analytics
        await FormAnalytics.findOneAndUpdate(
          { formId: formResponse.formId },
          { $inc: { completionCount: 1 } }
        );
      }

      await formResponse.save();
      res.json(formResponse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update form response' });
    }
  },

  // Track form view
  trackFormView: async (req, res) => {
    try {
      const { formId } = req.params;

      await FormAnalytics.findOneAndUpdate(
        { formId },
        { $inc: { viewCount: 1 } },
        { upsert: true }
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track form view' });
    }
  },

  // Get form analytics
  getFormAnalytics: async (req, res) => {
    try {
      const { formId } = req.params;

      const analytics = await FormAnalytics.findOne({ formId });
      const responses = await FormResponse.find({
        formId,
        status: 'completed',
      })
        .sort('-completedAt')
        .limit(10);

      // Calculate completion rate
      const completionRate =
        analytics.startCount > 0
          ? ((analytics.completionCount / analytics.startCount) * 100).toFixed(1)
          : 0;

      res.json({
        viewCount: analytics.viewCount,
        startCount: analytics.startCount,
        completionCount: analytics.completionCount,
        completionRate,
        recentResponses: responses,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  // Get form responses
  getFormResponses: async (req, res) => {
    try {
      const { formId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const query = { formId };
      if (status) {
        query.status = status;
      }

      const responses = await FormResponse.find(query)
        .sort('-startedAt')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await FormResponse.countDocuments(query);

      res.json({
        responses,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch responses' });
    }
  }
};

export default formResponseController;
