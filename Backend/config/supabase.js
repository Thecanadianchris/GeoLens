require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

// Connect to Supabase for image storage
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;