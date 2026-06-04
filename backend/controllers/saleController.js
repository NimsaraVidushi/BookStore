const Sale = require('../models/Sale');
const Book = require('../models/Book');

exports.createSale = async (req, res) => {
  try {
    const { bookId, quantity, paymentMethod, notes } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check quantity
    if (book.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    const totalPrice = book.price * quantity;

    const sale = new Sale({
      userId: req.user.id,
      bookId,
      quantity,
      unitPrice: book.price,
      totalPrice,
      paymentMethod,
      notes
    });

    // Update book quantity
    book.quantity -= quantity;
    await book.save();

    await sale.save();

    res.status(201).json({
      message: 'Sale created successfully',
      sale
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSaleHistory = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      filter.status = status;
    }

    const sales = await Sale.find(filter)
      .populate('userId', 'username email')
      .populate('bookId', 'title author')
      .sort({ saleDate: -1 });

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserSaleHistory = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id })
      .populate('bookId', 'title author price')
      .sort({ saleDate: -1 });

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('userId', 'username email phone address')
      .populate('bookId', 'title author isbn');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = { status: 'Completed' };

    if (startDate && endDate) {
      filter.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Sale.find(filter);

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    res.status(200).json({
      totalSales,
      totalRevenue,
      averageOrderValue,
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSaleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json({
      message: 'Sale status updated successfully',
      sale
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
