const Order = require('../models/Order');
const Product = require('../models/Product');

class OrderController {
  
  // 📊 Listar pedidos com filtros
  async listOrders(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        paymentStatus,
        searchEmail,
        searchName,
        sortBy = '-createdAt',
        fromDate,
        toDate
      } = req.query;

      const filter = {};

      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      
      if (searchEmail) filter['customer.email'] = { $regex: searchEmail, $options: 'i' };
      if (searchName) filter['customer.name'] = { $regex: searchName, $options: 'i' };
      
      if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = new Date(fromDate);
        if (toDate) filter.createdAt.$lte = new Date(toDate);
      }

      const skip = (page - 1) * limit;
      
      const orders = await Order.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Order.countDocuments(filter);

      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📋 Obter detalhes do pedido
  async getOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate('items.productId');
      
      if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✏️ Atualizar status do pedido
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const order = await Order.findByIdAndUpdate(
        id,
        { status, adminNotes, ...(status === 'cancelled' && { cancelledAt: new Date() }) },
        { new: true }
      );

      res.json({ message: 'Pedido atualizado', order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 💾 Criar pedido manualmente (ou via webhook)
  async createOrder(req, res) {
    try {
      const {
        customer,
        items,
        shippingAddress,
        subtotal,
        shipping = 0,
        discount = 0,
        total,
        payment,
        shippingMethod = 'moto_boy',
        source = 'api'
      } = req.body;

      // Gerar ID único
      const externalReference = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const order = new Order({
        orderId: req.body.orderId || externalReference,
        externalReference,
        customer,
        items,
        shippingAddress,
        subtotal,
        shipping,
        discount,
        total,
        payment,
        shipping_method: shippingMethod,
        source,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      await order.save();

      res.status(201).json({ message: 'Pedido criado', order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📊 Dashboard - Estatísticas
  async getDashboardStats(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      
      const dateFilter = {};
      if (fromDate || toDate) {
        dateFilter.createdAt = {};
        if (fromDate) dateFilter.createdAt.$gte = new Date(fromDate);
        if (toDate) dateFilter.createdAt.$lte = new Date(toDate);
      }

      // Total de vendas
      const totalOrders = await Order.countDocuments(dateFilter);
      
      // Revenue
      const revenueData = await Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const revenue = revenueData[0]?.total || 0;

      // Pedidos por status
      const ordersByStatus = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Pagamentos por método
      const paymentMethods = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$payment.method', count: { $sum: 1 } } }
      ]);

      // Últimos 7 dias
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const dailySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        totalOrders,
        revenue,
        ordersByStatus,
        paymentMethods,
        dailySales
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔄 Cancelar pedido
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findByIdAndUpdate(
        id,
        { 
          status: 'cancelled', 
          cancelledAt: new Date(),
          adminNotes: reason 
        },
        { new: true }
      );

      // TODO: Reembolsar no Mercado Pago
      // TODO: Devolver estoque

      res.json({ message: 'Pedido cancelado', order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();