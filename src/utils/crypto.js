import CryptoJS from 'crypto-js';

// Ambil kunci dari file .env (Vite)
const AES_KEY = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_KEY);

export const decryptData = (encryptedData) => {
    // Jika bukan format objek terenkripsi, kembalikan apa adanya
    if (!encryptedData || !encryptedData.iv || !encryptedData.content) {
        return encryptedData; 
    }

    try {
        const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
        const ciphertext = CryptoJS.enc.Hex.parse(encryptedData.content);
        
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            AES_KEY,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        console.error("Gagal mendekripsi data API:", error);
        return null;
    }
};