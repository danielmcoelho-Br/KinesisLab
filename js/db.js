// Supabase Initialization
const SUPABASE_URL = 'https://vreyoklzzrpfjaywmaeh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZXlva2x6enJwZmpheXdtYWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Njc3ODYsImV4cCI6MjA4ODU0Mzc4Nn0.DrPEyxyDdkgDQ_E_guVx6Lmckh1pKJs077o-ODxID48';

// Create a single supabase client for interacting with your database
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const db = {
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
    }
};

window.db = db;
