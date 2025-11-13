import React from 'react';
import { Student } from '../../types';
import SpinnerIcon from '../../components/icons/SpinnerIcon';
import { DiplomaResult } from './DiplomaGenerator';

interface DiplomaPreviewProps {
  isLoading: boolean;
  error: string | null;
  results: DiplomaResult[];
  onReset: () => void;
}

const downloadPDF = (pdfDataUri: string, studentName: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const fileName = `diploma-${studentName.replace(/\s+/g, '_')}.pdf`;

    // On iOS, the download attribute doesn't work. We need to open it in a new tab using a Blob URL.
    if (isIOS) {
        // Convert data URI to Blob
        const byteString = atob(pdfDataUri.split(',')[1]);
        const mimeString = pdfDataUri.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        
        // Use window.open with a blob URL
        window.open(URL.createObjectURL(blob));
    } else {
        // Standard download method for other browsers
        const link = document.createElement('a');
        link.href = pdfDataUri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const DiplomaCard: React.FC<{ result: DiplomaResult }> = ({ result }) => {
    const { student, pdfDataUri } = result;
    return (
        <div className="flex flex-col gap-4">
            <h4 className="font-bold text-center text-gray-800 dark:text-gray-200">{student.name} - Faixa {student.belt.name}</h4>
            <div className="aspect-[1.414/1] w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner">
                <iframe src={pdfDataUri} className="w-full h-full border-0 rounded-lg" title={`Diploma de ${student.name}`} />
            </div>
            <button onClick={() => downloadPDF(pdfDataUri, student.name)} className="w-full text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg text-md px-5 py-2.5 text-center transition-colors">
                Download PDF
            </button>
        </div>
    );
};


const DiplomaPreview: React.FC<DiplomaPreviewProps> = ({ isLoading, error, results, onReset }) => {
  if (isLoading) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <SpinnerIcon className="w-16 h-16 mx-auto text-red-700 dark:text-amber-400" />
        <h2 className="text-2xl font-semibold mt-4">Gerando Diplomas...</h2>
        <p className="text-gray-500 dark:text-gray-400">Aguarde, os certificados estão sendo criados.</p>
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
        <button onClick={onReset} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">Gerar Outros</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((result) => (
             <DiplomaCard key={result.student.id} result={result} />
        ))}
      </div>
    </div>
  );
};

export default DiplomaPreview;