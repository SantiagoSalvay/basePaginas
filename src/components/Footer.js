import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold mb-4">ModaVista</h3>
            <p className="text-gray-400 mb-6">
              Diseños exclusivos que transforman tu imagen y elevan tu presencia.
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

          {/* Quick Links */}
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
                    Colección
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
                    Términos de Servicio
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
                <Link href="/cookies">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Política de Cookies
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/devoluciones">
                  <span className="text-gray-400 hover:text-white transition-colors">
                    Política de Devoluciones
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-4">Suscríbete</h4>
            <p className="text-gray-400 mb-4">
              Recibe nuestras novedades y ofertas exclusivas.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} ModaVista. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
