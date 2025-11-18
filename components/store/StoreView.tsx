
import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import PlusIcon from '../icons/PlusIcon';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import ProductFormModal from './ProductFormModal';

interface StoreViewProps {
    products: Product[];
    isAdmin: boolean;
    onAddProduct?: (product: Omit<Product, 'id' | 'dojo_id' | 'created_at'>) => Promise<void>;
    onEditProduct?: (product: Product) => Promise<void>;
    onDeleteProduct?: (productId: string) => Promise<void>;
}

const StoreView: React.FC<StoreViewProps> = ({ products, isAdmin, onAddProduct, onEditProduct, onDeleteProduct }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name_asc'>('name_asc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => {
        let result = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.market && p.market.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return result.sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            return a.name.localeCompare(b.name);
        });
    }, [products, searchTerm, sortBy]);

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveWrapper = async (productData: Omit<Product, 'id' | 'dojo_id' | 'created_at'> & { id?: string }) => {
        if (productData.id && onEditProduct) {
            await onEditProduct({ ...productData, dojo_id: '', affiliate_url: productData.affiliate_url, created_at: '' } as Product); // Mocking full object for type satisfaction inside wrapper
        } else if (onAddProduct) {
            await onAddProduct(productData);
        }
    };

    const handleDeleteWrapper = async (productId: string) => {
        if (onDeleteProduct && window.confirm("Tem certeza que deseja excluir este produto?")) {
            await onDeleteProduct(productId);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white">Loja do Dojo</h2>
                {isAdmin && (
                    <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Produto
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row gap-4">
                <input 
                    type="text" 
                    placeholder="Buscar produto..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-100 dark:bg-gray-700 border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 transition-colors"
                />
                <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-gray-100 dark:bg-gray-700 border-transparent focus:border-red-500 text-gray-900 dark:text-white rounded-lg px-4 py-2 cursor-pointer"
                >
                    <option value="name_asc">Nome (A-Z)</option>
                    <option value="price_asc">Preço (Menor - Maior)</option>
                    <option value="price_desc">Preço (Maior - Menor)</option>
                </select>
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                         const isActive = product.status !== false;
                         return (
                            <div key={product.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 group ${!isActive ? 'opacity-75' : ''}`}>
                                <div className="relative h-48 sm:h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'group-hover:scale-105' : 'grayscale'}`} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Imagem</div>
                                    )}
                                    {isAdmin && (
                                        <>
                                            {!isActive && (
                                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">Inativo</div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenEdit(product)} className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg"><EditIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteWrapper(product.id!)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    {product.market && (
                                        <div className="mb-1">
                                            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                                                {product.market}
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow line-clamp-3">{product.description}</p>
                                    <div className="flex justify-between items-end mt-auto">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Valor</p>
                                            <p className="text-xl font-bold text-red-600 dark:text-white">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                            </p>
                                        </div>
                                        <a 
                                            href={product.affiliate_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors ${!isActive ? 'pointer-events-none opacity-50' : ''}`}
                                        >
                                            Ver Produto
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum produto encontrado.</p>
                </div>
            )}

            {isModalOpen && (
                <ProductFormModal 
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveWrapper}
                />
            )}
        </div>
    );
};

export default StoreView;
