import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiImage, FiPlus } from "react-icons/fi";

const ProductForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Camisas",
    rating: 5,
    image: "",
    sizes: [],
    currency: "ARS" // Siempre en pesos argentinos
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [sizeInput, setSizeInput] = useState("");
  
  const fileInputRef = useRef(null);
  
  const categories = ["Camisas", "Pantalones", "Chaquetas", "Vestidos", "Accesorios"];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" || name === "rating" ? parseFloat(value) : value
    });
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Formato de imagen no válido. Use JPG, PNG, GIF o WEBP.");
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande. El tamaño máximo es 5MB.");
      return;
    }
    
    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Subir archivo
    await uploadFile(file);
  };
  
  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 100);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al subir la imagen");
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      // Actualizar el formulario con la URL de la imagen
      setFormData(prev => ({
        ...prev,
        image: data.url
      }));
      
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
      
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // Validaciones básicas
      if (!formData.name || !formData.price || !formData.image) {
        throw new Error("Por favor complete todos los campos obligatorios");
      }
      
      if (formData.sizes.length === 0) {
        throw new Error("Por favor agregue al menos un talle");
      }
      
      // Asegurarse de que la moneda sea siempre ARS
      const productData = {
        ...formData,
        currency: "ARS" // Forzar moneda a pesos argentinos
      };
      
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear el producto");
      }
      
      const newProduct = await response.json();
      
      // Resetear el formulario
      setFormData({
        name: "",
        price: "",
        category: "Camisas",
        rating: 5,
        image: "",
        sizes: [],
        currency: "ARS"
      });
      setPreviewImage(null);
      
      setSuccess(true);
      
      // Notificar al componente padre
      if (onProductAdded) {
        onProductAdded(newProduct);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la adición de un talle
  const handleAddSize = () => {
    if (!sizeInput.trim()) return;
    
    // Convertir a mayúsculas y verificar si ya existe
    const formattedSize = sizeInput.trim().toUpperCase();
    if (formData.sizes.includes(formattedSize)) {
      setError("Este talle ya ha sido agregado");
      return;
    }
    
    setFormData({
      ...formData,
      sizes: [...formData.sizes, formattedSize]
    });
    
    setSizeInput("");
  };
  
  // Eliminar un talle
  const handleRemoveSize = (sizeToRemove) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(size => size !== sizeToRemove)
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Añadir Nuevo Producto
      </h2>
      
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
          <span>¡Producto añadido con éxito!</span>
          <button onClick={() => setSuccess(false)} className="text-green-700">
            <FiX size={18} />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Nombre del producto */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          {/* Precio (siempre en ARS) */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio (ARS) *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-2">$</span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              El precio se ingresa en Pesos Argentinos
            </p>
          </div>
          
          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Valoración */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valoración (1-5)
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="1"
              max="5"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {/* Talles */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Talles *
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              placeholder="Agregar talle (ej: S, M, L, XL)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus size={18} />
            </button>
          </div>
          
          {formData.sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sizes.map((size) => (
                <div 
                  key={size} 
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full flex items-center"
                >
                  <span className="mr-1">{size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {formData.sizes.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agregue al menos un talle para el producto
            </p>
          )}
        </div>
        
        {/* Subida de imagen */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Imagen del Producto *
          </label>
          
          <div className="mt-1 flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading}
            >
              <FiUpload className="mr-2 -ml-1 h-5 w-5" />
              Subir Imagen
            </button>
            
            <input
              type="hidden"
              name="image"
              value={formData.image}
            />
            
            {isUploading && (
              <div className="ml-4 flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Subiendo: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          
          {(previewImage || formData.image) && (
            <div className="mt-4 relative">
              <div className="relative w-40 h-40 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                <img 
                  src={previewImage || formData.image} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Error";
                  }}
                />
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, image: ""});
                      setPreviewImage(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || isUploading}
            className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors ${
              (loading || isUploading) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Guardando..." : "Guardar Producto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
