
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DiplomaData, GeneratedDiploma, ColorScheme } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import { DIPLOMA_COLOR_SCHEMES } from '../constants';


interface DiplomaPreviewProps {
  isLoading: boolean;
  error: string | null;
  diplomas: GeneratedDiploma[];
  formData: DiplomaData;
  onReset: () => void;
}

const downloadPDF = (elementId: string, studentName: string, variation: number | string) => {
    const diplomaElement = document.getElementById(elementId);
    if (!diplomaElement) return;

    // Use a specific background color for canvas rendering
    const bgColor = diplomaElement.style.backgroundColor || '#ffffff';

    html2canvas(diplomaElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: bgColor,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        // A4 dimensions in points: 595.28 x 841.89
        // We'll create a PDF that fits the aspect ratio of the generated image
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`diploma-${studentName.replace(/\s+/g, '_')}-var${variation}.pdf`);
    }).catch(err => {
        console.error("Error generating PDF:", err);
    });
};

const TextDiplomaCard: React.FC<{diploma: {title: string, body: string}, formData: DiplomaData, index: number}> = ({ diploma, formData, index }) => {
    const colorScheme = formData.colorScheme || DIPLOMA_COLOR_SCHEMES[0];
    const fontClassName = formData.font?.className || 'font-serif';
    const isStandard = formData.selectedStyle?.id === 'standard';
    const cardId = `diploma-card-${index}`;

    return (
        <div className="flex flex-col gap-4">
            <div 
                id={cardId}
                className={`text-gray-800 p-8 rounded-lg shadow-lg aspect-[1/1.414] flex flex-col border-4 relative ${fontClassName} ${isStandard ? 'border-double border-8' : ''}`}
                style={{
                    backgroundColor: colorScheme.bg,
                    borderColor: colorScheme.secondary,
                    color: colorScheme.text,
                    backgroundImage: isStandard ? `radial-gradient(${colorScheme.secondary} 0.5px, transparent 0.5px)` : 'none',
                    backgroundSize: isStandard ? '15px 15px' : 'auto',
                }}
            >
                <header className="text-center mb-6 z-10">
                    {formData.teamLogo && <img src={formData.teamLogo} alt="Logo da Equipe" className="h-20 w-20 mx-auto mb-4 object-contain" />}
                    <h1 className="text-3xl font-bold font-cinzel" style={{ color: colorScheme.primary }}>{diploma.title}</h1>
                </header>
                <main className="flex-grow text-center flex items-center justify-center z-10">
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                    {diploma.body
                        .replace('{NOME_ALUNO}', formData.studentName || 'Nome do Aluno')
                        .replace('{FAIXA}', formData.selectedBelt?.name || 'Faixa')
                        .replace('{DATA}', new Date(formData.graduationDate + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }))
                        .replace('{EQUIPE}', formData.teamName)
                        .replace('{MESTRE}', formData.masterName)}
                    </p>
                </main>
                <footer className="mt-8 flex justify-around items-end z-10">
                    <div className="text-center">
                        <p className={`${fontClassName} border-t-2 px-4 pt-1 text-sm`} style={{ borderColor: colorScheme.secondary }}>{formData.masterName}</p>
                        <p className="text-xs" style={{ color: colorScheme.secondary }}>Mestre</p>
                    </div>
                    <div className="text-center">
                        <p className={`${fontClassName} border-t-2 px-4 pt-1 text-sm`} style={{ borderColor: colorScheme.secondary }}>{formData.teamName}</p>
                        <p className="text-xs" style={{ color: colorScheme.secondary }}>Equipe/Dojo</p>
                    </div>
                </footer>
            </div>
            <button onClick={() => downloadPDF(cardId, formData.studentName || 'aluno', index + 1)} className="w-full text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg text-md px-5 py-2.5 text-center transition-colors">
                Download PDF (Variação {index + 1})
            </button>
        </div>
    );
};

const ImageDiplomaCard: React.FC<{diploma: {base64: string}, formData: DiplomaData}> = ({ diploma, formData }) => {
    const cardId = `diploma-card-image`;
    return (
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-3 mx-auto max-w-2xl w-full">
            <div id={cardId} style={{backgroundColor: '#fff'}}>
                 <img src={diploma.base64} alt="Diploma Gerado" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
            <button onClick={() => downloadPDF(cardId, formData.studentName || 'aluno', 'IA')} className="w-full text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg text-md px-5 py-2.5 text-center transition-colors">
                Download PDF (Versão IA)
            </button>
        </div>
    );
};


const DiplomaPreview: React.FC<DiplomaPreviewProps> = ({ isLoading, error, diplomas, formData, onReset }) => {
  if (isLoading) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <SpinnerIcon className="w-16 h-16 mx-auto text-red-700 dark:text-amber-400" />
        <h2 className="text-2xl font-semibold mt-4">Gerando Variações...</h2>
        <p className="text-gray-500 dark:text-gray-400">Aguarde, a IA está criando os diplomas.</p>
        {formData.selectedStyle?.id === 'custom' && <p className="text-gray-600 dark:text-gray-500 text-sm mt-2">(A geração de imagem pode levar um pouco mais de tempo)</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500">Ocorreu um Erro</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
        <button onClick={onReset} className="mt-6 px-6 py-2 text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 rounded-lg transition-colors">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-cinzel text-red-800 dark:text-amber-300">Diplomas Gerados</h2>
        <button onClick={onReset} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">Criar Novo Diploma</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {diplomas.map((diploma, index) => {
            if (diploma.type === 'text') {
                return <TextDiplomaCard key={index} diploma={diploma.data} formData={formData} index={index} />
            }
            if (diploma.type === 'image') {
                return <ImageDiplomaCard key={index} diploma={diploma.data} formData={formData} />
            }
            return null;
        })}
      </div>
    </div>
  );
};

export default DiplomaPreview;
