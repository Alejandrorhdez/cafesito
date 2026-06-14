import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { Badge, Button } from "../../atoms";
import "./ProductCard.css";

export default function ProductCard({ product, orientation = "vertical" }) {
  const { addToCart } = useCart();
  const { name, price, stock, imagesUrl, description } = product || {};

  if (!product) {
    return (
      <div
        className="product-card product-card-unavailable"
      >
        <p className="muted">Producto no disponible</p>
      </div>
    );
  }

  const stockBadge =
    stock > 0
      ? { text: "Disponible", variant: "success" }
      : { text: "No disponible", variant: "error" };
  const hasDiscount = product.discount && product.discount > 0;
  const handleAddToCart = () => addToCart(product, 1);
  const productLink = `/product/${product._id}`;
  const cardClass = `product-card product-card--${orientation}`;

  return (
    <div className={cardClass} data-testid="product-card">
      <Link to={productLink} className="product-card-image-link">
        <img
          src={imagesUrl && imagesUrl.length > 0 ? imagesUrl[0] : (product.imagen || "/img/products/placeholder.svg")}
          alt={name}
          className="product-card-image"
          onError={(event) => {
            event.target.src = "/img/products/placeholder.svg";
          }}
        />
      </Link>
      <div className="product-card-content">
        {product.category && (
          <span className="product-card-category product-card-category-ext">
            {product.category}
          </span>
        )}
        <h3 className="product-card-title">
          <Link
            to={productLink}
            className="product-card-title-link"
          >
            {name}
          </Link>
        </h3>
        {description && (
          <p
            className="muted product-card-description"
          >
            {description.length > 60
              ? `${description.substring(0, 60)}...`
              : description}
          </p>
        )}
        <div className="product-card-price">${price}</div>
      </div>
      <div className="product-card-actions">
        <div className="product-card-badges">
          <Badge text={stockBadge.text} variant={stockBadge.variant} />
          {hasDiscount && (
            <Badge text={`-${product.discount}%`} variant="warning" />
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={stock === 0}
          onClick={handleAddToCart}
          data-testid="add-to-cart-btn"
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
