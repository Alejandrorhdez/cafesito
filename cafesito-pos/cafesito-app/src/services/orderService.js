import { http } from "./http";

const mapOrder = (o) => {
  if (!o) return o;
  
  const items = (o.productos || []).map(p => {
    const productData = p.producto || {};
    const name = productData.nombre || productData.name || "Producto";
    const price = p.precio || p.price || productData.precio || productData.price || 0;
    const quantity = p.cantidad || p.quantity || 1;
    return {
      _id: p._id,
      product: {
        _id: productData._id,
        name: name,
        price: productData.precio || productData.price || price || 0
      },
      name: name,
      quantity: quantity,
      price: price,
      subtotal: parseFloat((price * quantity).toFixed(2))
    };
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = parseFloat((subtotal * 0.16).toFixed(2));
  const total = o.total || parseFloat((subtotal + tax).toFixed(2));


  const paymentMethod = typeof o.metodoPago === "string"
    ? { alias: o.metodoPago }
    : o.paymentMethod || { alias: o.metodoPago || "Efectivo" };

  return {
    ...o,
    id: o._id,
    status: o.estado || o.status || "Pendiente",
    items: items,
    date: o.createdAt || o.date || new Date().toISOString(),
    subtotal,
    tax,
    total,
    eliminadoAdmin: o.eliminadoAdmin || false,
    paymentMethod
  };
};

export const createOrder = async (orderData) => {
  try {
    // Convert frontend properties back to backend schema if needed
    const backendOrderData = {
      usuario: orderData.userId || orderData.usuario,
      nombreInvitado: orderData.nombreInvitado,
      productos: (orderData.items || []).map(item => ({
        producto: item._id,
        cantidad: item.quantity,
        precio: item.price
      })),
      total: orderData.total,
      metodoPago: orderData.paymentMethod?.alias || orderData.metodoPago || "Efectivo"
    };

    const response = await http.post("orders", backendOrderData);
    return mapOrder(response.data?.orden || response.data);
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getMyOrders = async (userId, page = 1, limit = 10) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch orders");
    }
    const response = await http.get(`orders/user/${userId}`, {
      params: { page, limit },
    });
    const data = response.data;
    if (Array.isArray(data)) {
      return data.map(mapOrder);
    } else if (data && Array.isArray(data.orders)) {
      return {
        ...data,
        orders: data.orders.map(mapOrder)
      };
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await http.get(`orders/${orderId}`);
    return mapOrder(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllOrders = async (page = 1, limit = 50) => {
  try {
    const response = await http.get(`orders`, {
      params: { page, limit },
    });
    const data = response.data;
    if (Array.isArray(data)) {
      return data.map(mapOrder);
    } else if (data && Array.isArray(data.orders)) {
      return {
        ...data,
        orders: data.orders.map(mapOrder)
      };
    }
    return data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await http.put(`orders/${orderId}`, { estado: status });
    return mapOrder(response.data?.orden || response.data);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const hideOrderFromAdmin = async (orderId) => {
  try {
    const response = await http.put(`orders/${orderId}`, { eliminadoAdmin: true });
    return mapOrder(response.data?.orden || response.data);
  } catch (error) {
    console.error("Error hiding order from admin:", error);
    throw error;
  }
};

export const hideAllOrdersFromAdmin = async () => {
  try {
    const response = await http.put("orders/hide-all");
    return response.data;
  } catch (error) {
    console.error("Error hiding all orders from admin:", error);
    throw error;
  }
};
