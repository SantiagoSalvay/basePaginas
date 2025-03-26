import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiCheckCircle, FiX } from 'react-icons/fi';
import axios from 'axios';

const PaymentReceiptUploader = ({ orderId, paymentMethod, onUploadSuccess, onError }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Validar tipo de archivo (solo imágenes)
    if (!selectedFile.type.match('image.*')) {
      setErrorMessage('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validar tamaño (máx 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es 5MB');
      return;
    }
    
    setFile(selectedFile);
    setErrorMessage('');
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMessage('Por favor, selecciona un archivo');
      return;
    }
    
    if (!orderId) {
      setErrorMessage('ID de orden no válido');
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    try {
      console.log('Iniciando subida de archivo...');
      // 1. Subir el archivo
      const formData = new FormData();
      formData.append('receipt', file);
      
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Respuesta de la API de upload:', uploadResponse.data);
      
      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || 'Error al subir el archivo');
      }
      
      const filePath = uploadResponse.data.filePath;
      console.log('Archivo subido correctamente, path:', filePath);
      
      // 2. Guardar el comprobante en la base de datos
      console.log('Guardando comprobante en base de datos...');
      const saveResponse = await axios.post('/api/payment/submit-receipt', {
        orderId,
        receiptImage: filePath,
        paymentMethod
      });
      
      console.log('Respuesta de la API de submit-receipt:', saveResponse.data);
      
      if (!saveResponse.data.success) {
        throw new Error(saveResponse.data.message || 'Error al guardar el comprobante');
      }
      
      console.log('Comprobante guardado correctamente, actualizando UI...');
      setIsSuccess(true);
      setSuccessMessage('¡Comprobante subido correctamente! Serás redirigido a tu perfil en 5 segundos.');
      
      if (onUploadSuccess) {
        console.log('Llamando a onUploadSuccess...');
        setTimeout(() => {
          onUploadSuccess(filePath);
        }, 100);
      } else {
        console.log('No se proporcionó función onUploadSuccess');
      }
      
    } catch (error) {
      console.error('Error en el proceso de subida:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Error al subir el comprobante');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setErrorMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mt-2">
      <h3 className="text-sm font-semibold mb-2 text-gray-900">
        Subir comprobante de pago
      </h3>
      
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-3">
          <FiCheckCircle className="text-green-500 w-10 h-10 mb-2" />
          <p className="text-center text-gray-700 text-xs mb-2">
            {successMessage || '¡Comprobante subido correctamente! Verificaremos el pago pronto.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">
              {paymentMethod === 'mercadopago' 
                ? 'Sube una captura de tu comprobante de Mercado Pago.' 
                : 'Sube una captura de tu comprobante de PayPal.'}
            </p>
            
            {!preview ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById('receipt-upload').click()}
              >
                <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-xs text-gray-600">
                  Haz clic para seleccionar imagen
                </p>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="rounded-lg overflow-hidden mb-1">
                  <img 
                    src={preview} 
                    alt="Vista previa del comprobante" 
                    className="w-full h-32 object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                >
                  <FiX size={14} />
                </button>
                <p className="text-xs text-gray-600">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              </div>
            )}
            
            {errorMessage && (
              <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!file || isUploading}
            className={`w-full py-2 px-4 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center ${(!file || isUploading) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <>
                <div className="mr-2 animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                Subiendo...
              </>
            ) : (
              <>
                <FiUpload className="mr-2" size={14} /> Subir comprobante
              </>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default PaymentReceiptUploader; 