
import { supabase } from './supabaseClient';
import { Notification } from '../types';

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        // Handle missing table gracefully in dev (42P01: undefined_table, PGRST205: schema cache miss/table not found)
        if (error.code === '42P01' || error.code === 'PGRST205') return [];
        console.error('Error fetching notifications:', error.message || error);
        return [];
    }
    return data || [];
};

export const fetchUnreadNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

    if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') return [];
        console.error('Error fetching unread notifications:', error.message || error);
        return [];
    }
    return data || [];
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return;
    
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);

    if (error) {
        // Suppress missing table error on update attempts
        if (error.code === '42P01' || error.code === 'PGRST205') return;
        console.error('Error marking notifications as read:', error.message || error);
    }
};

/**
 * Generic method to post a notification to a user.
 * Can be used by any part of the application.
 */
export const post_notification = async (
    userId: string, 
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type
        });

    if (error) {
         // Suppress missing table error on insert attempts
        if (error.code === '42P01' || error.code === 'PGRST205') return;
        console.error('Error posting notification:', error.message || error);
    }
};
