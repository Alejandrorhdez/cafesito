export const paymentInitialValues = {
  cardNumber: "",
  placeHolder: "",
  expiryDate: "",
  cvv: "",
  default: false,
};

export const hasErrors = (errors) => {
  const walk = (obj) =>
    Object.values(obj).some((v) =>
      v && typeof v === "object" ? walk(v) : Boolean(v),
    );
  return walk(errors);
};
