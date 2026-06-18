const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Get cart for logged in user
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.book');
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
// POST /api/cart - req.body: { bookId, quantity }
exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    // Verify book exists and is not deleted
    const book = await Book.findOne({ _id: bookId, isDeleted: false });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    // Verify stock
    if (book.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.stock} units available in stock`,
        data: null
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if item already in cart
    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

    if (itemIndex > -1) {
      // Item exists, update quantity
      const newQty = cart.items[itemIndex].quantity + qty;
      
      // Re-verify stock for total quantity
      if (book.stock < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${book.stock} total units available, you already have ${cart.items[itemIndex].quantity} in cart.`,
          data: null
        });
      }

      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = book.price; // Update to latest price
    } else {
      // Item does not exist, add new item
      cart.items.push({
        book: bookId,
        quantity: qty,
        price: book.price
      });
    }

    await cart.save();
    await cart.populate('items.book');

    res.status(200).json({
      success: true,
      message: 'Book added to cart successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Update quantity of an item in cart
// PUT /api/cart/:itemId - req.body: { quantity }
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
        data: null
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        data: null
      });
    }

    // Find item
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
        data: null
      });
    }

    // Verify stock
    const book = await Book.findById(item.book);
    if (!book || book.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Book is no longer available',
        data: null
      });
    }

    if (book.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.stock} units available in stock`,
        data: null
      });
    }

    item.quantity = qty;
    item.price = book.price; // Update price snapshot

    await cart.save();
    await cart.populate('items.book');

    res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Remove one item from cart
// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        data: null
      });
    }

    // Filter out item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
    await cart.populate('items.book');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        data: null
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};
