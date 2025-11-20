
import { UserRole, RolePermission } from "../types";
import { supabase } from "./supabaseClient";

// Defines all possible views/pages in the application, acting as 'page_ids'.
export type AppView = 
    | 'dashboard' 
    | 'dojo_manager' 
    | 'exams' 
    | 'grading' 
    | 'public_dojo_page' 
    | 'diploma_generator' 
    | 'championships' 
    | 'student_dashboard' 
    | 'admin_store'
    | 'store'
    | 'sysadmin_panel'
    | 'metrics'
    | 'feed' // Mestre Feed
    | 'admin_community'; // Admin Feed View

/**
 * Fetches permissions from the 'system_roles' table in Supabase based on a user's role.
 * Now includes the dynamic title for the menu/page.
 * @param role The user's role ('M', 'A', or 'S').
 * @returns A promise that resolves to an array of RolePermission objects.
 */
export const getPermissionsForRole = async (role: UserRole): Promise<RolePermission[]> => {
    // If no role is provided, return no permissions.
    if (!role) {
        return [];
    }

    try {
        // Query the 'system_roles' table for page_id, title, and icon_code matching the user's role.
        const { data, error } = await supabase
            .from('system_roles')
            .select('page_id, title, icon_code')
            .eq('user_role_type', role);

        if (error) {
            // Log the error and throw it to be handled by the calling function in App.tsx
            console.error('Error fetching permissions from Supabase:', error);
            throw new Error(`Não foi possível carregar as permissões do usuário: ${error.message}`);
        }

        // Map to RolePermission interface
        return data.map(item => ({
            view: item.page_id as AppView,
            title: item.title || formatDefaultTitle(item.page_id), // Fallback if title is null
            icon_code: item.icon_code
        }));

    } catch (err) {
        // Catch any other potential errors during the process.
        console.error('An unexpected error occurred in getPermissionsForRole:', err);
        // Throw the error to be displayed to the user in the main App component.
        throw err;
    }
};

// Helper to provide a fallback title if DB is empty/null
const formatDefaultTitle = (view: string): string => {
    switch(view) {
        case 'dashboard': return 'Painel Principal';
        case 'dojo_manager': return 'Gerenciar Dojo';
        case 'feed': return 'Comunidade';
        case 'store': return 'Loja';
        case 'metrics': return 'Métricas';
        case 'public_dojo_page': return 'Minha Página';
        case 'championships': return 'Campeonatos';
        case 'exams': return 'Provas';
        case 'grading': return 'Graduação';
        case 'sysadmin_panel': return 'Painel Admin';
        default: return view;
    }
};
