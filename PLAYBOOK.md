# Channel Playbook

A faceless short-form channel (TikTok + Instagram Reels) that makes 9:16 videos rendered in code.
Paste this file into a Claude Project's instructions, or hand it to any new session, so every video follows the channel's rules from the first draft.

---

## 1. What the channel is

**Pillar 1. Interactive horror and mystery series (builds followers)**
- Examples: "Text from your own number", "429A", "Gas station night shift rules", "Floor 28".
- Formula: a mysterious job or situation, then strange rules, then a normal routine, then something goes wrong, then an impossible choice, then the audience votes A or B.

**Pillar 2. Pick-one / would-you-rather (reaches new viewers)**
- Examples: pick a planet, pick an island, pick a hotel room.
- Every option must be a real dilemma. Avoid generic perks such as love, money, never ageing or superpowers unless the twist is genuinely new.

**Pillar 3. Cheeky "body facts nobody explains" explainers (TikTok-first, shareable)**
- The breasts explainer reached 93k views and 3.8k shares on TikTok.
- Lead with a funny everyday word, keep it educational and never sexual, and keep it short (25 to 35s).

**Pillar 4. "In this town…" world-rule stories (testing)**
- One strange town rule, quick funny examples of living with it, a planted exception, someone breaks the rule, the hero finds out why, a twist that pays off the exception, an emotional ending back home.
- First-person narrator ("my dad", "my best friend"). Every part stands alone. Hook opens with "In this town…". Voice sped up 1.2x with pitch up (`tools/voice_speed.py`).
- A reference account doing this format gets 10K–320K views per video at 2–2.5 minutes. Learn the structure only, never their stories.

**Occasional videos**
- Shareable "send this to the friend who…" videos (the shower video had a 5% share rate).
- Big "what if" videos (humans disappeared, the world ending).
- Psychology and brain tricks (shapes).

**Avoid**
- Off-pillar one-offs that nothing else on the channel connects to.
- Recreating other creators' stories or branding. Learn their structure only.

---

## 2. Hooks (first 3 seconds decide everything)

**The triple hook. Say it, show it and write it on screen at the same time:**
1. **Context.** Make what the video is about clear in the first half of the first sentence.
2. **Lean.** Give a specific detail that makes viewers curious: a shock, a pain point or proof.
3. **Snapback.** Twist their expectation, ideally by about 3 seconds.

Example: "Leo opened the door to room 429A. Inside, it's still 1986. And the tea is still hot."

**Rules**
- Frame 1 must be a strong image with text already on screen.
- No fade in from black. No logo intros.
- Never open with "Have you ever wondered", "Imagine a world where" or "Welcome to".
- **Frame one shows exactly what the hook says.** Viewers decide in about one second. If the hook says "this animal shouldn't exist", show the animal immediately. Eyes first, ears second: the picture lands before the words do.
  - Put the most interesting moment of the video on frame one (not the build-up to it).
  - If the hook names a number or change (+15 cm, 90 seconds, knocking from the freezer), the number or change must already be visible on frame one.
  - Frame one should make people want to see frame two.
- Hook phrases worth rotating (adapted, not verbatim):
  - "Nobody talks about…"
  - "You might disagree, but…" (drives comments)
  - "X just realized something…"
  - "You're not gonna like…"
  - "Let me save you some time" (how-tos only)
- A cheeky or funny everyday word in the hook boosts shares, but the content must still be worth staying for.
- A flash-forward hook works for later parts of a series. For example: "You made it to the front door at 4.19… and you're already standing outside." Then "Let's rewind one minute."

---

### View ceilings (what blocks each level)

| Stuck under | Fix |
|---|---|
| 1k | **Hook clarity.** Subject is clear, stakes are clear, simple words, short punchy sentences. |
| 10k | **Topic selection.** Tie the topic to an outcome the viewer cares about (a pain point or a desire), and get to it early. |
| 100k | **Angle explosivity.** A non-obvious take that is broadly relatable. Example: "there's no muscle in them at all" took the breasts explainer to 93k. |
| 1M | **Broad topic or controversy.** A huge topic (dating, sports, music, culture, school), or a narrow topic with a take that starts arguments in the comments. |

The usual ceiling here is about 2k, so topic selection is the bottleneck.

