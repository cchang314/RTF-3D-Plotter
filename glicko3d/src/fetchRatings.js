// src/fetchRatings.js
import { createClient } from '@supabase/supabase-js';

// Replace with env vars in production (Vite: import.meta.env.VITE_*)
const SUPABASE_URL = 'https://cxytmlxqoficotadtmab.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eXRtbHhxb2ZpY290YWR0bWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDcyMzksImV4cCI6MjA3ODM4MzIzOX0.Bx95F7ufVJmLUlJmwH4zvNdE5EmbGsD8GIwmMW0flbc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Normalize Glicko-2 rating (800-2200) to 0-100 scale, defensive to bad inputs
function normalizeRating(rating) {
  const min = 800;
  const max = 2200;
  if (typeof rating !== 'number' || Number.isNaN(rating)) rating = 1500;
  const pct = ((rating - min) / (max - min)) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

// Minimal photo map for known names (extend as needed)
const photoMap = {
            "Aiden Suganuma": "https://www.thecube.llc/static/media/aidensuganuma.3126d63249c98b402919.jpg",
            "Alex Boniske": "https://www.thecube.llc/static/media/alexboniske.c958ca550435720511aa.jpg",
            "Alexis Fox": "https://www.thecube.llc/static/media/alexisfox.9fddedf46775b7a836ca.jpg",
            "Avrick Altmann": "https://www.thecube.llc/static/media/avrickaltmann.2962baac481c96d2e2a3.jpg",
            "Brian Mason": "https://www.thecube.llc/static/media/brianmason.1d754f5b7455d04cb69d.jpg",
            "Brianna Yang": "https://www.thecube.llc/static/media/briannayang.b1a6cc543f582a9ed89f.jpg",
            "Claire Chang": "https://www.thecube.llc/static/media/clairechang.0ba7a8a19b6658fc97d4.jpg",
            "Jane Shin": "https://www.thecube.llc/static/media/janeshin.9c11a60627771be1c29c.jpg",
            "Jonah Stein": "https://www.thecube.llc/static/media/jonahstein.3b2666663214205c61a9.jpg",
            "Julia Chen": "https://www.thecube.llc/static/media/juliachen.3e523ce7d5d895f59168.jpg",
            "Paulina Vvedenskaya": "https://www.thecube.llc/static/media/paulinavvedenskaya.ad758ad986f8399743e7.jpg",
            "Rafael Soh": "https://www.thecube.llc/static/media/rafaelsoh.90dc2c640fb1455af0f9.jpg",
            "Rashmi Thapa": "https://www.thecube.llc/static/media/rashmithapa.1f8a2869f3728f81c5f0.jpg",
            "Sarthak Agrawal": "https://www.thecube.llc/static/media/sarthakagrawal.98becf14d552de9f748a.jpg",
            "Sarthak Dhawan": "https://www.thecube.llc/static/media/sarthakdhawan.cb8eb19a944daedbaf6e.jpg",
            "Thomas Hines": "https://www.thecube.llc/static/media/thomashines.8c6c95b7ff1aaf4761be.jpg",
            "Andri Kadaifciu": "https://www.thecube.llc/static/media/andrikadaifciu.e6ce027737160b390d5e.jpg",
            "Bilguun Zolzaya": "https://www.thecube.llc/static/media/bilguunzolzaya.85b87ad99f77588e0df1.jpg",
            "Brian Chen": "https://www.thecube.llc/static/media/brianchen.5862da7baff8f6d49e24.jpg",
            "Chloe Yang": "https://www.thecube.llc/static/media/chloeyang.103e0dc0e2317c85200e.jpg",
            "David Shenkerman": "https://www.thecube.llc/static/media/davidshenkerman.22ebe2a9aace6242b9e4.jpg",
            "Dhruva Barua": "https://www.thecube.llc/static/media/dhruvabarua.69420ae454b5d67f9e4b.jpg",
            "Evan Bulan": "https://www.thecube.llc/static/media/evanbulan.dee3aaa44b3b01832937.jpg",
            "Judy He": "https://www.thecube.llc/static/media/judyhe.44e9886e4b17e3840a2b.jpg",
            "Juliana Gates": "https://www.thecube.llc/static/media/julianagates.9f4911a90d03a8118b67.jpg",
            "Kartikeye Gupta": "https://www.thecube.llc/static/media/kartikeyegupta.6d81d7fa62376dd6ea68.jpg",
            "Kayla Liang": "https://www.thecube.llc/static/media/kaylaliang.f5d825fb70cc1289a0d6.jpg",
            "Kaylyn Zhong": "https://www.thecube.llc/static/media/kaylynzhong.82f7ccb726cfb79639cf.jpg",
            "Michelle Li": "https://www.thecube.llc/static/media/michelleli.371a405bace790d810e7.jpg",
            "Nikhil Pesaladinne": "https://www.thecube.llc/static/media/nikhilpesaladinne.5fe0b2660b878da2ff60.jpg",
            "Raphael Mukondiwa": "https://www.thecube.llc/static/media/raphaelmukondiwa.2d622fe8d1c290cc4034.jpg",
            "Sarah Tandon": "https://www.thecube.llc/static/media/sarahtandon.0f34021f85521a40eaf9.jpg",
            "Ting Ting Li": "https://www.thecube.llc/static/media/tingtingli.48df24abdb42b394cc2b.jpg",
            "Aaron Hsu": "https://www.thecube.llc/static/media/aaronhsu.2c939db0f8437be9aff3.jpg",
            "Anna Liu": "https://www.thecube.llc/static/media/annaliu.3d393ab8b322c834e47d.jpg",
            "Arvindh Manian": "https://www.thecube.llc/static/media/arvindhmanian.79c1ac445b9c2381b85e.jpg",
            "Aubteen Pour-Biazar": "https://www.thecube.llc/static/media/aubteenpour-biazar.2fe97968ea5340e786ed.jpg",
            "Ayush Jain": "https://www.thecube.llc/static/media/ayushjain.047dbf06730ab5a713fc.jpg",
            "Bill Ssewanyana": "https://www.thecube.llc/static/media/billssewanyana.6c45e1539bd4abea396e.jpg",
            "Divyansh Jain": "https://www.thecube.llc/static/media/divyanshjain.c896d81dfa744de4eaa6.jpg",
            "Eleanor Taylor": "https://www.thecube.llc/static/media/eleanortaylor.7cea9d66216289f8f304.jpg",
            "Hannah Choi": "https://www.thecube.llc/static/media/hannahchoi.1e663bbe71f35f8a5207.jpg",
            "John Buxton": "https://www.thecube.llc/static/media/johnbuxton.ce3d102780478f9f8f1a.jpg",
            "John Schappert": "https://www.thecube.llc/static/media/johnschappert.2cfb578d07ea4c8c74ba.jpg",
            "John Xu": "https://www.thecube.llc/static/media/johnxu.a2f51e78502b38b5fd49.jpg",
            "Kunling Tong": "https://www.thecube.llc/static/media/kunlingtong.1de16cae090c0e5f6f08.jpg",
            "Lasal Mapitigama": "https://www.thecube.llc/static/media/lasalmapitigama.9bd546f48653a7043337.jpg",
            "Nathan Shenkerman": "https://www.thecube.llc/static/media/nathanshenkerman.fb948bf1fbc207538a15.jpg",
            "Peter Liu": "https://www.thecube.llc/static/media/peterliu.3947d888af49b33d37a1.jpg",
            "Sophia Liu": "https://www.thecube.llc/static/media/sophialiu.d697baa2eb666bc8184c.jpg",
            "Taylor Moorehead": "https://www.thecube.llc/static/media/taylormoorehead.cc6d6987fecd991e5754.jpg",
            "Yura Heo": "https://www.thecube.llc/static/media/yuraheo.a04ed96ca10f8b4b03d4.jpg",
            "Aryan Mathur": "https://www.thecube.llc/static/media/aryanmathur.cc4031f997b4b70846e2.jpg",
            "Christian Okokhere": "https://www.thecube.llc/static/media/christianokokhere.95a6c04738cf781a6e62.jpg",
            "Holly Zhuang": "https://www.thecube.llc/static/media/hollyzhuang.cc0a66059d3e38390240.jpg",
            "Kasey Park": "https://www.thecube.llc/static/media/kaseypark.60d9451c439fe852d3fb.jpg",
            "N Wang": "https://www.thecube.llc/static/media/nwang.e0bb994957dd4c64be7d.jpg",
            "One Chowdhury": "https://www.thecube.llc/static/media/onechowdhury.4c6419c65cdb77cc82b3.jpg",
            "Pranay Vure": "https://www.thecube.llc/static/media/pranayvure.8fb7489f0f5e023e76df.jpg",
            "Richard Kim": "https://www.thecube.llc/static/media/richardkim.6a833178d95102a91634.jpg",
            "Aden Clemente": "https://www.thecube.llc/static/media/adenclemente.fc3aa2297d3914516876.jpg",
            "Athena Yao": "https://www.thecube.llc/static/media/athenayao.90600323a19baa053bad.jpg",
            "Clay Bromley": "https://www.thecube.llc/static/media/claybromley.bcc073e823955c7b5fc9.jpg",
            "Nils Roede": "https://www.thecube.llc/static/media/nilsroede.9903add37c3cb945a0d3.jpg"
  // Add more entries here if you have URLs. Do NOT leave the map unterminated.
};

// Resolve photo URL, falling back to local default placeholder
function getPhotoUrl(name) {
  if (!name || typeof name !== 'string') return '/photos/default.jpg';
  if (photoMap[name]) return photoMap[name];
  // If you want to attempt constructing a remote URL based on name, do it here.
  // For safety we return a local placeholder so missing remote files don't 404 in dev.
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `/photos/${slug}.jpg`; // put images in public/photos/ if you want to support this
}

// Fetch all ratings from Supabase and shape the data the app expects
export async function fetchAllRatings() {
  try {
    const { data, error } = await supabase
      .from('member_ratings')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log('No rows returned from Supabase; returning empty array.');
      return [];
    }

    // Group rows by member_name and collect categories (rizz/tizz/freak)
    const grouped = {};
    data.forEach((row) => {
      const name = row.member_name || 'Unknown';
      if (!grouped[name]) {
        grouped[name] = { name, rizz: 1500, tizz: 1500, freak: 1500 };
      }
      // row.category should be one of 'rizz'|'tizz'|'freak' and rating numeric
      if (row.category && typeof row.rating === 'number') {
        grouped[name][row.category] = row.rating;
      }
    });

    // Convert to array and normalize
    const out = Object.values(grouped).map((m, idx) => ({
      id: String(idx + 1),
      name: m.name,
      rizz: normalizeRating(m.rizz),
      tizz: normalizeRating(m.tizz),
      freak: normalizeRating(m.freak),
      photo: getPhotoUrl(m.name)
    }));

    return out;
  } catch (err) {
    console.error('Error in fetchAllRatings():', err);
    // Graceful fallback so UI can mount in dev
    return [
      { id: '1', name: 'Sample One', rizz: 70, tizz: 40, freak: 55, photo: '/photos/default.jpg' },
      { id: '2', name: 'Sample Two', rizz: 40, tizz: 80, freak: 20, photo: '/photos/default.jpg' }
    ];
  }
}

export default fetchAllRatings;
