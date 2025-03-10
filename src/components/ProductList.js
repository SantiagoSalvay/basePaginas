import { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiStar, FiX, FiCheck, FiAlertTriangle } from "react-icons/fi";
import Image from "next/image";

const ProductList = ({ products, onProductDeleted, onProductUpdated }) => {
  const [filter, setFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Obtener todas las categorías únicas
  const categories = ["all", ...new Set(Object.keys(products))];
  
  // Filtrar productos por categoría
  const filteredProducts = filter === "all" 
    ? Object.values(products).flat() 
    : products[filter] || [];

  // Verificar si un producto es estático (ID en rangos específicos)
  const isStaticProduct = (id) => {
    // Los productos estáticos tienen IDs en rangos específicos:
    // Camisas: 1001-1999
    // Pantalones: 2001-2999
    // Vestidos: 3001-3999
    // Etc.
    return (
      (id >= 1001 && id <= 1999) || // Camisas
      (id >= 2001 && id <= 2999) || // Pantalones
      (id >= 3001 && id <= 3999) || // Vestidos
      (id >= 4001 && id <= 4999) || // Chaquetas
      (id >= 5001 && id <= 5999)    // Accesorios
    );
  };
  
  // Manejar la eliminación de un producto
  const handleDelete = async (id) => {
    if (isStaticProduct(id)) {
      setError("No se pueden eliminar productos estáticos del catálogo");
      setTimeout(() => setError(""), 3000);
      setIsDeleting(null);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el producto");
      }
      
      setSuccess("Producto eliminado correctamente");
      
      // Notificar al componente padre
      if (onProductDeleted) {
        onProductDeleted(id);
      }
      
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
      setIsDeleting(null);
    }
  };
  
  // Manejar la edición de un producto
  const handleEdit = (product) => {
    if (isStaticProduct(product.id)) {
      setError("No se pueden editar productos estáticos del catálogo");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setEditingProduct({ ...product });
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: name === "price" || name === "rating" ? parseFloat(value) : value
    });
  };
  
  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingProduct),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar el producto");
      }
      
      const updatedProduct = await response.json();
      setSuccess("Producto actualizado correctamente");
      
      // Notificar al componente padre
      if (onProductUpdated) {
        onProductUpdated(updatedProduct);
      }
      
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
      setEditingProduct(null);
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Productos ({filteredProducts.length})
      </h2>
      
      {/* Mensajes de éxito y error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-700">
            <FiX size={18} />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-green-700">
            <FiX size={18} />
          </button>
        </div>
      )}
      
      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              filter === category
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-indigo-900"
            }`}
          >
            {category === "all" ? "Todos" : category}
          </button>
        ))}
      </div>
      
      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay productos en esta categoría
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valoración
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <motion.tr 
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={isStaticProduct(product.id) ? "bg-gray-50 dark:bg-gray-900/30" : ""}
                >
                  {editingProduct && editingProduct.id === product.id ? (
                    // Modo de edición
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative rounded-md overflow-hidden">
                            <img 
                              src={editingProduct.image} 
                              alt={editingProduct.name}
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40?text=Error";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <input
                              type="text"
                              name="name"
                              value={editingProduct.name}
                              onChange={handleEditChange}
                              className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
                            />
                            <textarea
                              name="description"
                              value={editingProduct.description || ""}
                              onChange={handleEditChange}
                              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full mt-1"
                              rows="2"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="category"
                          value={editingProduct.category}
                          onChange={handleEditChange}
                          className="px-2 py-1 text-xs leading-5 font-semibold rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                        >
                          {categories.filter(c => c !== "all").map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          name="price"
                          value={editingProduct.price}
                          onChange={handleEditChange}
                          min="0"
                          step="0.01"
                          className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-20"
                        />
                        <span className="ml-1">€</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="rating"
                          value={editingProduct.rating || 0}
                          onChange={handleEditChange}
                          className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        >
                          {[0, 1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} {rating === 1 ? "estrella" : "estrellas"}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          <FiCheck size={18} />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <FiX size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    // Modo de visualización
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative rounded-md overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40?text=Error";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {product.price.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <FiStar
                              key={index}
                              className={`w-4 h-4 ${
                                index < (product.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isDeleting === product.id ? (
                          // Confirmación de eliminación
                          <>
                            <span className="text-red-600 dark:text-red-400 mr-2 text-xs">¿Eliminar?</span>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-2"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button 
                              onClick={() => setIsDeleting(null)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        ) : (
                          // Botones normales
                          <>
                            <button 
                              onClick={() => handleEdit(product)}
                              className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 ${
                                isStaticProduct(product.id) ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              title={isStaticProduct(product.id) ? "No se pueden editar productos estáticos" : "Editar producto"}
                            >
                              <FiEdit size={18} />
                            </button>
                            <button 
                              onClick={() => setIsDeleting(product.id)}
                              className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${
                                isStaticProduct(product.id) ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              title={isStaticProduct(product.id) ? "No se pueden eliminar productos estáticos" : "Eliminar producto"}
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
