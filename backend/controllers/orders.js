const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Create Order (Checkout / Place Order)
// POST /api/orders
// req.body: { shippingAddress }
exports.placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is incomplete',
        data: null
      });
    }

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
        data: null
      });
    }

    // 2. Validate stock and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const book = item.book;
      if (!book || book.isDeleted) {
        return res.status(400).json({
          success: false,
          message: `Book "${item.book ? item.book.title : 'Unknown'}" is no longer available`,
          data: null
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}, Requested: ${item.quantity}`,
          data: null
        });
      }

      // Add to order items (taking snapshot of title and price)
      orderItems.push({
        book: book._id,
        title: book.title,
        quantity: item.quantity,
        price: book.price
      });

      totalAmount += book.price * item.quantity;
    }

    // 3. Decrement Book.stock for each item
    for (const item of cart.items) {
      const book = item.book;
      book.stock -= item.quantity;
      await book.save();
    }

    // 4. Create the order (paymentStatus: 'paid' as checkout simulates payment)
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      paymentStatus: 'paid', // Simulate payment as per spec
      shippingAddress
    });

    await order.save();

    // 5. Clear the user's Cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get order history for current logged-in user
// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Order history fetched successfully',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Get single order details
// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    // Security check: only allow admin or the user who placed the order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this order details',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order details fetched successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Order
// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    // Security check: only allow user who placed it, or admin
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        data: null
      });
    }

    // Only allow cancellation if pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status "${order.status}"`,
        data: null
      });
    }

    // Restore Book.stock for each item in the order
    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    order.status = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded'; // Refund if simulated payment was paid
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled and stock restored successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders (Admin)
exports.adminGetAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'All orders fetched for admin',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id (Admin)
// req.body: { status, trackingNumber }
exports.adminUpdateOrder = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    if (status !== undefined) order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
