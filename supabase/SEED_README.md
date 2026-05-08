# 🌱 Data Seeding Instructions

## Problem
The database tables exist but are empty:
- ❌ 0 routes
- ❌ 0 route_versions  
- ❌ 0 levels
- ❌ 0 nodes
- ❌ 0 indicators

We need to populate these with:
- ✅ 1 Route (Violin pathway)
- ✅ 1 Route Version
- ✅ 10 Levels
- ✅ 160 Nodes (16 per level)
- ✅ 640 Indicators (4 per node)

## Solution

You need to run the SQL script in the **Supabase Dashboard** because:
1. The anon key doesn't have permission to insert into routes (RLS policy)
2. We don't have the service_role_key in this environment
3. The Dashboard uses admin credentials to bypass RLS

### Steps:

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Project: zmhmdvmyeyswunurcyow

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

3. **Copy & Run the SQL**
   - Open: `supabase/seed-route-simple.sql`
   - Copy ALL the SQL code
   - Paste into the query editor
   - Click "▶ Run" (or Ctrl+Enter)

4. **Verify**
   - You should see:
     ```
     Table          Count
     Routes         1
     Route Versions 1
     Levels         10
     Nodes          160
     Indicators     640
     ```

## After Seeding

Once the SQL runs successfully, the database will have the complete academic route structure, and the Teacher PWA can:

- ✅ Display the Violin academic pathway with 10 levels
- ✅ Show 160 learning nodes distributed across those levels
- ✅ Display 640 evaluation indicators (4 per node)
- ✅ Track student progress through the route
- ✅ Record evaluation attempts against indicators

Then we can proceed to **Phase C: End-to-End Testing** to verify the complete flow works.

## Alternative: Node.js Approach

If you have the `VITE_SUPABASE_SERVICE_KEY` (server secret), you can run:

```bash
node supabase/run-seed-complete.js
```

But this requires the service role key, which is typically not shared. The Dashboard approach above is recommended.
