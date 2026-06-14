import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as cartService from "../services/cartService";
import { CART_ACTIONS, cartInitialState, cartReducer } from "./cartReducer";
import { socket } from "../services/socketService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);
  const [posClientName, setPosClientName] = useState(null);

  const { isAuth, user } = useAuth();

  const getTotalItems = useCallback(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items],
  );
  
  const getSubtotal = useCallback(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items],
  );

  const getTax = useCallback(
    () => getSubtotal() * 0.16,
    [getSubtotal],
  );

  const getTotalPrice = useCallback(
    () => getSubtotal() + getTax(),
    [getSubtotal, getTax],
  );

  const isSocketUpdate = useRef(false);

  useEffect(() => {
    const handleSyncCart = (newCartItems) => {
      isSocketUpdate.current = true;
      dispatch({ type: CART_ACTIONS.INIT, payload: newCartItems });
    };

    const handleSyncClient = (clientName) => {
      setPosClientName(clientName);
    };

    socket.on('sync-pos-cart', handleSyncCart);
    socket.on('sync-pos-client', handleSyncClient);

    return () => {
      socket.off('sync-pos-cart', handleSyncCart);
      socket.off('sync-pos-client', handleSyncClient);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
    
    if (!isSocketUpdate.current) {
      socket.emit('pos-cart-update', state.items);
    } else {
      isSocketUpdate.current = false;
    }
  }, [state.items]);

  const prevIsAuthRef = useRef(isAuth);
  useEffect(() => {
    if (prevIsAuthRef.current && !isAuth) {
      dispatch({ type: CART_ACTIONS.CLEAR });
    }
    prevIsAuthRef.current = isAuth;
  }, [isAuth]);

  useEffect(() => {
    const initializeCart = async () => {
      if (isAuth && user?._id) {
        const isEmployee = user.role === "Cajero" || user.role === "Administrador";
        
        if (isEmployee) {
          dispatch({ type: CART_ACTIONS.CLEAR });
          return;
        }

        try {
          const backendCart = await cartService.getCart(user._id);
          if (backendCart?.items) {
            dispatch({ type: CART_ACTIONS.INIT, payload: backendCart.items });
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    initializeCart();
  }, [isAuth, user]);

  const syncToBackend = useCallback(
    async (syncFn) => {
      if (!isAuth) return;
      
      const isEmployee = user?.role === "Cajero" || user?.role === "Administrador";
      if (isEmployee) {
        return;
      }

      try {
        await syncFn();
      } catch (error) {
        console.error("Error sincronizando carrito:", error);
      }
    },
    [isAuth, user],
  );

  const removeFromCart = useCallback(
    (productId) => {
      dispatch({ type: CART_ACTIONS.REMOVE, payload: productId });

      syncToBackend(async () => {
        await cartService.removeToCart(user._id, productId);
      });
    },
    [syncToBackend, user],
  );

  const updateQuantity = useCallback(
    (productId, newQuantity) => {
      dispatch({
        type: CART_ACTIONS.SET_QTY,
        payload: { _id: productId, quantity: newQuantity },
      });

      syncToBackend(async () => {
        await cartService.updateCartItem(user._id, productId, newQuantity);
      });
    },
    [syncToBackend, user],
  );

  const addToCart = useCallback(
    (product, quantity = 1) => {
      dispatch({ type: CART_ACTIONS.ADD, payload: { ...product, quantity } });

      syncToBackend(async () => {
        await cartService.addToCart(user._id, product._id, quantity);
      });
    },
    [syncToBackend, user],
  );

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR });

    syncToBackend(async () => {
      await cartService.clearCart(user._id);
    });
  }, [syncToBackend, user]);

  const value = useMemo(
    () => ({
      cartItems: state.items,
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getTotalPrice(),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getSubtotal,
      getTax,
      getTotalPrice,
      posClientName,
    }),
    [
      state.items,
      getSubtotal,
      getTax,
      getTotalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      posClientName,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe ser usado dentro de CartProvider");
  return context;
}
