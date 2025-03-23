# ModaVista - Tu Tienda de Moda Online

ModaVista es una plataforma de comercio electrónico moderna y elegante diseñada para ofrecer la mejor experiencia en compras de moda online. Con una interfaz intuitiva y funcionalidades pensadas para el usuario, ModaVista hace que encontrar y comprar tu ropa favorita sea una experiencia placentera y sin complicaciones.

## ¿Qué puedes hacer en ModaVista?

### 🛍️ Exploración y Compras

- **Navegación Intuitiva**: Explora nuestra amplia colección de productos organizados por categorías, estilos y temporadas.
- **Filtros Avanzados**: Encuentra exactamente lo que buscas utilizando filtros por:
  - Categoría de producto
  - Talla
  - Color
  - Precio
  - Nuevas llegadas
  - Ofertas especiales
- **Vista Detallada de Productos**: Cada producto incluye:
  - Imágenes de alta calidad
  - Descripción detallada
  - Guía de tallas
  - Disponibilidad
  - Valoraciones y reseñas de otros compradores

### 👤 Tu Cuenta Personal

- **Perfil Personalizado**: Gestiona tu información personal y preferencias de compra
- **Historial de Pedidos**: Accede a un registro completo de tus compras anteriores
- **Lista de Deseos**: Guarda tus productos favoritos para comprarlos más tarde
- **Seguimiento de Pedidos**: Mantente informado sobre el estado de tus compras en tiempo real

### ❤️ Lista de Favoritos

- **Guarda tus Productos Preferidos**: Marca los artículos que te gustan para revisarlos después
- **Notificaciones**: Recibe alertas cuando tus productos favoritos:
  - Están en oferta
  - Vuelven a estar disponibles
  - Tienen nuevas variantes
- **Compartir**: Comparte tu lista de favoritos con amigos y familiares

### 🛒 Carrito de Compras Inteligente

- **Gestión Flexible**: 
  - Añade y elimina productos fácilmente
  - Actualiza cantidades
  - Selecciona tallas y colores
- **Resumen de Compra**: 
  - Visualiza el subtotal en tiempo real
  - Calcula impuestos y gastos de envío
  - Aplica códigos de descuento
- **Guardado Automático**: Tu carrito se guarda automáticamente para que puedas continuar tu compra más tarde

### 💳 Proceso de Pago Seguro

- **Múltiples Métodos de Pago**:
  - Tarjetas de crédito/débito
  - PayPal
  - Transferencia bancaria
  - Otros métodos locales
- **Direcciones Múltiples**: 
  - Guarda diferentes direcciones de envío
  - Configura direcciones de facturación
  - Selecciona direcciones favoritas

### 📱 Experiencia Móvil

- **Diseño Responsivo**: Accede a todas las funcionalidades desde cualquier dispositivo
- **Navegación Optimizada**: Interfaz adaptada para una experiencia móvil fluida
- **Compra Rápida**: Proceso de compra simplificado para dispositivos móviles

### 🌍 Características Adicionales

- **Multi-idioma**: Navega la tienda en diferentes idiomas
- **Multi-moneda**: Visualiza precios en tu moneda preferida
- **Modo Oscuro**: Cambia entre modo claro y oscuro según tu preferencia
- **Búsqueda Inteligente**: Encuentra productos rápidamente con sugerencias automáticas
- **Newsletter**: Suscríbete para recibir las últimas novedades y ofertas exclusivas

### 🔒 Seguridad y Privacidad

- **Autenticación Segura**: Protege tu cuenta con inicio de sesión seguro
- **Gestión de Contraseñas**: Cambia tu contraseña fácilmente cuando lo necesites
- **Datos Protegidos**: Toda tu información personal está encriptada y protegida
- **Compras Seguras**: Procesamiento de pagos con los más altos estándares de seguridad

### 📞 Soporte al Cliente

- **Centro de Ayuda**: Accede a preguntas frecuentes y guías de uso
- **Contacto Directo**: Comunícate con nuestro equipo de soporte a través de:
  - Chat en vivo
  - Correo electrónico
  - Formulario de contacto
- **Devoluciones Fáciles**: Proceso simplificado para devoluciones y cambios

