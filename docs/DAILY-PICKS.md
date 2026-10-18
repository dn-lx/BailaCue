# Daily Picks: rating-led Salsa and Bachata practice

The default is **one video per selected style**. With Salsa and Bachata selected,
Today shows one of each when eligible videos exist. Select styles in Settings.
An older library receives this balanced default without losing its saved video data.
An old day's pre-update selection is migrated once to the new policy, unless skipped.

1. Exclude unavailable videos and anything below **Minimum star rating for picks**.
2. For each selected style, prefer videos not selected during the last three days
   (the current saved day is excluded from cooldown history).
3. Within the remaining pool, rank by stars first: 5★ before4★, and so on.
4. Break equal-star ties using preferred labels, learning status, last practice and
   explicit More/Less feedback. Those bonuses cannot outweigh a higher star rating.
5. If every eligible video of a particular style is on cooldown, choose from that
   style ignoring cooldown. Never lower the minimum rating or substitute styles.
6. Save the chosen IDs for the local day. Ordinary rating/label/feedback changes
   affect the next selection. **Update today’s picks** applies them immediately.

Changing the requested style mix, total-count mode/count or minimum rating updates
the plan. Loss of availability or a rating dropping below the minimum replaces an
ineligible pick. Adding a previously missing style fills that slot without replacing
existing valid choices. **Skip today** remains a scheduling choice, not a dislike.
Explicitly updating today's picks clears Skip and generates a new eligible selection.

A slot stays empty when no video qualifies; Today explains the missing style and
minimum rating. If only one suitable video exists for a style, it can repeat on
successive days. A high rating is a priority, not a promise to select the same video
every day regardless of cooldown. Use a higher minimum to avoid lower-rated picks.

The existing star control now says **Your rating · Daily Picks priority**. This is
your importance rating. More/Less feedback remains separate and never changes stars.

The picker is deterministic for the same library/history/day. This is metadata-based
selection, not video-content or automatic dance analysis. Picks are stored locally
and included in manual metadata sync; automatic server-stable scheduling across
unsynced devices remains pending. Recommendations do not mark a video watched;
opening/playing a video still drives its practice history.

Turn off **One video per selected style** to choose an overall count of1–3 instead.
That mode still ranks stars first and uses diversity only within equal ratings.
The minimum-rating requirement still applies.
