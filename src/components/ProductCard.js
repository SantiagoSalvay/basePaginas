import Image from "next/image";
import { motion } from "framer-motion";
import { FiShoppingBag, FiHeart } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const { name, price, image, category, id } = product;
  const { data: session } = useSession();
  const router = useRouter();

  // Función para determinar la URL de la imagen
  const getImageUrl = (imageUrl) => {
    // Si la imagen comienza con http o https, es una URL externa
    if (imageUrl.startsWith('http')) {
      return `${imageUrl}?auto=format&q=80&fit=crop&w=500&h=600`;
    }
    // Si no, es una imagen subida localmente
    return imageUrl;
  };

  // Función para verificar si el usuario está autenticado
  const checkAuthentication = (action) => {
    if (!session) {
      toast.info("Debes iniciar sesión para continuar", {
        position: "top-center",
        autoClose: 3000,
      });
      router.push("/auth/signin");
      return false;
    }
    return true;
  };

  // Función para agregar al carrito
  const addToCart = () => {
    if (checkAuthentication("carrito")) {
      // Aquí iría la lógica para agregar al carrito
      toast.success(`${name} agregado al carrito`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Función para agregar a favoritos
  const addToFavorites = () => {
    if (checkAuthentication("favoritos")) {
      // Aquí iría la lógica para agregar a favoritos
      toast.success(`${name} agregado a favoritos`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl card group relative"
    >
      <div className="relative h-80 w-full overflow-hidden">
        <Image
          src={getImageUrl(image)}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white px-3 py-1 m-2 rounded-full text-sm">
          {category}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              className="p-3 bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
              aria-label="Add to cart"
              onClick={addToCart}
            >
              <FiShoppingBag className="text-primary-600" size={20} />
            </button>
            <button
              className="p-3 bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
              aria-label="Add to wishlist"
              onClick={addToFavorites}
            >
              <FiHeart className="text-primary-600" size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{`€${price.toFixed(2)}`}</p>
        </div>
        
        {/* Estrellas - Movidas a su propia sección */}
        <div className="flex items-center mt-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= 4 ? "text-yellow-500" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(24)</span>
        </div>
        
        {/* Unique Product ID Badge */}
        <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          ID: {id}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
