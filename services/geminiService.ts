import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DiplomaData, MartialArt, GeneratedDiploma } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const generateTextVariations = async (data: DiplomaData, art: MartialArt): Promise<GeneratedDiploma[]> => {
    const prompt = `
      Você é um designer de diplomas de artes marciais. Crie 3 variações de texto distintas para o diploma de graduação de um aluno. O texto deve ser elegante, respeitoso e formal.
  
      Detalhes da Graduação:
      - Arte Marcial: ${art.name}
      - Graduação Alcançada: Faixa ${data.selectedBelt.name}
      - Nome do Aluno: ${data.studentName}
      - Data da Graduação: ${data.graduationDate}
      - Equipe/Dojo: ${data.teamName}
      - Mestre Responsável: ${data.masterName}
      - Estilo do Diploma: ${data.selectedStyle.name}
      ${data.customNotes ? `- Observações Adicionais: ${data.customNotes}` : ''}
  
      O tom e a estrutura do texto devem refletir o estilo do diploma selecionado. Para o estilo 'Padrão', use uma linguagem mais clássica e formal. Para o 'Minimalista', seja mais direto e conciso.
      Se houver observações adicionais, incorpore-as de forma elegante e apropriada ao texto do diploma.
  
      Retorne um array JSON com 3 objetos. Cada objeto deve ter duas chaves: 'title' (ex: "Certificado de Promoção de Faixa") e 'body' (o texto principal do diploma, que deve conter placeholders como {NOME_ALUNO}, {FAIXA}, {DATA}, {EQUIPE} e {MESTRE} para serem substituídos).
    `;
  
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
    try {
        const parsed = JSON.parse(jsonText);
        return parsed.map((item: any) => ({ type: 'text', data: item }));
    } catch (e) {
      console.error("Failed to parse Gemini response:", jsonText);
      throw new Error("A resposta da IA (texto) não estava no formato JSON esperado.");
    }
}

const generateImageVariation = async (data: DiplomaData, art: MartialArt): Promise<GeneratedDiploma[]> => {
    if (!data.existingDiplomaImage) {
        throw new Error("Imagem do diploma existente não fornecida.");
    }

    const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg', // Assumes JPEG, could be dynamic
          data: data.existingDiplomaImage.split(',')[1],
        },
    };

    const prompt = `
      Analise a imagem deste diploma. É um certificado de ${art.name}.
      Sua tarefa é criar uma cópia perfeita deste diploma, mantendo o mesmo layout, fontes, cores, texturas e elementos de design.
      No entanto, você deve substituir as seguintes informações no diploma recriado:
      - **Nome do Aluno**: substitua o nome existente por "${data.studentName}".
      - **Graduação Alcançada**: substitua a faixa ou graduação existente por "Faixa ${data.selectedBelt.name}".
      - **Data da Graduação**: substitua a data existente por "${data.graduationDate}".
      - **Equipe/Dojo**: substitua o nome da equipe/dojo existente por "${data.teamName}".
      - **Mestre Responsável**: substitua o nome do mestre existente por "${data.masterName}".

      Se o logo da equipe for fornecido, substitua o logo antigo pelo novo.
      Seja o mais fiel possível ao design original. O resultado deve ser uma imagem de alta qualidade.
    `;
     
    const contents = {
        parts: [
            imagePart,
            { text: prompt },
        ],
    };

    if (data.teamLogo) {
        contents.parts.push({
            inlineData: {
                mimeType: 'image/png', // Assumes PNG, could be dynamic
                data: data.teamLogo.split(',')[1],
            }
        });
        contents.parts.push({
            text: "Este é o novo logo da equipe para ser usado no diploma."
        });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    
    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
        const base64Image = `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
        return [{ type: 'image', data: { base64: base64Image } }];
    } else {
        console.error("No image data in Gemini response:", response);
        throw new Error("A resposta da IA (imagem) não continha os dados da imagem esperada.");
    }
}


export const generateDiplomaVariations = async (data: DiplomaData, art: MartialArt): Promise<GeneratedDiploma[]> => {
    if (data.selectedStyle.id === 'custom') {
        return generateImageVariation(data, art);
    } else {
        return generateTextVariations(data, art);
    }
};
