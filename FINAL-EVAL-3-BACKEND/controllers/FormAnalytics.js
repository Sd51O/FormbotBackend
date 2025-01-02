// controllers/formAnalyticsController.js
const FormAnalytics = require('../models/FormAnalytics');
const FormAnalyticsController = {
  updateAnalytics:async (req, res) => {
  try {
    const { formId } = req.params;
    const { type, responses } = req.body;

    let analytics = await FormAnalytics.findOne({ formId });

    if (!analytics) {
      analytics = new FormAnalytics({ formId });
    }

    switch (type) {
      case 'view':
        analytics.views += 1;
        break;
      case 'start':
        analytics.starts += 1;
        break;
      case 'complete':
        analytics.completions += 1;
        if (responses) {
          analytics.responses.push({ data: responses });
        }
        break;
    }

    await analytics.save();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

getAnalytics :async (req, res) => {
  try {
    const { formId } = req.params;
    const analytics = await FormAnalytics.findOne({ formId });

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    const formattedResponses = analytics.responses.map(response => ({
      id: response._id,
      submittedAt: response.submittedAt,
      ...Object.fromEntries(response.data)
    }));

    res.json({
      views: analytics.views,
      starts: analytics.starts,
      completed: analytics.completions,
      completionRate: analytics.starts ? Math.round((analytics.completions / analytics.starts) * 100) : 0,
      submissions: formattedResponses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}};
export default FormAnalyticsController;