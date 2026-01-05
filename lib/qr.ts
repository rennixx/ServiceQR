import QRCode from 'qrcode';

/**
 * Generate QR code as data URL
 */
export async function generateQRCodeDataURL(url: string, options?: {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  };

  return await QRCode.toDataURL(url, defaultOptions);
}

/**
 * Generate multiple QR codes for all tables
 */
export async function generateAllQRCodes(tables: Array<{
  qr_code_id: string;
  table_number: string;
}>, restaurantSlug: string): Promise<Array<{
  tableNumber: string;
  qrCodeId: string;
  url: string;
  dataURL: string;
}>> {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';

  const qrCodes = await Promise.all(
    tables.map(async (table) => {
      const url = `${baseUrl}/table/${restaurantSlug}/${table.qr_code_id}`;
      const dataURL = await generateQRCodeDataURL(url);
      return {
        tableNumber: table.table_number,
        qrCodeId: table.qr_code_id,
        url,
        dataURL,
      };
    })
  );

  return qrCodes;
}

/**
 * Download QR code as image
 */
export function downloadQRCode(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
