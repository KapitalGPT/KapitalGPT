@@ .. @@
   /*
     # Create comprehensive investor matching system
 
     1. New Tables
       - `investors`
         - Complete investor profiles with investment preferences
         - Investment ranges, stages, industries, geographic focus
         - Portfolio and criteria information
       - `startup_submissions` 
         - Captures all startup form data
         - Company details, funding needs, business description
       - `investor_matches`
         - Stores matching results with scores and reasons
         - Links submissions to relevant investors
 
     2. Investment Stages
-       - Pre-Seed: $0 - $500,000
-       - Seed: $500,000 - $2 million  
-       - Series A: $2 million - $10 million
-       - Series B: $15 million - $25 million
+       - Pre-Seed: $0 - $500,000
+       - Seed: $500,000 - $2 million
+       - Series A: $2 million - $10 million
+       - Series B: $10 million - $50 million
        - Other: Later stages
 
     3. Security
       - Enable RLS on all tables
       - Public read access for active investors
       - Authenticated access for data management
   */