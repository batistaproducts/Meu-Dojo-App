
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface ProductFormModalProps {
    product?: Product | null;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'dojo_id' | 'created_at'> & { id?: string }) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<string>('');
    const [affiliateUrl, setAffiliateUrl] = useState('');
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price.toString());
            setAffiliateUrl(product.affiliate_url);
            setImageBase64(product.image_url || null);
        }
    }, [product]);

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
        if (!name || !price || !affiliateUrl) {
            alert("Por favor, preencha os campos obrigatórios (Nome, Preço, Link).");
            return;
        }

        setLoading(true);
        try {
            await onSave({
                id: product?.id,
                name,
                description,
                price: parseFloat(price.replace(',', '.')),
                affiliate_url: affiliateUrl,
                image_url: imageBase64 || undefined
            });
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erro ao salvar produto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <h3 className="text-2xl font-bold font-cinzel text-gray-900 dark:text-white">
                        {product ? 'Editar Produto' : 'Adicionar Produto'}
                    </h3>

                    <div className="flex flex-col items-center gap-4">
                        <label htmlFor="product-image-upload" className="cursor-pointer group relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 hover:border-gray-600 transition-colors">
                            {imageBase64 ? (
                                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                    <UploadIcon className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Adicionar Foto</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </label>
                        <input id="product-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5" placeholder="Ex: Kimono Trançado" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                            <input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5" placeholder="0.00" />
                        </div>
                        <div>
                            <label htmlFor="affiliate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Link de Venda</label>
                            <input id="affiliate" type="url" value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5" placeholder="https://..." />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Descrição Curta</label>
                        <textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5" placeholder="Detalhes sobre o produto..."></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                            {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
