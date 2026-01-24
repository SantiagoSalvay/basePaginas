import { getSession } from 'next-auth/react';

/**
 * ⚠️ MITIGACIÓN TEMPORAL (INTERNA)
 * Para cumplimiento PCI-DSS, este endpoint NUNCA debe recibir datos de tarjeta en texto plano.
 * Se debe migrar a un proveedor como Stripe (Tokens/PaymentIntents) lo antes posible.
 * Mitigación actual: 
 * - Cero persistencia de datos sensibles.
 * - Cero logs de variables de entrada.
 * - Procesamiento estrictamente en memoria efímera.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Extraer datos (evitar logs automáticos del framework si existen)
    const {
      cardNumber,
      cardName,
      expiry,
      cvc,
      amount,
      cardType
    } = req.body;

    // VALIDACIÓN: No loguear NUNCA estas variables
    if (!cardNumber || !cardName || !expiry || !cvc || !amount) {
      // Log genérico sin datos
      console.error('Intento de pago con datos incompletos');
      return res.status(400).json({
        success: false,
        message: 'Información de pago incompleta'
      });
    }

    // Simulación de procesamiento seguro
    // En un entorno real, estos datos se enviarían cifrados a un HSM o Vault.

    const last4 = cardNumber.replace(/\s+/g, '').slice(-4);
    let shouldSucceed = !['0001', '0002', '0003', '0004'].includes(last4);
    let declineReason = '';

    if (!shouldSucceed) {
      const reasons = {
        '0001': 'Fondos insuficientes',
        '0002': 'Tarjeta expirada',
        '0003': 'CVV incorrecto',
        '0004': 'Tarjeta bloqueada'
      };
      declineReason = reasons[last4] || 'Declinada';
    }

    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // RESPUESTA: Solo devolver last4 y datos no sensibles
    if (shouldSucceed) {
      return res.status(200).json({
        success: true,
        message: 'Pago procesado correctamente (Simulado)',
        transactionId: `TR${Date.now()}${Math.floor(Math.random() * 1000)}`,
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
        message: `Pago rechazado: ${declineReason}`
      });
    }

  } catch (error) {
    // Log genérico sin traza de datos sensibles
    console.error('Error interno en procesamiento de pago');
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el pago'
    });
  }
}