# OptimalX image brief

Written for: the owner, generating brand photography with an image model.

Every image the site needs, what it is for, where it goes, and the prompt to
generate it. Icons are not here: all 40 category, goal and trust glyphs already
exist as vectors in `app/assets/ox-sprite.svg` and need nothing.

## Read this first: the one thing that makes a set look like a brand

A collection of individually good photographs still looks like stock unless the
light, the grade and the lens are the same across all of them. **Prepend the
house block below to every prompt in this document.** It is what makes twelve
separate generations read as one shoot.

> **HOUSE BLOCK, prepend to every prompt**
>
> Editorial commercial photography for a premium sports nutrition brand.
> Shot on a full-frame camera with an 85mm lens at f/2.0, shallow depth of
> field, subject sharp and background falling away softly. Single hard key
> light from high and to one side, deep shadows, no fill, no softbox flatness.
> Colour grade: cool desaturated shadows, neutral skin, one warm accent only,
> a vivid red-orange at hex F54915, appearing as a practical light, a rim
> highlight or a single prop, never as a colour wash. Charcoal and near-black
> environment. Fine natural film grain. Photorealistic, not illustrated, not
> 3D rendered, not HDR.

### And the rule that matters most

**No text, no letters, no numbers, no logos, no watermarks, no signage, no
product labels facing camera.** Every reference image supplied so far had text
burnt into it, and some of it was misspelled Arabic, including "optimat". Any
text on the finished site is live HTML in Arabic from the locale files, drawn
over the photograph. A generated letterform can never be corrected, is never
translatable and is never accessible.

> **NEGATIVE PROMPT, append to every prompt**
>
> text, letters, words, numbers, logos, watermarks, signage, brand labels,
> readable packaging, captions, subtitles, UI elements, borders, frames,
> collage, split screen, extra limbs, deformed hands, plastic skin, waxy
> render, oversaturated, HDR, lens flare, heavy vignette, stock-photo smile

### Casting and wardrobe, for this market

The store serves Saudi Arabia, and both Saudis and residents from elsewhere.

- Cast a mix across the set: Gulf Arab, South Asian, East African, Western.
  Not one ethnicity repeated.
- **Women are photographed in modest athletic wear**: full-length leggings and
  a loose long-sleeved top. No midriff, no low necklines, no tight cropped
  tops. This is not optional for this market.
- Men in standard athletic wear, sleeveless is fine.
- No alcohol, no gambling imagery, no immodest posing, no physical contact
  between men and women.
- Faces are welcome but never required. A strong back, forearm, grip or
  silhouette often reads better and ages further.

### Technical

- Generate at **twice** the listed size, then downscale. Detail survives the
  downscale and does not survive an upscale.
- Deliver **WebP** at quality 78 to 82, and a JPEG fallback only if a tool
  needs one. Every one of these is a photograph, so never PNG.
- Keep every file **under 200KB** after compression. The hero may reach 300KB.
  The build budget assumes it.
- Name the file exactly as listed. The components already reference these
  paths.

---

## 1. Hero, desktop

- **Path** `public/assets/images/hero-home.jpg` (replace)
- **Size** 2560 x 1100, deliver at 5120 x 2200
- **Where** the homepage hero, full bleed behind the headline
- **Composition rule** the subject sits **right of centre**. The left 45 per
  cent must be quiet, dark and uncluttered, because the Arabic headline, the
  Latin subline and two buttons sit there. Do not centre the subject.

> A muscular male athlete in a black sleeveless training top, chalking his
> hands, head lowered in concentration, standing in a dark industrial gym.
> He is positioned to the right of frame. Behind him, out of focus, a rack of
> weights and steel structure recedes into near-black. A hard key light from
> the upper right carves his shoulders and forearms out of the darkness and
> leaves the left third of the frame in deep shadow. A faint red-orange
> practical glow from a fixture far behind him on the right. Wide cinematic
> framing, generous empty dark space on the left half of the image.

## 2. Hero, phone

- **Path** `public/assets/images/hero-home-mobile.jpg` (replace)
- **Size** 1170 x 1400, deliver at 2340 x 2800
- **Where** the same hero below 1024
- **Composition rule** vertical. The subject sits in the **lower two thirds**;
  the top third stays dark and quiet for the headline.

> The same athlete and the same gym, framed vertically. He occupies the lower
> two thirds of the frame, seen from the chest up, head lowered. The upper
> third is dark empty gym space falling to near-black. Hard key light from the
> upper right. A faint red-orange practical glow deep in the background.

## 3 to 8. The six goal cards

- **Path** `public/assets/images/goal-<slug>.jpg`
- **Size** 800 x 1000, deliver at 1600 x 2000
- **Where** the homepage `تسوق حسب هدفك` row, and the top of each goal landing
- **Composition rule** portrait. The subject fills the frame. The **lower
  third must be darker and quieter**: the title, a subtitle and a button are
  drawn over it. A corner of the card carries an accent slash in CSS, so leave
  the top corners free of critical detail.

