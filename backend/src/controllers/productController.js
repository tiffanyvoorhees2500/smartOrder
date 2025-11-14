'use strict';

const db = require('../models');
const { Product, Ingredient, UserLineItem } = db;
exports.getUserProductList = async (req, res) => {
    try {
        const userPricing = req.user.pricingType;
        const userId = req.user.id;
        const currentAdminOrderId = null; // current order has no adminOrderId
        
        // Fetch products that are not discontinued
        const products = await Product.findAll({
            where: {
                discontinued: false
            },
            attributes: [
                'id',
                'name',
                'retail', 
                'wholesale', 
                'discontinued', 
                'number_in_bottle', 
                'original_id'
            ],
            include: [
                {
                    model: Ingredient,
                    as: 'ingredients',  
                    attributes: ['ingredient', 'number_label', 'string_label']
                },
                {
                    model: UserLineItem,
                    as: 'userLineItems',
                    where: {
                        userId: userId, 
                        adminOrderId: currentAdminOrderId,
                    },
                    required: false, // include even if no matching line items
                    attributes: [
                        'quantity',
                        'basePrice',
                        'percentOff',
                        'finalPrice',
                        'pendingQuantity', 'saveForLater'
                    ],
                }
            ],
            order: [['name', 'ASC']],
        });

        const formattedProducts = products.map(product => {
            // Sort ingredients alphabetically
            const sortedIngredients = product.ingredients.sort((a, b) => 
                a.ingredient.localeCompare(b.ingredient)
            );

            const description = sortedIngredients
            .map(i => `${i.ingredient} [${i.number_label} ${i.string_label}]`)
            .join(', ');
            
            // Extract UserLineItem details if exists
            const uli = product.userLineItems[0] || {};
            const quantity = uli.pendingQuantity ?? uli.quantity ?? null; // current saved quantity
            const originalQuantity = uli.quantity ?? null; // original quantity
            const pendingQuantity = uli.pendingQuantity ?? 0; // pending quantity
            
            return {
                id: product.id,
                name: product.name,
                price: Number(userPricing === 'Retail' ? product.retail : product.wholesale),
                description,
                quantity,
                originalQuantity,
                pendingQuantity,
            };
        });
    
        res.status(200).json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

  