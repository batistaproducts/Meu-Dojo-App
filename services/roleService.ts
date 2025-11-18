
import { UserRole } from "../types";
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
    | 'metrics'; // Nova view de métricas

/**
 * Fetches permissions from the 'system_roles' table in Supabase based on a user's role.
 * This replaces the previous mock implementation.
 * @param role The user's role ('M', 'A', or 'S').
 * @returns A promise that resolves to an array of AppView strings the user is allowed to access.
 */
export const getPermissionsForRole = async (role: UserRole): Promise<AppView[]> => {
    // If no role is provided, return no permissions.
    if (!role) {
        return [];
    }

    try {
        // Query the 'system_roles' table for all 'page_id's matching the user's role.
        const { data, error } = await supabase
            .from('system_roles')
            .select('page_id')
            .eq('user_role_type', role);

        if (error) {
            // Log the error and throw it to be handled by the calling function in App.tsx
            console.error('Error fetching permissions from Supabase:', error);
            throw new Error(`Não foi possível carregar as permissões do usuário: ${error.message}`);
        }

        // The data is an array of objects, e.g., [{ page_id: 'dashboard' }, ...].
        // We map it to an array of strings.
        return data.map(item => item.page_id as AppView);

    } catch (err) {
        // Catch any other potential errors during the process.
        console.error('An unexpected error occurred in getPermissionsForRole:', err);
        // Throw the error to be displayed to the user in the main App component.
        throw err;
    }
};
