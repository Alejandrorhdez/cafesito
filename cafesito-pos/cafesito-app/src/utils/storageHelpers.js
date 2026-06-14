export const STORAGE_KEYS = {
  payments: "paymentMethods",
  orders: "orders",
};

const parseBooleanFlag = (primary, secondary) => {
  if (typeof primary === "boolean") return primary;
  if (typeof secondary === "boolean") return secondary;
  return false;
};

export const readLocalJSON = (key) => {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`No se pudo parsear ${key} desde localStorage`, error);
    return null;
  }
};

export const writeLocalJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const normalizePayment = (pay, idx = 0) => {
  if (!pay) {
    return null;
  }
  const generatedId = `pay-${Date.now()}-${idx}`;
  const id = pay.id || pay._id || generatedId;
  const cardNumber = pay.cardNumber || "";
  const alias = pay.alias || `Tarjeta ****${cardNumber.slice(-4)}`;
  const placeHolder =
    pay.placeHolder || pay.cardHolderName || pay.cardHolder || "";
  const expireDate = pay.expireDate || pay.expiryDate || "";
  const isDefault = parseBooleanFlag(pay.isDefault, pay.default);

  return {
    ...pay,
    id,
    alias,
    cardNumber,
    placeHolder,
    expireDate,
    isDefault,
    default: isDefault,
  };
};

export const STORAGE = STORAGE_KEYS;
