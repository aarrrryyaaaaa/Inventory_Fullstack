const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testConnection() {
    console.log("Testing Supabase Connection...");
    console.log("URL:", process.env.SUPABASE_URL);

    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Connection FAILED:", error.message);
        } else {
            console.log("✅ Connection SUCCESSFUL!");
            console.log("User table is accessible.");
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testConnection();
