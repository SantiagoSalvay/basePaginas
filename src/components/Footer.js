import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from "react-icons/fa";
import { useCurrency } from "../context/CurrencyContext";

const Footer = () => {
  const { t } = useCurrency();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Marca */}
          <div>
            <h3 className="text-2xl font-display font-bold mb-4">ModaVista</h3>
            <p className="text-gray-400 mb-6">
              Descubre la elegancia en cada detalle
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Pinterest"
              >
                <FaPinterest size={24} />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Inicio
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/coleccion">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Productos
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/nosotros">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Nosotros
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contacto">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Contacto
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Términos y Condiciones
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacidad">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Política de Privacidad
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Preguntas Frecuentes
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Boletín */}
          <div>
            <h4 className="text-lg font-bold mb-4">Boletín Informativo</h4>
            <p className="text-gray-400 mb-4">
              Suscríbete para recibir las últimas novedades y ofertas exclusivas
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Correo electrónico"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-md transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} ModaVista. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
