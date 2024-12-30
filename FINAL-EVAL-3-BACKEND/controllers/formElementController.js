// controllers/formElementController.js
import FormElement from '../models/FormElements.js';
import Formbot from '../models/Formbot.js';

const formElementController = {
  addFormElements: async (req, res) => {
    try {
      const { formbotId } = req.params;
      const { elements } = req.body;

      const formbot = await Formbot.findById(formbotId);
      if (!formbot) {
        return res.status(404).json({ message: 'Formbot not found' });
      }

      const createdElements = await FormElement.insertMany(
        elements.map((element, index) => ({
          ...element,
          formbot: formbotId,
          order: index
        }))
      );

      formbot.elements = [...formbot.elements, ...createdElements.map(el => el._id)];
      await formbot.save();

      res.status(201).json(createdElements);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getFormElements: async (req, res) => {
    try {
      const { formbotId } = req.params;
      const elements = await FormElement.find({ formbot: formbotId })
        .sort('order');
      res.json(elements);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateFormElement: async (req, res) => {
    try {
      const { formbotId, elementId } = req.params;
      const updates = req.body;

      const element = await FormElement.findOneAndUpdate(
        { _id: elementId, formbot: formbotId },
        updates,
        { new: true }
      );

      if (!element) {
        return res.status(404).json({ message: 'Element not found' });
      }

      res.json(element);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteFormElement: async (req, res) => {
    try {
      const { formbotId, elementId } = req.params;

      const element = await FormElement.findOneAndDelete({
        _id: elementId,
        formbot: formbotId
      });

      if (!element) {
        return res.status(404).json({ message: 'Element not found' });
      }

      // Remove element from formbot's elements array
      await Formbot.findByIdAndUpdate(formbotId, {
        $pull: { elements: elementId }
      });

      res.json({ message: 'Element deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getExistingElementIds: async (req, res) => {
    try {
      const { formbotId } = req.params;

      const elements = await FormElement.find(
        { formbot: formbotId },
        { _id: 1 }
      );

      res.json(elements.map(el => el._id));
    } catch (error) {
      console.error('Error fetching element IDs:', error);
      res.status(500).json({ error: 'Failed to fetch element IDs' });
    }
  },

  reorderElements: async (req, res) => {
    try {
      const { formbotId } = req.params;
      const { elementIds } = req.body;

      // Update order for each element
      await Promise.all(
        elementIds.map((elementId, index) =>
          FormElement.findOneAndUpdate(
            { _id: elementId, formbot: formbotId },
            { order: index }
          )
        )
      );

      const updatedElements = await FormElement.find({ formbot: formbotId })
        .sort('order');

      res.json(updatedElements);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export default formElementController;
