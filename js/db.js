// Supabase Initialization
const SUPABASE_URL = 'https://vreyoklzzrpfjaywmaeh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZXlva2x6enJwZmpheXdtYWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Njc3ODYsImV4cCI6MjA4ODU0Mzc4Nn0.DrPEyxyDdkgDQ_E_guVx6Lmckh1pKJs077o-ODxID48';

// Create a single supabase client for interacting with your database
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Create a secondary client specifically for admin creation of users
// This prevents the admin from being logged out when creating a new user
const adminSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storageKey: 'supabase-admin-temp-key',
        autoRefreshToken: false,
        persistSession: false
    }
});

const db = {
    /**
     * Authentication Methods
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    /**
     * Admin Methods
     */
    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('name');
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async createUser(email, password, name, role) {
        try {
            // Use the secondary client so the current admin user session is not modified
            const { data, error } = await adminSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        role: role
                    }
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Saves a new patient to the database
     * @param {Object} patientData - { name, age, gender, dominance, activity_level }
     * @returns {Promise<Object>} The saved patient record with its new ID
     */
    async savePatient(patientData) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .insert([patientData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error saving patient:', error);
            throw error;
        }
    },

    /**
     * Searches patients by name
     * @param {string} query - The search string
     * @returns {Promise<Array>} List of matching patients
     */
    async getPatients(query = '') {
        try {
            let request = supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });

            if (query && query.trim() !== '') {
                request = request.ilike('name', `%${query}%`);
            }

            // Limit to recent/top 50 to avoid massive payloads
            const { data, error } = await request.limit(50);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    /**
     * Saves an assessment record linked to a patient
     * @param {Object} assessmentData - { patient_id, assessment_type, segment, clinical_data, questionnaire_answers }
     * @returns {Promise<Object>} The saved assessment record
     */
    async saveAssessment(assessmentData) {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .insert([assessmentData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error saving assessment:', error);
            throw error;
        }
    },

    /**
     * Gets all historical assessments for a specific patient
     * @param {string} patientId - The UUID of the patient
     * @returns {Promise<Array>} List of assessments ordered by newest first
     */
    async getPatientAssessments(patientId) {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching patient assessments:', error);
            throw error;
        }
    },

    /**
     * Deletes a patient (admin only). Cascade deletes assessments via Supabase FK.
     * @param {string} patientId - The UUID of the patient
     */
    async deletePatient(patientId) {
        try {
            // ON DELETE CASCADE in Supabase handles assessments automatically
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', patientId);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    },

    /**
     * Deletes a single assessment record (admin only).
     * @param {string} assessmentId - The UUID of the assessment
     */
    async deleteAssessment(assessmentId) {
        try {
            const { error } = await supabase
                .from('assessments')
                .delete()
                .eq('id', assessmentId);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting assessment:', error);
            throw error;
        }
    }
};

window.db = db;
