export const validatePayment = (values) => {
  const errors = {};

  if (!values?.cardNumber?.trim() || values.cardNumber.trim().length !== 16)
    errors.cardNumber = "Escribe un número de tarjeta válido";

  if (!values?.placeHolder?.trim() || values.placeHolder.trim().length < 10)
    errors.placeHolder = "Escribe nombre de titular válido";

  if (!values?.expiryDate?.trim() || values.expiryDate.trim().length !== 5) {
    errors.expiryDate = "La fecha de expiración no es válida";
  } else {
    const date = values.expiryDate.split("/"); // [12,26]
    const currentYear = new Date().getFullYear().toString().slice(-2);
    if (Number(date[0]) > 12 || Number(date[0]) < 1)
      errors.expiryDate = "El mes en la fecha de expiración no es válido";
    else if (Number(date[1]) < Number(currentYear))
      errors.expiryDate = "El año en la fecha de expiración no es válido";
  }

  if (!values?.cvv?.trim() || values.cvv.trim().length !== 3) {
    errors.cvv = "Escribe un cvv válido";
  } else if (isNaN(values.cvv)) {
    errors.cvv = "El cvv debe contener solo números válidos";
  }

  return errors;
};