- **Horror:** connect it to a real fear the viewer owns. Example: "If your phone does this at 3am…"
- **Facts:** use myth-busting angles on things everyone has.

## 2b. House style for the "So you…" invention videos (from @oddtilt, structure only)

The user wants our videos made much like this reference. Rules:
1. **Hook:** second person, an awkward or gross everyday problem in one line ("You're taking a shit, but your friend keeps trying to watch"). Frame 1 shows that exact situation.
2. **Loop:** "So you… / But… / So you…" through the REAL evolution of one everyday object, 5–6 steps, every fix true. Stock deadpan beats: "Clever!", "Except…", "Much better!"
3. **One silent recurring pest** who exploits each weakness (the peeking friend, the neighbour, the cat).
4. **Camera:** alternate close-ups of the mechanism being added or working (hinge, latch, bolt) with mid shots of reactions. A cut every 1–2 s.
5. **Look:** realistic textured sets (stone, weathered wood, grass, sky), natural daylight, stiff slightly goofy people in modern clothes.
6. **Text:** captions ONLY. No titles, labels, dates, stamps or counters. Small bold white captions with a soft dark shadow, 2–3 words at a time, centred in the MIDDLE of the frame.
7. **Sound:** crisp foley on every mechanism (creak, click, slide, thud). No music (the user adds it).
8. **Ending:** an absurd zoom-out reveal that breaks the setting's logic (the reference used cooling towers on the outhouse). No call to action. About 30–35 s.
Never copy his actual topics or reveals; invent our own objects, pests and endings.

## 3. Script rules

**Optional humour mode: "deadpan How It's Made" (use on SOME videos, not all).** Learned from a reference reel (trampoline invented to spy over a fence), structure only:
1. **Petty, ridiculous motive.** A real invention or fix explained as the solution to a dumb personal goal (beating the neighbour, getting the last slice, avoiding a sibling). Keep the motive petty or absurd, never genuinely creepy or harmful.
2. **Real educational chain underneath.** Problem → prototype → it fails → real fix, with every step factually true (fits the "But… So…" format).
3. **Deadpan narrator.** Calm, helpful documentary voice that never changes tone, even for the jokes.
4. **Casual micro-insults and a sudden swear.** E.g. "the frame snaps under your fat ass". One or two per video, never at a real person. Swears are bleeped by default for reach (the user can ask for uncensored).
5. **Slapstick treated as a routine bug.** Someone gets launched into the sky → "so you add a net". Big ragdoll physics, zero concern from the narrator.
6. **Callback ending.** The last line returns to the petty motive as if it was a noble achievement.
Fast cuts (1–2s per beat), punchy SFX (boing, snap, crunch) on each fail, stiff low-poly characters suit it. 30–40 seconds.

**Rhythm**
- Short sentences. Vary the length. Nothing repetitive.
- Put longer pauses before the important beats (write "~" in the narration file for a long pause).

**Structure**
- Describe first, then give the twist. Never tease the catch before showing the thing. Example: "Planet C has… But it's very hot."
- Use J cuts: let the audio describing something begin before the picture of it arrives.
- Keep open loops and re-hooks running. Example: "Room D is the free one…"
- Every story needs someone to root for, something at risk and a reason it matters now.
- Add humour where it fits, even in horror (the crabs are rude).
- Never pad. Cut any line that does not move the story.
- Length is flexible: the video can be as long as the story needs, as long as nothing is filler. Cut empty space, repeated lines and slow setup, not content. (Earlier note for reference: a 66s video with 14s average watch time on TikTok had padding, which was the real problem.)

**Facts**
- Never invent facts or studies. If no solid study exists, frame it as convention ("designers use squares…").

**Series rules**
- Every part must work for a brand-new viewer: a standalone hook plus a 3-second recap.
- The next part must actually follow the audience's vote.
- Pay off earlier mysteries instead of piling on new ones.
- Show rules as a quick on-screen recap in later parts instead of reading them all out again.
- Use a fixed season length (for example "Night 1/7"), so viewers know where they are.

---

## 4. Calls to action

