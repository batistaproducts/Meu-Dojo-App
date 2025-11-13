
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DiplomaData, MartialArt, GeneratedDiploma } from "../types";

// FIX: Initialize GoogleGenAI without casting API_KEY to string, as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper para extrair mimeType e dados base64 de uma data URL
const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } | null => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    return {
        mimeType: match[1],
        data: match[2],
    };
};


const generateTextVariations = async (data: DiplomaData, art: MartialArt): Promise<GeneratedDiploma[]> => {
    const prompt = `
      Você é um designer de diplomas de artes marciais. Crie 3 variações de texto distintas para o diploma de graduação de um aluno. O texto deve ser elegante, respeitoso e formal.
  
      Detalhes da Graduação:
      - Arte Marcial: ${art.name}
      - Graduação Alcançada: Faixa ${data.selectedBelt?.name || 'Não especificada'}
      - Nome do Aluno: ${data.studentName || 'Não especificado'}
      - Data da Graduação: ${data.graduationDate}
      - Equipe/Dojo: ${data.teamName}
      - Mestre Responsável: ${data.masterName}
      - Estilo do Diploma: ${data.selectedStyle?.name || 'Padrão'}
      ${data.customNotes ? `- Observações Adicionais: ${data.customNotes}` : ''}
  
      O tom e a estrutura do texto devem refletir o estilo do diploma selecionado. Para o estilo 'Padrão', use uma linguagem mais clássica e formal. Para o 'Minimalista', seja mais direto e conciso.
      Se houver observações adicionais, incorpore-as de forma elegante e apropriada ao texto do diploma.
  
      Retorne um array JSON com 3 objetos. Cada objeto deve ter duas chaves: 'title' (ex: "Certificado de Promoção de Faixa") e 'body' (o texto principal do diploma, que deve conter placeholders como {NOME_ALUNO}, {FAIXA}, {DATA}, {EQUIPE} e {MESTRE} para serem substituídos).
    `;
    
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  body: { type: Type.STRING },
                },
                required: ["title", "body"],
              },
            },
          },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.map((item: any) => ({ type: 'text', data: item }));

    } catch (e: any) {
      console.error("Failed to generate or parse Gemini response:", e);
      if (e.message && e.message.toLowerCase().includes('json')) {
          throw new Error("A resposta da IA (texto) não estava no formato JSON esperado.");
      }
      throw new Error("Falha na comunicação com a IA para gerar o texto do diploma.");
    }
}

const generateImageVariation = async (data: DiplomaData, art: MartialArt): Promise<GeneratedDiploma[]> => {
    if (!data.existingDiplomaImage) {
        throw new Error("Imagem do diploma existente é necessária para este estilo.");
    }

    const imageParts = parseDataUrl(data.existingDiplomaImage);
    if (!imageParts) {
        throw new Error("Formato de imagem inválido. Use uma imagem em base64.");
    }

    const prompt = `
      Analise a imagem deste diploma. Mantenha o design, layout, fontes e estilo visual exatamente os mesmos.
      Sua única tarefa é substituir as informações textuais existentes pelas novas informações fornecidas abaixo.
      Seja preciso na substituição, garantindo que o novo texto se encaixe perfeitamente no lugar do antigo.

      Novas Informações:
      - Nome do Aluno: ${data.studentName || 'Não especificado'}
      - Graduação: Faixa ${data.selectedBelt?.name || 'Não especificada'} de ${art.name}
      - Data: ${data.graduationDate}
      - Nome da Equipe/Dojo: ${data.teamName}
      - Nome do Mestre: ${data.masterName}
      ${data.customNotes ? `- Observações Adicionais (se houver um campo para isso): ${data.customNotes}` : ''}

      Retorne apenas a imagem do diploma atualizado, sem nenhum texto ou explicação adicional.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: imageParts.mimeType,
                            data: imageParts.data,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstCandidate = response.candidates?.[0];
        if (!firstCandidate || !firstCandidate.content.parts) {
            throw new Error("A resposta da IA não continha o conteúdo de imagem esperado.");
        }

        for (const part of firstCandidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                return [{ type: 'image', data: { base64: imageUrl } }];
            }
        }

        throw new Error("A IA não retornou uma imagem de diploma nos dados da resposta.");
    } catch (e) {
        console.error("Error generating diploma image from Gemini:", e);
        throw new Error("Falha na comunicação com a IA para gerar a imagem do diploma.");
    }
};

export const generateDiplomaVariations = async (data: DiplomaData, art: MartialArt): Promise<GeneratedDiploma[]> => {
    if (data.selectedStyle?.id === 'custom') {
        return generateImageVariation(data, art);
    } else {
        return generateTextVariations(data, art);
    }
};
