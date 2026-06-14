import { useMemo } from "react";
import { Button, Input } from "../../../atoms";
import { useFormReducer } from "../../../../hooks/useFormReducer";
import { paymentInitialValues } from "../../../../forms/paymentModel";
import { validatePayment } from "../../../../forms/paymentValidate";

import "./PaymentForm.css";

const paymentFields = [
  {
    id: "bankName",
    label: "Alias de la tarjeta:",
    name: "bankName",
    placeHolder: "Escribe el nombre del banco / alias de la tarjeta",
    autocomplete: "",
  },
  {
    id: "cardNumber",
    label: "Número de la tarjeta:",
    name: "cardNumber",
    placeHolder: "5444-0000-0000-0000",
    autocomplete: "cc-number",
  },
  {
    id: "placeHolder",
    label: "Nombre del titular de la tarjeta:",
    name: "placeHolder",
    placeHolder: "Juan Pérez",
    autocomplete: "cc-name",
  },
  {
    id: "expiryDate",
    label: "Fecha de expiración:",
    name: "expiryDate",
    placeHolder: "12/31",
    autocomplete: "cc-exp",
  },
  {
    id: "cvv",
    label: "CVV:",
    name: "cvv",
    type: "password",
    maxLength: 4,
    autocomplete: "cc-csc",
  },
];

const PaymentForm = ({
  onSubmit,
  onCancel,
  initialValues = {},
  isEdit = false,
}) => {
  const mergedInitial = useMemo(
    () => ({ ...paymentInitialValues, ...initialValues }),
    [initialValues],
  );

  const form = useFormReducer({
    initialValues: mergedInitial,
    validate: validatePayment,
  });

  const onFormSubmit = (e) => {
    e.preventDefault();

    form.handleSubmit((values) => {
      onSubmit(values);
    });
  };

  return (
    <form className="payment-form" noValidate onSubmit={onFormSubmit}>
      <h3>{isEdit ? "Editar Método de Pago" : "Nuevo Método de Pago"}</h3>

      {paymentFields.map((field) => (
        <Input
          key={field.id}
          id={field.id}
          label={field.label}
          name={field.name}
          type={field.type || "text"}
          placeholder={field.placeHolder}
          autoComplete={field.autocomplete}
          maxLength={field.maxLength}
          value={form.values[field.name] ?? ""}
          onChange={form.onChange}
          onBlur={form.onBlur}
          error={form.getFieldError(field.name)}
          showError={form.isTouched(field.name)}
        />
      ))}

      <div className="form-checkbox">
        <input
          type="checkbox"
          name="default"
          checked={form.values.default || false}
          onChange={form.onChange}
          id="defaultPayment"
        />
        <label htmlFor="defaultPayment">
          Establecer como método de pago predeterminado
        </label>
      </div>

      {form.submitError && <p className="submitError">{form.submitError}</p>}

      <div className="form-actions">
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting
            ? "Guardando..."
            : isEdit
              ? "Guardar Cambios"
              : "Agregar Método de Pago"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default PaymentForm;