**No mid-video calls to action (user rule, Nov 2026).** Spoken or on-screen like/follow/comment asks in the middle of a video drop retention. Keep the middle 100% story or content.
- The like/follow/comment ask goes **only at the very end**, in one short line (or on-screen only), after the payoff.
- Use a one-word comment keyword or a single letter (A/B, A/B/C/D, or a word). Options are always capital letters.
- Give them something to argue about: "Most people pick B. They're wrong."
- Pin a comment or poll as soon as the video is posted. A poll once got 22 votes.

**Ending**
- Loop it. The last frame matches the first frame, with no fade to black.
- Keep the outro under about 3 seconds.

---

## 5. Voice, text and sound

**Narrator**
- am_michael (Kokoro TTS).
- **"In this town…" videos only: fast and slightly higher-pitched delivery** (the energetic story-channel sound). After narrate.py, run `tools/voice_speed.py` (1.2x speed with pitch up, timings rescaled) so the video needs no speed-up in the edit. All other videos keep the normal narrator voice.
- A whispered version of the narrator for impostor, ghost or phone lines.
- Check pronunciation every time and force the phonemes when needed. Known traps:
  - catches (kætʃɪz)
  - close as a verb (kloʊz)
  - Bouba (buːbə)
  - Kiki (kiːki)
  - a second "A M" (write "in the morning")
  - stressing important final words (write "Is Leo", not "Is him")
- **Never use word emphasis (user rule, Nov 2026).** No slowed, louder or paused-before emphasis words in the narration, and no bigger popping emphasis words in the captions. Keep the narration at one even delivery. (A shouted character line, like an angry outburst, is a separate thing and still allowed when the story calls for it.)

**On-screen text**
- Replace ":" and "-" with "." in on-screen text (for example 4.29 AM).
- Keep the same fonts across videos (Russo, Poppins).
- Captions are word-synced, about 3 to 5 words each, with numbers merged (2006, 95%, 429A).

**Sound**
- Sound effects only on real on-screen actions: knocks, rings, locks, coins, crashes and so on.
- Transition whooshes only on some cuts, where they fit (big reveals). Never on every cut.
- **No background music.** The user adds music in the edit. Deliver narration plus sound effects only.
- **Sound effects must never be louder than the narration.** That includes explosions, thunder and stings. In the mix, cap the SFX bus so its loud moments sit at least 6 dB below the narration's level (`sfx *= min(1, 0.5 * peak(voice) / peak(sfx))`, then a soft limiter), and duck it under speech by about 50 to 60%. The voice should always be the clearest thing you hear.

---

## 6. Visuals and editing

- A change every 1 to 2 seconds. No dead space longer than about 0.1s. Animations simple and purposeful.
- Build visual structures for explainers: labelled diagrams, checklists, progress rails, comparison grids, 2x2 option grids.
- Survival-game HUD for horror series: night or day counter, clock, rules checklist, a resource that runs out.
- Keep characters, sets and style consistent within a series. Vary character looks: skin, hair, glasses, height.
- **Before every new video, ask the user to pick a style with clickable options** (two questions: 3D styles and 2D styles, with "Other" for anything new). Styles used so far:
  - **3D:**
    - **Stylised-realistic 3D** (video-game look: smooth PBR, shadows, detailed sets). Example: Source Code v2.
    - **Smooth 3D (PS4-ish)**: warm lighting, rounded characters. Examples: 429A, Gas Station, prison 3rd-person.
    - **PS3 low-poly first person**: faceted polygons, first-person hands. Examples: Prison Escape P1/P2.
    - **Cosy pixel 3D**: low-res pixelated render, pixel font. Example: Pick a Planet.
    - **Neon glass 3D**: glowing glass shapes on dark. Example: Shapes (neon).
    - **Space / scale zoom**: continuous zoom across sizes. Example: Atom to Star.
    - **PS2 retro low-poly**: chunky, low-res textures. Not used yet.
    - **Bright blocky 3D**: box characters with 2D faces, sunny saturated town, name tags. Example: In This Town (body swap).
  - **2D:**
    - **Flat vector**: clean cartoon characters. Examples: Shower, Fat Friend, Your Number.
    - **Paper collage**: torn paper cut-outs, tape, stop-motion. Example: Eiffel Tower.
    - **Miniature tilt-shift**: tiny-world look. Not used yet.

---

## 7. What the numbers have taught us

