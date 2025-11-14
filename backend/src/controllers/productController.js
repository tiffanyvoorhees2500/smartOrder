'use strict';
const db = require('../models');
const { Product, Ingredient } = db;
exports.getUserProductList = async (req, res) => {
    try {
        const userPricing = req.user.pricingType;
        
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
            .map(i => `${i.ingredient} [${i.number_label} ${i.string_label})`)
            .join(', ');
            
            return {
                id: product.id,
                name: product.name,
                price: Number(userPricing === 'Retail' ? product.retail : product.wholesale),
                description: description
            };
        });


        res.status(200).json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

  