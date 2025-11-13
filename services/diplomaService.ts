import jsPDF from 'jspdf';
import { DiplomaData, Student } from '../types';

// Helper to convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] | null => {
    if (!hex) return [128, 128, 128]; // Default gray if color is missing
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
          ]
        : null;
};

export const generateDiplomaPDF = (diplomaData: DiplomaData, student: Student): string => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = 297;
    const pageHeight = 210;

    const beltColor = student.belt.color;
    const beltColorRGB = hexToRgb(beltColor) || [128, 0, 128]; // Default to purple if conversion fails

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(0, 0, 0);

    // Declaration Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const declarationText = doc.splitTextToSize(
        `Em reconhecimento à dedicação, disciplina e perseverança demonstradas no aprimoramento das técnicas e filosofia do Jiu-Jitsu Brasileiro.\nO(A) aluno(a) demonstrou o nível de competência técnica e compreensão tática exigido para esta graduação.\n\nEu ${diplomaData.masterName} declaro:`,
        120
    );
    doc.text(declarationText, 20, 30);

    // Student Name [ALUNO]
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(48);
    doc.text(student.name.toUpperCase(), 20, 110);
    
    // Signature lines and Master Name [MESTRE]
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 170, 90, 168); // Top line
    doc.line(25, 173, 95, 171); // Bottom line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(diplomaData.masterName, 20, 180);

    // Team Logo [LOGOEQUIPE]
    if (diplomaData.teamLogo) {
        try {
            doc.addImage(diplomaData.teamLogo, 'PNG', 230, 20, 45, 45);
        } catch(e) { console.error("Error adding team logo:", e); }
    }

    // Dojo Logo [LOGODOJO]
    if (diplomaData.dojoLogo) {
        try {
            doc.addImage(diplomaData.dojoLogo, 'PNG', 230, 90, 45, 45);
        } catch(e) { console.error("Error adding dojo logo:", e); }
    }

    // Bottom Right Colored Block
    const blockX = 170, blockY = 140;
    const blockWidth = pageWidth - blockX - 10;
    const blockHeight = pageHeight - blockY - 10;
    doc.setFillColor(beltColorRGB[0], beltColorRGB[1], beltColorRGB[2]);
    doc.rect(blockX, blockY, blockWidth, blockHeight, 'F');

    // Text inside the colored block
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const beltNameText = `${student.belt.name.toUpperCase()} DE:`;
    doc.text(beltNameText, blockX + 5, blockY + 15);
    
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    const artName = diplomaData.martialArtName.toUpperCase();
    doc.text(artName, blockX + 5, blockY + 30);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(diplomaData.dojoLocation.toUpperCase(), blockX + 5, blockY + 45);
    
    const formattedDate = new Date(diplomaData.graduationDate + 'T00:00:00').toLocaleDateString('pt-BR');
    doc.text(formattedDate, blockX + blockWidth - 5, blockY + 45, { align: 'right' });


    return doc.output('datauristring');
};
