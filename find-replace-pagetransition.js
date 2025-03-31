const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Función para buscar archivos recursivamente
async function findFiles(startPath, filter) {
  const files = [];
  
  async function traverse(currentPath) {
    const items = await readdir(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = await stat(itemPath);
      
      if (stats.isDirectory()) {
        await traverse(itemPath);
      } else if (stats.isFile() && filter.test(itemPath)) {
        files.push(itemPath);
      }
    }
  }
  
  await traverse(startPath);
  return files;
}

// Función principal
async function replacePageTransition() {
  try {
    // Encontrar todos los archivos JS/JSX en el directorio de páginas
    const pageFiles = await findFiles(path.join(__dirname, 'src', 'pages'), /\.(js|jsx)$/);
    
    console.log(`Encontrados ${pageFiles.length} archivos de páginas a procesar`);
    
    let modifiedCount = 0;
    
    for (const filePath of pageFiles) {
      let content = await readFile(filePath, 'utf8');
      const originalContent = content;
      
      // Verificar si el archivo utiliza PageTransition
      if (content.includes('PageTransition')) {
        // Reemplazar <PageTransition> por <div className="page-transition">
        content = content.replace(/<PageTransition>/g, '<div className="page-transition">');
        content = content.replace(/<\/PageTransition>/g, '</div>');
        
        // Si el contenido cambió, escribir el archivo
        if (content !== originalContent) {
          await writeFile(filePath, content, 'utf8');
          console.log(`Modificado: ${filePath}`);
          modifiedCount++;
        }
      }
    }
    
    console.log(`Proceso completado. ${modifiedCount} archivos modificados.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
replacePageTransition(); 