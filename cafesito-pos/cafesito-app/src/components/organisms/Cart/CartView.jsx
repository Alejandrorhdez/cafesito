import { useCart } from "../../../context/CartContext";
import { Button, Icon } from "../../atoms";
import "./CartView.css";

export default function CartView() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="cart-view">
      <div className="cart-view-header">
        <h2 data-testid="cart-count">
          {cartItems.length} {cartItems.length === 1 ? "artículo" : "artículos"}
        </h2>
      </div>

      {cartItems &&
        cartItems.map((item) => (
          <div className="cart-item" key={item._id} data-testid="cart-item">
            <div className="cart-item-image">
              <img src={item.imagesUrl[0]} alt={item.name} loading="lazy" />
            </div>

            <div className="cart-item-info">
              <h3 data-testid="cart-item-name">{item.name}</h3>
              <p className="cart-item-price">{`$${item.price.toFixed(2)}`}</p>
            </div>

            <div className="cart-item-quantity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                data-testid="decrease-qty-btn"
              >
                <Icon name="minus" size={15}></Icon>
              </Button>
              <span data-testid="cart-item-quantity">{item.quantity}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                data-testid="increase-qty-btn"
              >
                <Icon name="plus" size={15}></Icon>
              </Button>
            </div>

            <div className="cart-item-total" data-testid="cart-item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>

            <Button
              variant="ghost"
              className="danger"
              size="sm"
              onClick={() => removeFromCart(item._id)}
              title="Eliminar artículo"
              data-testid="remove-item-btn"
            >
              <Icon name="trash" size={16} />
            </Button>
          </div>
        ))}
    </div>
  );
}
