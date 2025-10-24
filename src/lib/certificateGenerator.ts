import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import logoGerada from "@/assets/logo-cresci-perdi-generated.png";
import mascoteGirafa from "@/assets/mascote-girafa-badge.png";

interface CertificadoData {
  nome: string;
  curso: string;
  data: string;
  cargaHoraria: string;
  certificadoUrl?: string;
  logoBase64?: string;
  seloBase64?: string;
  qrCodeBase64?: string;
}

export default async function gerarCertificadoCresciPerdi(data: CertificadoData) {
  const doc = new jsPDF("l", "mm", "a4"); // A4 landscape: 297mm x 210mm
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Adicionar a imagem de fundo
  const templatePath = '/images/certificado.png';
  doc.addImage(templatePath, 'PNG', 0, 0, pageWidth, pageHeight);

  // --- Configurações de Estilo ---
  const textColor = [87, 55, 40]; // Marrom escuro profissional
  doc.setFont("Helvetica");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  // --- Posicionamento Ajustado para Corresponder ao Template ---

  // "A CRESCI E PERDI CONFERE O CERTIFICADO PARA" (15 pontos para cima, fonte aumentada)
  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.text("A CRESCI E PERDI CONFERE O CERTIFICADO PARA", pageWidth / 2, 67, { align: "center" });

  // NOME DO PARTICIPANTE (15 pontos para cima, fonte ligeiramente menor)
  doc.setFontSize(28);
  doc.setFont("Helvetica", "normal");
  doc.text(data.nome.toUpperCase(), pageWidth / 2, 83, { align: "center" });

  // "POR TER FREQUENTADO O CURSO DE" (15 pontos para cima, fonte aumentada)
  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.text("POR TER FREQUENTADO O CURSO DE", pageWidth / 2, 99, { align: "center" });

  // NOME DO CURSO (15 pontos para cima, fonte ligeiramente menor)
  doc.setFontSize(18);
  doc.setFont("Helvetica", "normal");
  doc.text(data.curso.toUpperCase(), pageWidth / 2, 112, { align: "center" });

  // DATA (movida 6 pontos para direita e 4 para cima)
  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.text("DATA", 87, 128, { align: "center" });
  doc.setFont("Helvetica", "normal");
  doc.text(data.data, 87, 135, { align: "center" });

  // CARGA HORÁRIA (movida 6 pontos para direita e 4 para cima)
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("CARGA HORÁRIA:", 62, 143, { align: "left" });
  doc.setFont("Helvetica", "normal");
  doc.text(`${data.cargaHoraria} HORAS`, 95, 143, { align: "left" });
  
  // ASSINATURA (12 pontos para esquerda e 4 para cima)
  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.text("ASSINATURA", 208, 138, { align: "center" });

  // QR Code (20 pontos para baixo, 10 para direita)
  try {
    if (data.certificadoUrl) {
      const qrCodeBase64 = await QRCode.toDataURL(data.certificadoUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Posição ajustada: +10 horizontal, +20 vertical
      doc.addImage(qrCodeBase64, "PNG", 262, 180, 30, 30);
    }
  } catch (error) {
    console.error("Erro ao adicionar QR code:", error);
  }

  // Retorna o PDF como um Blob
  return doc.output('blob');
}

// Função auxiliar para converter imagem para base64
export async function imagemParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Função auxiliar para carregar imagem de URL como base64
export async function urlParaBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
