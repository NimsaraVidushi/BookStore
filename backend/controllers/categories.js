const Category = require('../models/Category');
const Book = require('../models/Book');

// GET /api/categories (Public)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/categories (Admin)
exports.adminGetAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'All categories fetched for admin',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
        data: null
      });
    }

    const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
        data: null
      });
    }

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/categories/:id (Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    if (name) {
      // Check if name is already taken by another category
      const nameExists = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name is already taken',
          data: null
        });
      }
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/categories/:id (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    // Check if any books are associated with this category
    const bookCount = await Book.countDocuments({ category: categoryId, isDeleted: false });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${bookCount} active books associated with it.`,
        data: null
      });
    }

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
