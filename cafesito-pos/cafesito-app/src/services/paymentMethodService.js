import { http } from "./http";

export const getPaymentMethods = async () => {
  try {
    const response = await http.get("payment-methods/my-methods");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
};

export const createPaymentMethod = async (paymentData) => {
  try {
    const response = await http.post("payment-methods", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
};

export const updatePaymentMethod = async (id, paymentData) => {
  try {
    const response = await http.put(`payment-methods/${id}`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
};

export const deletePaymentMethod = async (id) => {
  try {
    const response = await http.delete(`payment-methods/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
};

export const setDefaultPaymentMethod = async (id) => {
  try {
    const response = await http.patch(`payment-methods/${id}/default`);
    return response.data;
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
};
