import { http } from "./http";

// export const getProducts = async ()=>{
//     // User.findOne({name}).then(user=>{
//     //   Orders.find({userId:user.id}).then(orders=>{
//     //   })
//     // })

//     // try {
//     //   const user = await User.findOne({name});

//     //   const orders = await Orders.find({userId: user.id})
//     // } catch (error) {

//     // }

//     try {

//         const response = await fetch(BASE_URL);
//         if (!response.ok) {
//             console.log('error al hacer la petición');
//             throw new Error('');
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.log(error);
//         throw new Error(error);
//     }
//     finally{

//     }
// }

const mapProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    name: p.nombre || p.name || "",
    price: p.precio !== undefined ? p.precio : (p.price !== undefined ? p.price : 0),
    description: p.descripcion || p.description || "",
    category: p.categoria || p.category || "Otros",
    imagesUrl: p.imagesUrl || (p.imagen ? [p.imagen] : [])
  };
};

export const getProducts = async (page, limit) => {
  try {
    const response = await http.get("products", { params: { page, limit } });
    const data = response.data;
    
    if (Array.isArray(data)) {
      return data.map(mapProduct);
    } else if (data && Array.isArray(data.products)) {
      return {
        ...data,
        products: data.products.map(mapProduct)
      };
    } else if (data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map(mapProduct)
      };
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await http.get(`products/${id}`);
    const data = response.data;
    return mapProduct(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await http.post("products", {
      nombre: productData.name,
      precio: Number(productData.price),
      categoria: productData.category,
      stock: Number(productData.stock),
      descripcion: productData.description,
      imagen: productData.imagen
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await http.put(`products/${id}`, {
      nombre: productData.name,
      precio: Number(productData.price),
      categoria: productData.category,
      stock: Number(productData.stock),
      descripcion: productData.description,
      imagen: productData.imagen
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await http.post("products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await http.delete(`products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
