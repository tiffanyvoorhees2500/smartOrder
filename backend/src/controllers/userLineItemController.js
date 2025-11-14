'use strict'

const { UserLineItem } = require('../models');

exports.saveCurrentOrderUserLineItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body; // quantity is the new pending quantity to set
        const userId = req.user.id; 

        // Look for an existing UserLineItem for this user and product without an adminOrderId
        let lineItem = await UserLineItem.findOne({
            where: {
                userId,
                productId,
                adminOrderId: null,
            }
        });

        if (quantity === 0) {
            // If quantity is zero, delete the line item if it exists
            if (lineItem) {
                await lineItem.destroy();
                return res.status(200).json({ message: 'Line item deleted' });
            }
            return res.status(200).json({ message: 'No line item to delete' });
        }
        
        if (!lineItem) {
            // Create a new UserLineItem if none exists for this current order
            lineItem = await UserLineItem.create({
                userId,
                productId,
                quantity: quantity,
                pendingQuantity: null, 
                adminOrderId: null,
            });
            return res.status(201).json({ message: 'Line item created', lineItem });

        } else {
            // If found, update the existing UserLineItem
            await lineItem.update({
                quantity: quantity,
                pendingQuantity: null, // Clear pendingQuantity after saving
            });

            return res.status(201).json({ message: 'Line item updated', lineItem });
        }
    } catch (error) {
        console.error('Error saving current order user line item:', error);
        return res.status(500).json({ message: 'Internal server error' });  
    }
}

exports.updatePendingQuantity = async (req, res) => {
    try {
        const { productId, pendingQuantity } = req.body; 
        const userId = req.user.id;

        // Find existing UserLineItem for this user and product without an adminOrderId
        let lineItem = await UserLineItem.findOne({
            where: { userId, productId, adminOrderId: null },
        });

        if (!lineItem) {
            // If no line item exists, create one with quantity 0 and set pendingQuantity
            lineItem = await UserLineItem.create({
                userId,
                productId,
                quantity: 0,
                pendingQuantity,
                adminOrderId: null,
            });
        } else {
            // Update the pendingQuantity of the existing line item
            await lineItem.update({ pendingQuantity });
        }

        return res.status(200).json({ message: 'Pending quantity updated', lineItem });
    } catch (error) {
        console.error('Error updating pending quantity:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};