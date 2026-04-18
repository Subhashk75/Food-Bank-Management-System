const connection = require('../config/connection');
const { Product } = require('../models/Product');
const {Category} = require('../models/Category')

connection.on('error', (err) => console.error(err));

const mockCategories = [
    { name: 'Grains' },
    { name: 'Dairy' },
    { name: 'Vegetables' },
    { name: 'Fruits' },
    { name: 'Protein' },
    { name: 'Beverages' }
];

const mockProducts = [
    { name: 'Rice', description: 'White rice', quantity: 100 },
    { name: 'Milk', description: 'Whole milk', quantity: 50 },
    { name: 'Carrots', description: 'Fresh carrots', quantity: 75 },
    { name: 'Apples', description: 'Red apples', quantity: 60 },
    { name: 'Chicken', description: 'Boneless chicken breast', quantity: 40 }
];

connection.once('open', async () => {
    console.log('Connected to database');
    try {
        await Product.deleteMany();
        await Category.deleteMany();

        const createdCategories = await Category.insertMany(mockCategories);

        // Assign products to categories dynamically
        const categoryMap = {};
        createdCategories.forEach(cat => categoryMap[cat.name] = cat._id);

        const productsWithCategory = mockProducts.map((product, index) => ({
            ...product,
            category: categoryMap[Object.keys(categoryMap)[index]]
        }));

        const createdProducts = await Product.insertMany(productsWithCategory);

        // console.log('Created Categories:', createdCategories);
        // console.log('Created Products:', createdProducts);
        
        // console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit(0);
    }
});
