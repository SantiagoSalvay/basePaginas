import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar la sesión del usuario
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Obtener datos de la tarjeta
    const { 
      cardNumber, 
      cardName, 
      expiry, 
      cvc, 
      amount, 
      cardType 
    } = req.body;

    // Simulación de validación y procesamiento de pago
    // En un entorno real, aquí se integraría con un proveedor de pagos como Stripe, PayPal, etc.

    // Validaciones básicas
    if (!cardNumber || !cardName || !expiry || !cvc || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Información de pago incompleta'
      });
    }

    // Simulación de procesamiento según el tipo de tarjeta
    let processingDelay = 1000; // 1 segundo por defecto
    let shouldSucceed = true;
    let declineReason = '';

    // Configuración para pruebas:
    // Tarjetas que terminan en:
    // 0000 - Siempre exitosa
    // 0001 - Fondos insuficientes
    // 0002 - Tarjeta expirada
    // 0003 - CVV incorrecto
    // 0004 - Tarjeta robada/bloqueada
    const last4 = cardNumber.replace(/\s+/g, '').slice(-4);
    
    switch (last4) {
      case '0001':
        shouldSucceed = false;
        declineReason = 'Fondos insuficientes';
        break;
      case '0002':
        shouldSucceed = false;
        declineReason = 'Tarjeta expirada';
        break;
      case '0003':
        shouldSucceed = false;
        declineReason = 'CVV incorrecto';
        break;
      case '0004':
        shouldSucceed = false;
        declineReason = 'Tarjeta bloqueada';
        break;
      default:
        // Tarjetas válidas (simulación exitosa)
        shouldSucceed = true;
    }

    // Simulación de tiempo de procesamiento según tipo de tarjeta
    switch (cardType) {
      case 'amex':
        processingDelay = 1500;
        break;
      case 'visa':
        processingDelay = 1000;
        break;
      case 'mastercard':
        processingDelay = 1200;
        break;
      default:
        processingDelay = 1300;
    }

    // Simular el tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, processingDelay));

    // Respuesta simulada
    if (shouldSucceed) {
      return res.status(200).json({
        success: true,
        message: 'Pago procesado correctamente',
        transactionId: `TR${Date.now()}${Math.floor(Math.random() * 10000)}`,
        amount,
        cardInfo: {
          cardType,
          last4
        },
        paymentDate: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Pago rechazado: ${declineReason}`,
        errorCode: `ERROR_${declineReason.toUpperCase().replace(/\s+/g, '_')}`
      });
    }
    
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al procesar el pago'
    });
  }
}