import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: "Supabase service configuration missing" });
  }

  // Bypass RLS to execute algorithmic updates securely
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch users and their scores
    const { data: scoresData, error: scoresError } = await supabase
      .from('scores')
      .select('user_id, score, played_at')
      .order('played_at', { ascending: false });

    if (scoresError) throw scoresError;

    const userMap: Record<string, number[]> = {};
    for (const row of (scoresData || [])) {
      if (!userMap[row.user_id]) userMap[row.user_id] = [];
      userMap[row.user_id].push(row.score);
    }

    // Filter down to ONLY users who have EXACTLY 5 scores
    const ticketHolders = Object.keys(userMap)
      .map(id => ({ user_id: id, scores: userMap[id] }))
      .filter(t => t.scores.length === 5);

    if (ticketHolders.length === 0) {
      return res.status(400).json({ error: "No subscribers currently have exactly 5 logged scores to qualify." });
    }

    // 2. Simulated Economics for the assignment presentation
    // Simulating ₹50,000 base revenue collection for impressive demo graphics
    const BASE_POOL = 50000; 
    const charityPayout = BASE_POOL * 0.10; 
    const availablePool = BASE_POOL - charityPayout;
    
    // Exact Tiers specified in PRD Section 6
    const poolTier5 = availablePool * 0.40; // Jackpot
    const poolTier4 = availablePool * 0.35; // 4 matches
    const poolTier3 = availablePool * 0.25; // 3 matches

    // 3. Generate 5 Random "Stableford" Winning Numbers (0 to 54)
    // We sort them for clean visual representation later
    const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 55)).sort((a,b) => a-b);

    // 4. Calculate Matches
    let tier5Winners = 0;
    let tier4Winners = 0;
    let tier3Winners = 0;

    const results = ticketHolders.map(ticket => {
      // Create a mutable copy of winning numbers to prevent duplicate matching
      const wins = [...winningNumbers];
      let matches = 0;
      for (const s of ticket.scores) {
        const idx = wins.indexOf(s);
        if (idx !== -1) {
          matches++;
          wins.splice(idx, 1);
        }
      }
      
      if (matches === 5) tier5Winners++;
      if (matches === 4) tier4Winners++;
      if (matches === 3) tier3Winners++;

      return {
        ...ticket,
        matches
      };
    });

    // 5. Document the Draw permanently in Database
    const { data: drawRecord, error: drawError } = await supabase
      .from('draws')
      .insert({
        winning_numbers: winningNumbers,
        total_pool: BASE_POOL,
        jackpot_payout: poolTier5,
        tier_4_payout: poolTier4,
        tier_3_payout: poolTier3,
        charity_payout: charityPayout
      })
      .select('id')
      .single();

    if (drawError) throw drawError;

    // 6. Record all participant tickets and their matched rewards
    const entriesToInsert = results.map(r => {
      let reward = 0;
      if (r.matches === 5 && tier5Winners > 0) reward = poolTier5 / tier5Winners;
      else if (r.matches === 4 && tier4Winners > 0) reward = poolTier4 / tier4Winners;
      else if (r.matches === 3 && tier3Winners > 0) reward = poolTier3 / tier3Winners;

      return {
        draw_id: drawRecord.id,
        user_id: r.user_id,
        matched_count: r.matches,
        score_snapshot: r.scores,
        reward_won: reward
      };
    });

    const { error: entriesError } = await supabase
      .from('draw_entries')
      .insert(entriesToInsert);

    if (entriesError) throw entriesError;

    return res.status(200).json({ 
      success: true, 
      draw: drawRecord.id,
      winning_numbers: winningNumbers,
      stats: { tier5Winners, tier4Winners, tier3Winners }
    });

  } catch (error: any) {
    console.error("Draw Engine Error:", error);
    return res.status(500).json({ error: `Failed to execute draw engine: ${error.message}` });
  }
}
