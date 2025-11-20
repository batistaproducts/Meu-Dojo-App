
import React, { useState } from 'react';
import { Post } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface CreatePostModalProps {
    post?: Post | null;
    onClose: () => void;
    onSave: (content: string, imageBase64: string | null) => Promise<void>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ post, onClose, onSave }) => {
    const [content, setContent] = useState(post?.content || '');
    const [imageBase64, setImageBase64] = useState<string | null>(post?.image_url || null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !imageBase64) {
            alert("A publicação não pode estar vazia.");
            return;
        }

        setLoading(true);
        try {
            await onSave(content, imageBase64);
            onClose();
        } catch (error: any) {
            console.error("Error saving post:", error);
            let errorMessage = "Ocorreu um erro desconhecido.";
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code) {
                if (error.code === '42P01' || error.code === 'PGRST205') {
                    errorMessage = "Tabela de publicações não encontrada (Erro 42P01/PGRST205). Contate o administrador.";
                } else {
                    errorMessage = `Erro código: ${error.code}`;
                }
            }
            
            alert(`Erro ao salvar publicação: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-bold font-cinzel text-gray-900 dark:text-white">
                        {post ? 'Editar Publicação' : 'Nova Publicação'}
                    </h3>

                    <div className="flex items-start gap-3">
                        <textarea
                            className="w-full h-32 bg-gray-100 dark:bg-gray-700 border-none rounded-lg p-3 focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white resize-none"
                            placeholder="O que você quer compartilhar com seus alunos?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Image Preview/Upload */}
                    <div className="relative">
                         {imageBase64 ? (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img src={imageBase64} alt="Preview" className="w-full max-h-64 object-contain bg-black" />
                                <button 
                                    type="button"
                                    onClick={() => setImageBase64(null)}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                         ) : (
                            <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
                                <UploadIcon className="w-5 h-5" />
                                <span>Adicionar Foto</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                         )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                        >
                            {loading ? <SpinnerIcon className="w-5 h-5" /> : (post ? 'Salvar' : 'Publicar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