Each is one shot, same grade, same light. The variation is the movement.

**3. `goal-muscle.jpg`, building muscle**
> A male athlete seen from behind, mid dumbbell row, back muscles engaged and
> defined, in a dark gym. Hard side light rakes across the back. The lower
> third of the frame falls into deep shadow.

**4. `goal-strength.jpg`, strength and performance**
> A male athlete at the bottom of a barbell back squat, bar loaded with plates
> across his shoulders, face set with effort, in a dark gym. Shot slightly from
> below. Hard key light from the upper left. The lower third falls into deep
> shadow.

**5. `goal-lean.jpg`, definition and fat loss**
> A lean female athlete in full-length black leggings and a loose long-sleeved
> grey training top, mid battle-rope wave, arms blurred with motion, in a dark
> gym. Hard key light from one side. The lower third falls into deep shadow.

**6. `goal-weight.jpg`, healthy weight gain**
> A close still life of a stainless steel shaker bottle beside a scoop of
> unbranded cream-coloured powder and a scatter of rolled oats on a dark
> charcoal stone surface. Hard side light, long shadows, a faint red-orange rim
> on the shaker's edge. No packaging, no labels. The lower third is empty dark
> surface.

**7. `goal-recovery.jpg`, recovery and energy**
> A male athlete seated on a gym bench in low light, head tipped back against
> the wall, a towel around his neck, breathing after effort. Quiet, still, not
> straining. A single hard light from high above. The lower third falls into
> deep shadow.

**8. `goal-daily.jpg`, everyday health**
> A woman in modest athletic wear, full-length leggings and a loose long-
> sleeved top, walking outdoors at dawn on a quiet path, seen in profile,
> relaxed and unhurried. Cool blue-grey dawn light with a low warm red-orange
> sun just breaking the horizon behind her. Softer and more open than a gym
> frame, and the only image in the set shot outdoors. The lower third is quiet
> ground.

## 9 to 11. The three advisory plan cards

- **Path** `public/assets/images/plan-<slug>.jpg`
- **Size** 800 x 600, deliver at 1600 x 1200
- **Where** the homepage `برامج وخطط التغذية` row
- **Why these matter** this is the half of the business that is advice rather
  than product. If these read as stock, the store reads as a shelf. Each one
  should look like thought, not exertion.

**9. `plan-nutrition.jpg`, nutrition plans**
> An overhead flat lay on a dark charcoal surface: a plain notebook open to
> blank unlined pages, a pen, a measuring tape coiled loosely, and a small
> white bowl of almonds. Hard side light, long clean shadows. No text on the
> pages. Calm and considered.

**10. `plan-training.jpg`, training plans**
> A dark gym floor seen from above at a slight angle: a pair of worn training
> shoes, a jump rope coiled beside them, and a single dumbbell. Nobody in
> frame. Hard light from one side, deep shadows, a faint red-orange glow at the
> edge of the frame.

**11. `plan-advisory.jpg`, consultation**
> Two people seated across a small table in a calm, dimly lit modern room, seen
> from the side at middle distance, in conversation. Both are in plain
> contemporary clothing. Their faces are not the subject; the framing is about
> the attention between them. Warm low light from a window on one side.

## 12. Campaign band

- **Path** `public/assets/images/campaign-band.jpg`
- **Size** 1600 x 600, deliver at 3200 x 1200
- **Where** the homepage promotional band. **Gated**: it renders only when a
  real campaign exists, so this is needed the day the owner runs one.
- **Composition rule** the product sits **left of centre**; the right half
  stays dark for the Arabic headline and the button.

> A single large unbranded matte black supplement tub standing on a dark
> charcoal surface, positioned left of centre, lit by one hard light from the
> upper left so a long shadow falls to the right. The right half of the frame
> is empty near-black space. A faint red-orange rim light traces the tub's left
> edge. The tub is plain with no label, no lettering and no graphics.

## 13. Product page brand band

- **Path** `public/assets/images/athlete-band.jpg` (already exists, replace to
  match the new grade)
- **Size** 1600 x 500, deliver at 3200 x 1000
- **Composition rule** the subject sits **left of centre**. The right 55 per
  cent must be dark and quiet: the Arabic headline, a subline, three fact
  badges and the logo lockup are drawn over it.

> A close crop of a muscular forearm and hand gripping a heavy dumbbell,
> veins and tendons raised, positioned on the left of the frame. The background
> is a dark out-of-focus gym falling to near-black across the right half of the
> image. One hard light from the upper left. A faint red-orange glow deep in
> the background on the left.

## 14. About page

- **Path** `public/assets/images/about-story.jpg`
- **Size** 1600 x 900, deliver at 3200 x 1800
- **Where** the About page. **This one must be honest**: the store is new and
  has one branch in Al-Khalidiyah, Medina. Do not generate a warehouse, a team
  of twenty, or a laboratory. None of those exist and the page says the store
  is new.

