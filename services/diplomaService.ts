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

    // 1. Watermark (Dojo Logo)
    if (diplomaData.dojoLogo) {
        try {
            // Set transparency for the watermark
            (doc as any).setGState(new (doc as any).GState({opacity: 0.03}));

            // Add the image centered on the page, fitting the height
            const watermarkSize = pageHeight - (margin * 2); 
            const watermarkX = (pageWidth / 2) - (watermarkSize / 2);
            const watermarkY = (pageHeight / 2) - (watermarkSize / 2);
            doc.addImage(diplomaData.dojoLogo, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize);

            // Reset transparency
            (doc as any).setGState(new (doc as any).GState({opacity: 1}));
        } catch (e) {
            console.error("Error adding dojo logo as watermark:", e);
        }
    }
    
    doc.setTextColor(0, 0, 0);

    // 2. Declaration Text (Helvetica, 25px)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(pxToPt(25));
    const declarationText = doc.splitTextToSize(
        `Em reconhecimento à dedicação, disciplina e perseverança demonstradas no aprimoramento das técnicas e filosofia do ${diplomaData.martialArtName}.\nO(A) aluno(a) demonstrou o nível de competência técnica e compreensão tática exigido para esta graduação.\n\nEu ${diplomaData.masterName} declaro:`,
        140 // max width in mm
    );
    doc.text(declarationText, margin, 40);

    // 3. Student Name [ALUNO] (Helvetica-Bold, 58px)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(pxToPt(58));
    doc.text(student.name.toUpperCase(), margin, 110);
    
    // 4. Signature lines and Master Name [MESTRE] (Helvetica-Bold, 35px)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, 170, margin + 70, 168); // Top line
    doc.line(margin + 5, 173, margin + 75, 171); // Bottom line
    doc.setFontSize(pxToPt(35));
    doc.text(diplomaData.masterName.toUpperCase(), margin, 185);

    // 5. Bottom Right Colored Block (Rendered before team logo to ensure correct layering)
    const beltColorRGB = hexToRgb(student.belt.color) || [128, 0, 128];
    const blockWidth = 110;
    const blockHeight = 60;
    const blockX = pageWidth - blockWidth; // Aligned to right edge
    const blockY = pageHeight - blockHeight; // Aligned to bottom edge
    doc.setFillColor(beltColorRGB[0], beltColorRGB[1], beltColorRGB[2]);
    doc.rect(blockX, blockY, blockWidth, blockHeight, 'F');

    // 6. Team Logo (80mm x 80mm, centered vertically)
    const logoSize = 80;
    const logoX = pageWidth - margin - logoSize;
    const logoY = (pageHeight / 2) - (logoSize / 2); // Centered vertically
    
    if (diplomaData.teamLogo) {
        try {
            doc.addImage(diplomaData.teamLogo, 'PNG', logoX, logoY, logoSize, logoSize);
        } catch(e) { console.error("Error adding team logo:", e); }
    }

    // 7. Text inside the colored block
    doc.setTextColor(255, 255, 255);
    
    // GRADUACAO DE: (Helvetica, 25px)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(pxToPt(25));
    const beltNameText = `FAIXA ${student.belt.name.toUpperCase()} DE:`;
    doc.text(beltNameText, blockX + 10, blockY + 12);
    
    // [MODAL] (Helvetica-Bold, 125px)
    doc.setFont('Helvetica', 'bold');
    const artName = diplomaData.martialArtName.toUpperCase();
    let modalFontSize = pxToPt(125);
    doc.setFontSize(modalFontSize);
    const artNameWidth = doc.getTextWidth(artName);
    if (artNameWidth > (blockWidth - 20)) {
        modalFontSize = modalFontSize * ((blockWidth - 20) / artNameWidth);
    }
    doc.setFontSize(modalFontSize);
    doc.text(artName, blockX + 10, blockY + 40);
    
    // [CIDADE - ESTADO] (Helvetica-Bold, 25px)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(pxToPt(25));
    doc.text(diplomaData.dojoLocation.toUpperCase(), blockX + 10, blockY + 55);
    
    // [DATA] (Helvetica, 25px)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(pxToPt(25));
    const formattedDate = new Date(diplomaData.graduationDate + 'T00:00:00').toLocaleDateString('pt-BR');
    doc.text(formattedDate, blockX + blockWidth - 10, blockY + 55, { align: 'right' });


    return doc.output('datauristring');
};