ModaVista está en constante evolución, añadiendo nuevas características y mejoras basadas en los comentarios de nuestros usuarios para ofrecer la mejor experiencia de compra online posible.

¡Únete a la comunidad ModaVista y descubre una nueva forma de comprar moda online!

## Tecnologías Utilizadas

- **Next.js**: Framework de React para la construcción de aplicaciones web.
- **NextAuth**: Para la gestión de la autenticación de usuarios.
- **Nodemailer**: Para el envío de correos electrónicos de confirmación.
- **Framer Motion**: Para animaciones en la interfaz de usuario.
- **Tailwind CSS**: Para el diseño responsivo y estilizado de la aplicación.

## Estructura del Proyecto

```
SAAS/
├── src/
│   ├── components/         # Componentes reutilizables de la interfaz
│   ├── pages/              # Páginas de la aplicación
│   │   ├── api/            # API para la gestión de usuarios
│   │   └── auth/           # Páginas de autenticación
│   ├── styles/             # Estilos globales
│   └── utils/              # Funciones utilitarias
├── .env                     # Variables de entorno
├── package.json             # Dependencias del proyecto
└── README.md               # Documentación del proyecto
```

## Instrucciones de Instalación

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega a la carpeta del proyecto:
   ```bash
   cd SAAS
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Configura las variables de entorno en un archivo `.env`:
   ```
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
6. Abre tu navegador y visita `http://localhost:3000`

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir a este proyecto, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. 

---

Para más información, consulta la documentación de Next.js y NextAuth.

[![Netlify Status](https://api.netlify.com/api/v1/badges/1e4ff948-d932-4b15-b40f-790701f338f5/deploy-status)](https://app.netlify.com/sites/modsvista/deploys)

## Aplicar Descuentos a Productos

Para aplicar descuentos a productos en la tienda ModaVista, sigue estos pasos:

### 1. Accede al Panel de Administración

1. Inicia sesión con tu cuenta de administrador.
   - Usuario: admin@admin
   - Contraseña: admin

2. Una vez iniciada la sesión, haz clic en "Panel de Administración" en el menú de navegación.

### 2. Navega al Gestor de Ofertas

1. En el panel de administración, haz clic en la pestaña "Ofertas" (con el icono de %).

### 3. Aplica Descuentos a Productos

1. Busca el producto al que deseas aplicar un descuento:
   - Puedes filtrar por categoría usando el selector de categorías.
   - Puedes buscar productos por nombre o ID usando el campo de búsqueda.

2. Para cada producto, verás botones con diferentes porcentajes de descuento (10%, 15%, 25%, 50%).
   - Haz clic en el porcentaje de descuento que deseas aplicar.
   - El descuento se aplicará inmediatamente y verás el precio actualizado.

3. Para eliminar un descuento:
   - Haz clic en el botón "X" junto al precio con descuento.

### 4. Visualiza los Descuentos

Los descuentos se mostrarán automáticamente en:
- La página de colección (`/coleccion`)
- La página de detalle del producto (`/product/[id]`)

En ambas páginas se mostrará:
- El precio rebajado
- El precio original tachado
- La etiqueta con el porcentaje de descuento

### Notas Importantes

- Los descuentos se guardan en el almacenamiento del servidor y persistirán mientras el servidor esté en ejecución.
- Si reinicias el servidor, los descuentos aplicados manualmente se perderán, ya que se almacenan en memoria.
- Para hacer que los descuentos persistan entre reinicios, sería necesario implementar una solución de almacenamiento permanente (como una base de datos).

## Información Técnica

- Los descuentos aplicados a productos estáticos (IDs 1001-5999) se guardan en el almacenamiento dinámico y se combinan con los productos estáticos al mostrarlos en la tienda.
- Cuando aplicas un descuento, se guardan tres propiedades:
  - `price`: El precio con descuento
  - `originalPrice`: El precio original antes del descuento
  - `discount`: Un objeto con `active: true` y `percentage` (el porcentaje de descuento)

## Solución de Problemas

Si los descuentos no aparecen correctamente:
1. Verifica que el servidor esté en ejecución.
2. Refresca la página donde esperas ver el descuento.
3. Verifica en el panel de administración que el descuento esté aplicado correctamente.
4. Consulta los logs del servidor para verificar si hay algún error.
