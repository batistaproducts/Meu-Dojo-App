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

// jsPDF uses points for font sizes. Conversion: points = pixels * 0.75
const pxToPt = (px: number) => px * 0.75;

export const generateDiplomaPDF = (diplomaData: DiplomaData, student: Student): string => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 20;

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(0, 0, 0);

    // 1. Declaration Text (Verdana -> Times, 25px)
    doc.setFont('times', 'normal');
    doc.setFontSize(pxToPt(25));
    const declarationText = doc.splitTextToSize(
        `Em reconhecimento à dedicação, disciplina e perseverança demonstradas no aprimoramento das técnicas e filosofia do ${diplomaData.martialArtName}.\nO(A) aluno(a) demonstrou o nível de competência técnica e compreensão tática exigido para esta graduação.\n\nEu ${diplomaData.masterName} declaro:`,
        140 // max width in mm
    );
    doc.text(declarationText, margin, 40);

    // 2. Student Name [ALUNO] (Arial -> Helvetica, 58px)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(pxToPt(58));
    doc.text(student.name.toUpperCase(), margin, 110);
    
    // 3. Signature lines and Master Name [MESTRE] (Arial -> Helvetica, 35px)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, 170, margin + 70, 168); // Top line
    doc.line(margin + 5, 173, margin + 75, 171); // Bottom line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(pxToPt(35));
    doc.text(diplomaData.masterName.toUpperCase(), margin, 185);

    // 4. Logos (600px -> ~30mm x 30mm)
    const logoSize = 30;
    const logoX = pageWidth - margin - logoSize;
    if (diplomaData.teamLogo) {
        try {
            doc.addImage(diplomaData.teamLogo, 'PNG', logoX, 30, logoSize, logoSize);
        } catch(e) { console.error("Error adding team logo:", e); }
    }
    if (diplomaData.dojoLogo) {
        try {
            doc.addImage(diplomaData.dojoLogo, 'PNG', logoX, 80, logoSize, logoSize);
        } catch(e) { console.error("Error adding dojo logo:", e); }
    }

    // 5. Bottom Right Colored Block
    const beltColorRGB = hexToRgb(student.belt.color) || [128, 0, 128];
    const blockWidth = 110;
    const blockHeight = 60;
    const blockX = pageWidth - margin - blockWidth;
    const blockY = pageHeight - margin - blockHeight;
    doc.setFillColor(beltColorRGB[0], beltColorRGB[1], beltColorRGB[2]);
    doc.rect(blockX, blockY, blockWidth, blockHeight, 'F');

    // 6. Text inside the colored block
    doc.setTextColor(255, 255, 255);
    
    // GRADUACAO DE: (Verdana -> Times, 25px)
    doc.setFont('times', 'normal');
    doc.setFontSize(pxToPt(25));
    const beltNameText = `${student.belt.name.toUpperCase()} DE:`;
    doc.text(beltNameText, blockX + 5, blockY + 12);
    
    // [MODAL] (Arial -> Helvetica, 125px)
    doc.setFont('helvetica', 'bold');
    const artName = diplomaData.martialArtName.toUpperCase();
    // Adjust font size if text is too long to fit in the box
    let modalFontSize = pxToPt(125);
    const artNameWidth = doc.getTextWidth(artName) * (modalFontSize / doc.getFontSize());
    if (artNameWidth > (blockWidth - 10)) {
        modalFontSize = modalFontSize * (blockWidth - 10) / artNameWidth;
    }
    doc.setFontSize(modalFontSize);
    doc.text(artName, blockX + 5, blockY + 40);
    
    // [CIDADE - ESTADO] (Arial -> Helvetica, 25px)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(pxToPt(25));
    doc.text(diplomaData.dojoLocation.toUpperCase(), blockX + 5, blockY + 55);
    
    // [DATA] (Verdana -> Times, 25px)
    doc.setFont('times', 'normal');
    doc.setFontSize(pxToPt(25));
    const formattedDate = new Date(diplomaData.graduationDate + 'T00:00:00').toLocaleDateString('pt-BR');
    doc.text(formattedDate, blockX + blockWidth - 5, blockY + 55, { align: 'right' });


    return doc.output('datauristring');
};