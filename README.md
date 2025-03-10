# Proyecto SAAS - ModaVista

Este proyecto es una aplicación web de gestión de usuarios y productos, diseñada para una plataforma de comercio electrónico llamada **ModaVista**. La aplicación permite a los usuarios registrarse, iniciar sesión y gestionar su perfil, así como ver productos favoritos y su historial de compras.

## Características Principales

- **Registro de Usuarios**: Los usuarios pueden crear una cuenta proporcionando su nombre, correo electrónico, contraseña y número de teléfono. 
- **Inicio de Sesión**: Los usuarios pueden iniciar sesión en su cuenta utilizando sus credenciales.
- **Dashboard de Usuario**: Una vez iniciada la sesión, los usuarios pueden acceder a su perfil, donde pueden ver y editar su información personal, así como sus productos favoritos y compras realizadas.
- **Correo de Confirmación**: Al registrarse, los usuarios reciben un correo electrónico de confirmación.

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