> The interior of a small, clean, modern retail shop at dusk, shelves of plain
> unbranded containers neatly arranged, warm light from within, nobody in
> frame. Quiet and orderly rather than busy. Shot from the doorway at middle
> distance. No signage, no lettering anywhere.

## 15. Social share card

- **Path** `public/assets/images/og-default.jpg`
- **Size** 1200 x 630, deliver at 2400 x 1260
- **Where** the Open Graph and Twitter card fallback for any page without its
  own image. It appears in WhatsApp previews, which is where most Saudi sharing
  happens, so it matters more than its size suggests.
- **Composition rule** simple and legible at thumbnail size. The logo is
  composited over this afterwards in an editor; leave the centre clear.

> A dark charcoal textured surface lit by a single hard raking light from the
> upper left, with a broad diagonal band of deep red-orange glow crossing the
> lower right corner. No objects, no people, no text. An abstract premium
> background with generous empty space in the centre.

## 16. Empty plate

- **Path** `public/assets/images/placeholder.png` (already exists, keep)
- Nothing to generate. It is the neutral tile behind a product with no
  photograph, and it should stay plain.

---

## Sequence, if the whole set cannot be made at once

1. **Hero desktop and phone.** The first screen, and the LCP element.
2. **The six goal cards.** The largest visual block on the homepage and the
   thing that makes it look composed rather than assembled.
3. **The product page band.** The only photograph on the page the owner
   specified exactly.
4. **The three plan cards.** Without these the advisory half reads as an
   afterthought.
5. **The social card.** One image, disproportionate reach through WhatsApp.
6. **About, and the campaign band** when a campaign exists.

## After generating

Drop each file at the exact path listed and the components pick it up: they
already reference these names. Then check three things.

- **Weight.** Anything over 200KB, or 300KB for the hero, needs recompressing.
- **The quiet area.** Open the page and confirm the Arabic text sits on dark,
  uncluttered pixels, not across a face or a barbell. This is the failure that
  looks worst and is easiest to miss.
- **The set together.** Put all twelve side by side. If one is warmer, flatter
  or softer than the rest, regenerate it rather than keeping it. One
  mismatched frame undoes the other eleven.


---

## The three booking cards: layout reference, and the images to generate

The owner supplied a strip of three service cards and asked for each image to
be cropped and used. **They cannot be.** Measured on the source, which is
869x142 in total: each card's photograph occupies about 110px of width. A
service card at a 1296 measure divided three ways is about 420 wide, so its
photograph needs roughly 1000px to survive a 2x display. That is a nine-fold
upscale of a blended, already-soft crop, and no sharpening invents detail that
was never captured. Using them would ship three smears.

What the strip IS, and it is worth more than the pixels: the layout.

### The card construction, which is new and replaces the dark service card

Each card is a LIGHT card, not a dark one, and the photograph is not a
background behind the text. It bleeds in from the card's trailing edge,
occupying roughly the last 40 per cent, and fades to the card's own white
across a horizontal gradient so the text half stays clean. Content sits on the
clean half: an outline glyph in a rounded tile at the top, then the service
name, then two lines of body, then a text link with a leading arrow.

This is the anti-template lesson again. The photograph is not boxed, not
cropped to a rectangle with a border, and not dimmed behind type. It is part
of the card's surface, and the gradient is what joins them.

Three cards in a row, equal width, a hairline between the card and the page,
no shadow.

### The three images to generate

House block and negative prompt as above. All three at **1400 x 900**,
delivered at 2800 x 1800, saved as WebP into `public/assets/images`.

**`service-branch.webp` - the branch visit**
> The exterior of a small modern supplement shop at dusk, seen at a slight
> angle from across the pavement, its interior warmly lit and visible through
> full-height glass, dark cladding above the windows, a quiet city street with
> no people in frame. The right two thirds of the image hold the shopfront and
> the left third is open pavement and soft out-of-focus street, so the frame
> can fade into a card. No signage, no lettering, no logos anywhere.

**`service-video.webp` - the video consultation**
> An open laptop on a clean desk photographed at a low three-quarter angle,
> its screen turned away from camera so nothing on it is readable, beside a
> notebook and a glass of water, in a calm room with soft daylight from one
> side. Shallow depth of field. The subject sits to the right of frame and the
> left third falls away into soft light. No text, no interface, no screen
> content.

**`service-written.webp` - the written question**
> A hand holding a phone at a slight angle, photographed close, the screen
> turned away so nothing on it is readable, with a blurred warm interior
> behind. Calm and unhurried rather than urgent. The hand and phone sit to the
> right of frame with the left third soft and open. No interface, no text, no
> notification.

Note the shared instruction in all three: **the subject sits to the right and
the left third is open**, because the photograph has to fade into the card's
text half. A centred subject cannot be used in this layout.

Note also what is deliberately absent: no faces, no screens showing content,
no clinical or medical staging. The claims source forbids presenting the
advisory service as clinical practice, and a photograph of someone in a white
coat at a screen would make that claim without a word being written.
