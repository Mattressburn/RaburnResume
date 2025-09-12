 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import VinylDashboard from './pages/VinylDashboard';

 export default function AppRoutes(){
   return (
     <BrowserRouter>
       <Routes>
         {/* other routes */}
         <Route path="/dashboard" element={<VinylDashboard />} />
       </Routes>
     </BrowserRouter>
   );
 }

// =========================
// Setup checklist:
// 1) Place the enriched JSON at: /public/fan500.json (run scripts/discogs_enrich.py first)
// 2) Install dependencies: npm i recharts react-router-dom
// 3) Ensure Tailwind is active; page uses utility classes for dark theme.
// 4) Start dev: npm run dev, navigate to /dashboard
// 5) Filters are URL-synced (?ymin=&ymax=&dmax=&art=&lab=) so you can share filtered views.