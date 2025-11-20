
import React, { useState, useEffect } from 'react';
import { Post, User, Comment } from '../../types';
import { supabase } from '../../services/supabaseClient';
import UserIcon from '../icons/UserIcon';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface PostCardProps {
    post: Post;
    currentUser: User;
    currentUserAvatar?: string | null;
    onEdit: (post: Post) => void;
    onDelete: (postId: string) => void;
}

// Helper Icons
const HeartIcon: React.FC<{filled: boolean, className?: string}> = ({ filled, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

// Heart with X over it (Dislike)
const HeartXIcon: React.FC<{filled: boolean, className?: string}> = ({ filled, className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5" stroke={filled ? "white" : "currentColor"} strokeWidth={2} />
    </svg>
);

const ChatBubbleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
);


const PostCard: React.FC<PostCardProps> = ({ post, currentUser, currentUserAvatar, onEdit, onDelete }) => {
    const [likes, setLikes] = useState(post.likes_count || 0);
    const [dislikes, setDislikes] = useState(post.dislikes_count || 0);
    const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(post.user_reaction || null);
    
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

    const isAuthor = post.author_id === currentUser.id;
    const isAdmin = currentUser.user_metadata.user_role === 'S' || currentUser.email === 'admin@meudojo.com';
    const canModify = isAuthor || isAdmin;

    // Simulating Reaction Logic (In real app, this hits DB)
    const handleReaction = async (type: 'like' | 'dislike') => {
        const previousReaction = userReaction;
        
        // Optimistic UI Update
        if (previousReaction === type) {
            // Toggle off
            setUserReaction(null);
            if (type === 'like') setLikes(prev => prev - 1);
            if (type === 'dislike') setDislikes(prev => prev - 1);
            await supabase.from('reactions').delete().match({ user_id: currentUser.id, target_id: post.id });
        } else {
            // New reaction or switching
            setUserReaction(type);
            if (type === 'like') {
                setLikes(prev => prev + 1);
                if (previousReaction === 'dislike') setDislikes(prev => prev - 1);
            }
            if (type === 'dislike') {
                setDislikes(prev => prev + 1);
                if (previousReaction === 'like') setLikes(prev => prev - 1);
            }
            
            // DB Update
            if (previousReaction) {
                // Update existing
                await supabase.from('reactions').update({ type }).match({ user_id: currentUser.id, target_id: post.id });
            } else {
                // Insert new
                await supabase.from('reactions').insert({
                    user_id: currentUser.id,
                    target_id: post.id,
                    target_type: 'post',
                    type
                });
            }
        }
    };

    const fetchComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }
        setLoadingComments(true);
        setShowComments(true);
        
        const { data } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });
        
        setComments(data || []);
        setLoadingComments(false);
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setSendingComment(true);
        
        const userMeta = currentUser.user_metadata;
        
        const newCommentPayload = {
            post_id: post.id,
            author_id: currentUser.id,
            author_name: userMeta.name || 'Usuário',
            author_avatar_url: currentUserAvatar || userMeta.avatar_url || null,
            content: newComment,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase.from('comments').insert(newCommentPayload).select().single();
        
        if (data) {
            setComments(prev => [...prev, data]);
            setNewComment('');
            setCommentsCount(prev => prev + 1);
        } else {
             console.error("Comment error", error);
        }
        setSendingComment(false);
    };
    
    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Remover comentário?")) return;
        await supabase.from('comments').delete().eq('id', commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentsCount(prev => prev - 1);
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {post.author_avatar_url ? (
                        <img src={post.author_avatar_url} alt={post.author_name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{post.author_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{post.author_role === 'S' ? 'Administrador' : (post.author_role === 'M' ? 'Mestre' : 'Aluno')}</p>
                    </div>
                </div>
                {canModify && (
                    <div className="flex items-center gap-2">
                         <button onClick={() => onEdit(post)} className="text-gray-500 hover:text-blue-500"><EditIcon className="w-5 h-5"/></button>
                         <button onClick={() => onDelete(post.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                )}
            </div>

            {/* Image */}
            {post.image_url && (
                <div className="w-full bg-black/5">
                    <img src={post.image_url} alt="Post Content" className="w-full h-auto max-h-[500px] object-contain" />
                </div>
            )}

            {/* Action Bar */}
            <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                    <button 
                        onClick={() => handleReaction('like')} 
                        className={`hover:scale-110 transition-transform ${userReaction === 'like' ? 'text-red-600' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <HeartIcon filled={userReaction === 'like'} className="w-7 h-7" />
                    </button>
                    <button 
                        onClick={() => handleReaction('dislike')} 
                        className={`hover:scale-110 transition-transform ${userReaction === 'dislike' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <HeartXIcon filled={userReaction === 'dislike'} className="w-7 h-7" />
                    </button>
                    <button onClick={fetchComments} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-transform hover:scale-110">
                        <ChatBubbleIcon className="w-7 h-7" />
                    </button>
                </div>
                
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                    {likes} curtidas {dislikes > 0 && <span className="text-gray-500 font-normal text-xs ml-2">({dislikes} descurtidas)</span>}
                </p>
                
                <div className="mb-2">
                    <span className="font-bold text-gray-900 dark:text-white mr-2 text-sm">{post.author_name}</span>
                    <span className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{post.content}</span>
                </div>
                
                <p className="text-xs text-gray-400 uppercase mb-2">{new Date(post.created_at).toLocaleDateString('pt-BR')} às {new Date(post.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>

                {/* Comments Section */}
                <button onClick={fetchComments} className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {commentsCount > 0 ? `Ver todos os ${commentsCount} comentários` : 'Nenhum comentário ainda.'}
                </button>

                {showComments && (
                    <div className="mt-4 space-y-3 animate-fade-in border-t border-gray-100 dark:border-gray-700 pt-4">
                        {loadingComments ? (
                            <div className="flex justify-center"><SpinnerIcon className="w-6 h-6" /></div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 text-sm">
                                     {comment.author_avatar_url ? (
                                        <img src={comment.author_avatar_url} alt={comment.author_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-gray-900 dark:text-white mr-2">{comment.author_name}</span>
                                                <span className="text-gray-700 dark:text-gray-300">{comment.content}</span>
                                            </div>
                                            {(comment.author_id === currentUser.id || isAdmin) && (
                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 hover:underline ml-2">Excluir</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                
                {/* Add Comment Input */}
                {showComments && (
                    <div className="mt-4 flex gap-2 items-center border-t border-gray-100 dark:border-gray-700 pt-3">
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Adicione um comentário..." 
                            className="flex-grow bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                        />
                        <button 
                            onClick={handleSendComment} 
                            disabled={!newComment.trim() || sendingComment}
                            className="text-blue-600 font-semibold text-sm disabled:opacity-50 hover:text-blue-700"
                        >
                            Publicar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