| Video | Result | Lesson |
|---|---|---|
| Breasts explainer (TikTok) | 93k views, 3.8k shares, 41 followers | A cheeky topic with a clean educational treatment spreads. It was too long (66s), and it needed a reason to follow. |
| Shower "send this to them" | 5.4k views, 272 shares (5%), 59 likes | A share machine, but weak retention. Keep it to 15 to 20s and add one surprise. |
| GTA "world could end" | Early version dropped to 25% by 10s; improved version held 47% | The like/follow ask at 4s caused the drop. A clear question plus a visual meter fixed the hook. |
| Pick an island | Flat middle, about 36% to the end | Pick-ones hold attention once people get past the opening. |
| Pick a hotel room | 33% held, 0.0% comments | The vote ask came too late, and the reward wasn't in the hook. |
| Text from your own number | Top views and follows on Instagram | Interactive horror series build followers. |
| Floor 28 day 6 | 1 like | Late series parts die without a standalone hook. |
| **"Send this to the friend who goons" (IG)** | **203.6K plays, 4.9K likes, 142 comments**; TikTok 754 views but **48 shares (6%)** | **Breakout format.** |
| **"Send this to your friend who doesn't shower" (IG)** | **182.8K plays, 3.7K likes, 140 comments** | Same format, same result. Make "Send this to your friend who…" the main series. |
| Series parts (Prison P1→P2, Gas N1→N2, IG) | 2.2K→595, 2.1K→464 | Follow-up parts lose most viewers. Keep series as a side pillar. |
| Source Code full explainer (2 min) | 531 IG plays / 221 TikTok | Long recaps don't suit this audience yet. |
| TikTok overall (Nov 2026) | Every video 33–958 views, 87 followers | New-account ceiling. Shares are the lever, and only the "send this" format gets them. |
| **Instagram owner insights (15 Nov 2026, 12 reels)** | Goon: 264K plays, **34K shares (13%)**, 36% watched, 37% early skip. Everything else: 100–2.3K plays, ~0 shares, 16–36% watched, 35–60% early skip. | **Shares drive reach, not retention.** Retention ceiling is ~36%. Targets: early skip under 35%, watched over 36%, share rate over 2%. Phone friend (60% skip, 200 plays) = a polite topic flops. Source Code had the longest avg watch (26.7s) and 10 saves but no spread. |

---

## 8. Every-video checklist

**Step 0: check the stats first (every time the user asks for a video).**
- Pull the latest reels with `vidiq_instagram_owner_insights` (mode reels, account id from `vidiq_social_account_list`; free, 0 credits). Use TikTok public stats (`vidiq_tiktok_profile_videos`) only if the user OKs the credits.
- Compare each recent reel's plays, share rate, % watched, average watch time and early-skip rate against the benchmarks below.
- Tell the user in a few lines what the numbers say and what this video will do differently because of them, before building it.

- [ ] Frame 1 is a strong image with the hook text already on screen
- [ ] Frame 1 *shows* what the hook *says* (the payoff image, not the setup)
- [ ] Triple hook lands by about 3s
- [ ] The narration rhythm is right: short lines, pauses, describe then twist
- [ ] No mid-video like/follow/comment asks; one short ask at the end only, single keyword or letter
- [ ] Sound effects only on actions; whooshes only on big moments; no background music
- [ ] Nobody floats: anyone sitting or lying is checked in snapshots (beds, chairs, crates)
- [ ] Pronunciation checked
- [ ] On-screen text uses "." for ":" and "-"; options are capital A/B
- [ ] No filler or empty space (length is flexible), ending loops, outro under 3s
- [ ] Self-critique before delivery: would someone stop scrolling? Is any section boring? Does anything feel AI-generic?
- [ ] Deliver the title plus 5 hashtags, together under 100 characters, plus the direct download link

---

## 9. Tools tested

- **VoiceStudio / OmniVoice + Hallmark test video done** (16 Nov 2026, output/laugh-test).
  - **Voice: not used (user decision).** Don't use VoiceStudio / OmniVoice; keep the normal Kokoro narrator.
  - Hallmark design rules carry over to on-screen video design: tokens for colours and fonts, sentence case, one idea per screen, no invented numbers. `sloplint.mjs` (static checks only, no network) lints the HTML; aim for 0 FAIL.
