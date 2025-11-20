
import React, { useState, useEffect } from 'react';
import { Post, User, Dojo, UserRole } from '../../types';
import { supabase } from '../../services/supabaseClient';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import SpinnerIcon from '../icons/SpinnerIcon';
import PlusIcon from '../icons/PlusIcon';

interface FeedViewProps {
    user: User;
    userRole: UserRole;
    currentDojoId: string | null; // For filtering posts relevant to the user's context
    allDojos?: Dojo[]; // For Admin filter
    currentUserAvatar?: string | null; // Dojo Logo or Student Profile Picture
}

const FeedView: React.FC<FeedViewProps> = ({ user, userRole, currentDojoId, allDojos, currentUserAvatar }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDojoFilter, setSelectedDojoFilter] = useState<string>('all');
    const [tableMissingError, setTableMissingError] = useState(false);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const POSTS_PER_PAGE = 10;

    useEffect(() => {
        fetchPosts(0, true);
    }, [selectedDojoFilter, currentDojoId]); // Refetch on filter change

    const fetchPosts = async (pageIndex: number, reset: boolean = false) => {
        if (tableMissingError) return; // Stop if we know tables are missing

        if (reset) {
            setLoading(true);
            setPosts([]);
            setPage(0);
        }

        try {
            // Start building query from the base table
            let query = supabase.from('posts').select('*');

            // 1. Apply Filters
            if (userRole === 'S') {
                // Admin: Can see all. Optional Filter by Dojo.
                if (selectedDojoFilter !== 'all') {
                     query = query.or(`dojo_id.eq.${selectedDojoFilter},dojo_id.is.null`);
                }
            } else {
                // Master & Student: See their Dojo posts + Global (Admin) posts (dojo_id is null)
                if (currentDojoId) {
                    query = query.or(`dojo_id.eq.${currentDojoId},dojo_id.is.null`);
                } else {
                    // If no dojo linked, only global posts
                    query = query.is('dojo_id', null);
                }
            }
            
            if (searchTerm) {
                query = query.ilike('content', `%${searchTerm}%`);
            }

            // 2. Apply Order and Range
            const { data, error } = await query
                .order('created_at', { ascending: false })
                .range(pageIndex * POSTS_PER_PAGE, (pageIndex + 1) * POSTS_PER_PAGE - 1);

            if (error) {
                // Handle specific error for missing table (PGRST205 is PostgREST code for relation not found)
                if (error.code === '42P01' || error.code === 'PGRST205') {
                    console.warn("Community tables (posts) do not exist. Skipping fetch.");
                    setTableMissingError(true);
                    setLoading(false);
                    return;
                }
                throw error;
            }

            const newPosts = data || [];
            if (newPosts.length < POSTS_PER_PAGE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
            
            setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
            if (!reset) setPage(pageIndex);

        } catch (error: any) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        fetchPosts(page + 1);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPosts(0, true);
    };

    const handleSavePost = async (content: string, imageBase64: string | null) => {
        const userMeta = user.user_metadata;
        
        // Determine Author Role/Dojo
        let postDojoId = currentDojoId;
        if (userRole === 'S') postDojoId = null; // Admin Global Post

        const payload = {
            dojo_id: postDojoId,
            author_id: user.id,
            author_role: userRole,
            author_name: userMeta.name || 'Usuário',
            author_avatar_url: currentUserAvatar || userMeta.avatar_url || null,
            content: content,
            image_url: imageBase64,
            updated_at: new Date().toISOString()
        };

        if (editingPost) {
            const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.id);
            if (error) throw error;
            // Update local state
            setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...payload } : p));
        } else {
            const { data, error } = await supabase.from('posts').insert({
                ...payload,
                created_at: new Date().toISOString(),
                likes_count: 0,
                dislikes_count: 0,
                comments_count: 0
            }).select().single();
            
            if (error) throw error;
            if (data) {
                setPosts(prev => [data, ...prev]);
            }
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta publicação?")) return;
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (!error) {
            setPosts(prev => prev.filter(p => p.id !== postId));
        } else {
            console.error("Error deleting post:", error);
            alert("Erro ao excluir publicação. Tente novamente.");
        }
    };

    if (tableMissingError) {
        return (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-red-300 dark:border-red-800">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Funcionalidade Indisponível</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    O módulo de comunidade ainda não foi configurado no banco de dados.<br/>
                    (Tabelas 'posts' e 'comments' ausentes)
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-2xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white">Mural da Comunidade</h2>
                
                {(userRole === 'M' || userRole === 'S') && (
                    <button 
                        onClick={() => { setEditingPost(null); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold shadow-md"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Nova Publicação
                    </button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Buscar no feed..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow bg-gray-100 dark:bg-gray-700 border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2"
                    />
                    <button type="submit" className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300">
                        Buscar
                    </button>
                </form>

                {userRole === 'S' && allDojos && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Filtrar por Dojo</label>
                        <select 
                            value={selectedDojoFilter} 
                            onChange={e => setSelectedDojoFilter(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 border-transparent text-gray-900 dark:text-white rounded-lg px-4 py-2"
                        >
                            <option value="all">Ver Tudo</option>
                            {allDojos.map(d => (
                                <option key={d.id} value={d.id}>{d.name} - {d.team_name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Posts List */}
            {loading && page === 0 ? (
                <div className="flex justify-center py-20"><SpinnerIcon className="w-12 h-12 text-red-600"/></div>
            ) : (
                <div className="space-y-6">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                currentUser={user} 
                                currentUserAvatar={currentUserAvatar}
                                onEdit={(p) => { setEditingPost(p); setIsCreateModalOpen(true); }}
                                onDelete={handleDeletePost}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Nenhuma publicação encontrada para esta busca.' : 'Nenhuma publicação encontrada.'}
                            </p>
                            {searchTerm && (
                                <button onClick={() => {setSearchTerm(''); fetchPosts(0, true)}} className="text-blue-600 hover:underline mt-2 text-sm">
                                    Limpar busca
                                </button>
                            )}
                        </div>
                    )}
                    
                    {hasMore && (
                        <div className="text-center pt-4">
                            <button onClick={handleLoadMore} className="text-blue-600 hover:underline font-semibold text-sm">
                                Carregar mais publicações
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isCreateModalOpen && (
                <CreatePostModal 
                    post={editingPost}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleSavePost}
                />
            )}
        </div>
    );
};

export default FeedView;
