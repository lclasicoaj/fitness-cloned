import type { Equipment, Exercise, ExerciseCategory, Muscle, SetMode } from '../types';

// Original, hand-written exercise catalogue. Equipment lists everything required (all of it must be available).
function ex(
  id: string,
  name: string,
  primary: Muscle[],
  secondary: Muscle[],
  equipment: Equipment[],
  mode: SetMode,
  mechanics: 'compound' | 'isolation',
  category: ExerciseCategory,
  instructions: string[],
): Exercise {
  return { id, name, primary, secondary, equipment, mode, mechanics, category, instructions };
}

export const EXERCISES: Exercise[] = [
  // ── Chest ─────────────────────────────────────────────
  ex('push-up', 'Push-up', ['chest'], ['triceps', 'shoulders', 'abs'], ['bodyweight'], 'reps', 'compound', 'strength', [
    'Place hands slightly wider than shoulders, body in one straight line from head to heels.',
    'Lower your chest until it is a fist away from the floor, elbows at about 45°.',
    'Press the floor away and fully extend your arms without letting the hips sag.',
  ]),
  ex('incline-push-up', 'Incline push-up', ['chest'], ['triceps', 'shoulders'], ['bench'], 'reps', 'compound', 'strength', [
    'Put your hands on the edge of a bench or sturdy surface, feet back.',
    'Keep a rigid plank and lower your chest to the edge.',
    'Push back up. The higher the surface, the easier the movement.',
  ]),
  ex('decline-push-up', 'Feet-elevated push-up', ['chest', 'shoulders'], ['triceps'], ['bench'], 'reps', 'compound', 'strength', [
    'Place your feet on a bench and hands on the floor.',
    'Lower under control while keeping your core braced.',
    'Press up powerfully; this variation targets the upper chest more.',
  ]),
  ex('db-bench-press', 'Dumbbell bench press', ['chest'], ['triceps', 'shoulders'], ['dumbbell', 'bench'], 'weight_reps', 'compound', 'strength', [
    'Lie on the bench with a dumbbell in each hand above your chest.',
    'Lower the weights to the sides of your chest with control.',
    'Press back up, bringing the dumbbells slightly together at the top.',
  ]),
  ex('bb-bench-press', 'Barbell bench press', ['chest'], ['triceps', 'shoulders'], ['barbell', 'bench'], 'weight_reps', 'compound', 'strength', [
    'Lie under the bar, eyes in line with it, feet planted, shoulder blades squeezed together.',
    'Unrack and lower the bar to the lower chest with forearms vertical.',
    'Drive the bar up and slightly back over the shoulders. Use a spotter or safety pins.',
  ]),
  ex('db-fly', 'Dumbbell fly', ['chest'], ['shoulders'], ['dumbbell', 'bench'], 'weight_reps', 'isolation', 'strength', [
    'Lie on a bench holding dumbbells above your chest, palms facing each other.',
    'With a soft bend in the elbows, open your arms in a wide arc until you feel a stretch.',
    'Squeeze your chest to bring the weights back together.',
  ]),
  ex('cable-crossover', 'Cable crossover', ['chest'], ['shoulders'], ['cable'], 'weight_reps', 'isolation', 'strength', [
    'Stand between two high pulleys, one handle in each hand, staggered stance.',
    'Bring the handles down and together in front of your hips.',
    'Return slowly until your arms are in line with your body.',
  ]),
  ex('machine-chest-press', 'Machine chest press', ['chest'], ['triceps', 'shoulders'], ['machine'], 'weight_reps', 'compound', 'strength', [
    'Adjust the seat so the handles are at mid-chest height.',
    'Press the handles forward until your arms are extended without locking hard.',
    'Return under control to a comfortable stretch.',
  ]),
  ex('band-chest-press', 'Band chest press', ['chest'], ['triceps'], ['band'], 'reps', 'compound', 'strength', [
    'Anchor a band behind you at chest height and hold an end in each hand.',
    'Step forward to create tension and press both hands straight ahead.',
    'Return slowly, keeping the elbows slightly below shoulder level.',
  ]),

  // ── Shoulders ─────────────────────────────────────────
  ex('pike-push-up', 'Pike push-up', ['shoulders'], ['triceps', 'traps'], ['bodyweight'], 'reps', 'compound', 'strength', [
    'Start in a push-up position and walk your feet in so your hips form an inverted V.',
    'Bend your elbows to bring the top of your head toward the floor between your hands.',
    'Press back up to the starting V.',
  ]),
  ex('db-shoulder-press', 'Dumbbell shoulder press', ['shoulders'], ['triceps'], ['dumbbell'], 'weight_reps', 'compound', 'strength', [
    'Sit or stand tall with dumbbells at shoulder height, palms forward.',
    'Press overhead until your arms are straight, without arching your lower back.',
    'Lower back to shoulder height.',
  ]),
  ex('bb-overhead-press', 'Barbell overhead press', ['shoulders'], ['triceps', 'traps', 'abs'], ['barbell'], 'weight_reps', 'compound', 'strength', [
    'Hold the bar on the front of your shoulders, grip just outside them.',
    'Squeeze glutes and abs, then press the bar straight up, moving your head back slightly.',
    'Finish with the bar over mid-foot, then lower to the shoulders.',
  ]),
  ex('db-lateral-raise', 'Lateral raise', ['shoulders'], ['traps'], ['dumbbell'], 'weight_reps', 'isolation', 'strength', [
    'Stand with light dumbbells at your sides.',
    'Raise your arms out to the side to shoulder height, leading with the elbows.',
    'Lower slowly; avoid swinging your torso.',
  ]),
  ex('band-face-pull', 'Band face pull', ['shoulders', 'back'], ['traps'], ['band'], 'reps', 'isolation', 'strength', [
    'Anchor a band at face height and hold it with both hands, thumbs pointing back.',
    'Pull the band toward your forehead while spreading your hands apart.',
    'Pause with elbows high, then return slowly.',
  ]),
  ex('kb-press', 'Kettlebell press', ['shoulders'], ['triceps', 'abs'], ['kettlebell'], 'weight_reps', 'compound', 'strength', [
    'Hold a kettlebell in the rack position against your forearm and chest.',
    'Press it overhead, rotating your palm to face forward at the top.',
    'Lower back to the rack position. Train both sides.',
  ]),
  ex('plate-front-raise', 'Plate front raise', ['shoulders'], ['traps'], ['plate'], 'weight_reps', 'isolation', 'strength', [
    'Hold a plate at the 3 and 9 o’clock positions in front of your thighs.',
    'Raise it with straight arms to eye level.',
    'Lower slowly without leaning back.',
  ]),

  // ── Back / lats / traps ───────────────────────────────
  ex('pull-up', 'Pull-up', ['lats'], ['biceps', 'back', 'forearms'], ['pullup_bar'], 'reps', 'compound', 'strength', [
    'Hang from the bar with an overhand grip slightly wider than your shoulders.',
    'Pull your chest toward the bar by driving your elbows down.',
    'Lower all the way to a dead hang under control.',
  ]),
  ex('chin-up', 'Chin-up', ['lats', 'biceps'], ['back'], ['pullup_bar'], 'reps', 'compound', 'strength', [
    'Hang with an underhand, shoulder-width grip.',
    'Pull until your chin passes the bar.',
    'Lower slowly to full extension.',
  ]),
  ex('negative-pull-up', 'Negative pull-up', ['lats'], ['biceps', 'back'], ['pullup_bar'], 'reps', 'compound', 'strength', [
    'Jump or step up so your chin starts above the bar.',
    'Lower yourself as slowly as possible (aim for 3–5 seconds).',
    'Reset and repeat. A great progression toward full pull-ups.',
  ]),
  ex('db-row', 'One-arm dumbbell row', ['back', 'lats'], ['biceps'], ['dumbbell', 'bench'], 'weight_reps', 'compound', 'strength', [
    'Place one knee and hand on a bench, back flat, dumbbell in the other hand.',
    'Row the dumbbell toward your hip, keeping your elbow close.',
    'Lower until your arm is straight. Switch sides.',
  ]),
  ex('bb-row', 'Barbell bent-over row', ['back', 'lats'], ['biceps', 'lower_back'], ['barbell'], 'weight_reps', 'compound', 'strength', [
    'Hinge at the hips with a flat back, holding the bar at arm’s length.',
    'Pull the bar to your lower ribs, squeezing your shoulder blades.',
    'Lower with control while keeping the hinge position.',
  ]),
  ex('band-row', 'Band seated row', ['back'], ['biceps', 'lats'], ['band'], 'reps', 'compound', 'strength', [
    'Sit with legs straight and loop the band around your feet.',
    'Pull the ends toward your stomach, chest tall.',
    'Return slowly with arms extended.',
  ]),
  ex('lat-pulldown', 'Lat pulldown', ['lats'], ['biceps', 'back'], ['cable'], 'weight_reps', 'compound', 'strength', [
    'Sit at the pulldown station, thighs secured, wide overhand grip.',
    'Pull the bar to your upper chest, leaning back slightly.',
    'Let the bar rise slowly until your arms are straight.',
  ]),
  ex('seated-cable-row', 'Seated cable row', ['back'], ['lats', 'biceps'], ['cable'], 'weight_reps', 'compound', 'strength', [
    'Sit tall with feet on the platform and a neutral handle in your hands.',
    'Row toward your stomach and squeeze your shoulder blades.',
    'Reach forward slowly without rounding your back.',
  ]),
  ex('inverted-row', 'Inverted row', ['back'], ['biceps', 'lats'], ['barbell'], 'reps', 'compound', 'strength', [
    'Set a bar at hip height in a rack and hang underneath it, body straight.',
    'Pull your chest to the bar.',
    'Lower to straight arms. Bend your knees to make it easier.',
  ]),
  ex('db-shrug', 'Dumbbell shrug', ['traps'], ['forearms'], ['dumbbell'], 'weight_reps', 'isolation', 'strength', [
    'Stand holding heavy dumbbells at your sides.',
    'Lift your shoulders straight up toward your ears.',
    'Pause, then lower slowly.',
  ]),
  ex('superman', 'Superman hold', ['lower_back'], ['glutes', 'back'], ['bodyweight'], 'time', 'isolation', 'core', [
    'Lie face down with arms extended overhead.',
    'Lift arms, chest and legs a few centimetres off the floor.',
    'Hold the position while breathing steadily.',
  ]),
  ex('table-row', 'Table row', ['back'], ['biceps', 'lats'], ['bodyweight'], 'reps', 'compound', 'strength', [
    'Lie under a sturdy table and grip its edge with both hands, shoulder-width apart.',
    'Keep your body straight from shoulders to heels (or bend your knees to make it easier).',
    'Pull your chest up toward the table edge, squeezing your shoulder blades together.',
    'Lower under control until your arms are straight.',
  ]),
  ex('prone-ytw', 'Prone Y-T-W raise', ['traps'], ['back', 'shoulders'], ['bodyweight'], 'reps', 'isolation', 'strength', [
    'Lie face down with your forehead resting on a folded towel.',
    'Lift straight arms into a Y shape, thumbs up, and hold for a second.',
    'Lower, then lift arms straight out to the sides in a T shape.',
    'Lower, then bend your elbows and pull them toward your hips to form a W. That is one rep.',
  ]),
  ex('towel-curl', 'Isometric towel curl', ['biceps'], ['forearms'], ['bodyweight'], 'time', 'isolation', 'strength', [
    'Stand on the middle of a towel and hold one end in each hand, palms up.',
    'Bend your elbows to about 90 degrees so the towel is tight.',
    'Pull up as hard as you can against the towel without moving, breathing steadily.',
  ]),
  ex('towel-wring', 'Towel wring', ['forearms'], ['biceps'], ['bodyweight'], 'time', 'isolation', 'strength', [
    'Roll a towel lengthwise and hold it in front of you with both hands, arms extended.',
    'Twist your hands in opposite directions as if wringing out water, as hard as you can.',
    'Hold the squeeze, then switch the twisting direction halfway through the set.',
  ]),
  ex('back-extension', 'Back extension', ['lower_back'], ['glutes', 'hamstrings'], ['bench'], 'reps', 'isolation', 'strength', [
    'Lie face down across a bench with hips at the edge and a partner or strap holding your legs.',
    'Lower your torso, then raise it until it is in line with your legs.',
    'Avoid over-arching at the top.',
  ]),

  // ── Arms ──────────────────────────────────────────────
  ex('db-curl', 'Dumbbell biceps curl', ['biceps'], ['forearms'], ['dumbbell'], 'weight_reps', 'isolation', 'strength', [
    'Stand with dumbbells at your sides, palms forward.',
    'Curl the weights toward your shoulders without moving your elbows forward.',
    'Lower slowly to full extension.',
  ]),
  ex('hammer-curl', 'Hammer curl', ['biceps', 'forearms'], [], ['dumbbell'], 'weight_reps', 'isolation', 'strength', [
    'Hold dumbbells with palms facing each other.',
    'Curl up while keeping the neutral grip.',
    'Lower under control.',
  ]),
  ex('bb-curl', 'Barbell curl', ['biceps'], ['forearms'], ['barbell'], 'weight_reps', 'isolation', 'strength', [
    'Hold the bar with an underhand, shoulder-width grip.',
    'Curl it to your upper chest keeping elbows by your sides.',
    'Lower slowly without swinging.',
  ]),
  ex('band-curl', 'Band curl', ['biceps'], ['forearms'], ['band'], 'reps', 'isolation', 'strength', [
    'Stand on the middle of a band and hold the ends.',
    'Curl your hands toward your shoulders.',
    'Resist the band on the way down.',
  ]),
  ex('cable-curl', 'Cable curl', ['biceps'], ['forearms'], ['cable'], 'weight_reps', 'isolation', 'strength', [
    'Attach a straight bar to a low pulley and stand facing it.',
    'Curl the bar up while keeping elbows still.',
    'Lower to full extension.',
  ]),
  ex('bench-dip', 'Bench dip', ['triceps'], ['chest', 'shoulders'], ['bench'], 'reps', 'compound', 'strength', [
    'Sit on the edge of a bench, hands beside your hips, slide your hips off.',
    'Bend your elbows to lower your body until upper arms are roughly parallel to the floor.',
    'Press back up. Bend your knees to make it easier.',
  ]),
  ex('diamond-push-up', 'Close-grip push-up', ['triceps'], ['chest', 'shoulders'], ['bodyweight'], 'reps', 'compound', 'strength', [
    'Get into a push-up position with hands close together under your chest.',
    'Lower with elbows tucked along your sides.',
    'Press up by straightening your arms.',
  ]),
  ex('db-overhead-extension', 'Overhead triceps extension', ['triceps'], [], ['dumbbell'], 'weight_reps', 'isolation', 'strength', [
    'Hold one dumbbell overhead with both hands.',
    'Lower it behind your head by bending the elbows only.',
    'Extend back to the top.',
  ]),
  ex('cable-pushdown', 'Cable pushdown', ['triceps'], [], ['cable'], 'weight_reps', 'isolation', 'strength', [
    'Face a high pulley with a rope or bar attachment.',
    'Keeping elbows pinned to your sides, push down until arms are straight.',
    'Return until forearms are just above parallel.',
  ]),
  ex('band-pushdown', 'Band pushdown', ['triceps'], [], ['band'], 'reps', 'isolation', 'strength', [
    'Anchor a band overhead and hold the ends.',
    'Extend your elbows to push your hands down to your thighs.',
    'Return slowly.',
  ]),
  ex('wrist-curl', 'Dumbbell wrist curl', ['forearms'], [], ['dumbbell', 'bench'], 'weight_reps', 'isolation', 'strength', [
    'Rest your forearms on a bench, palms up, wrists off the edge.',
    'Curl the dumbbells up using only your wrists.',
    'Lower slowly into a stretch.',
  ]),
  ex('dead-hang', 'Dead hang', ['forearms'], ['lats', 'shoulders'], ['pullup_bar'], 'time', 'isolation', 'strength', [
    'Grip the bar with both hands and hang with arms straight.',
    'Keep shoulders active, not shrugged to your ears.',
    'Hold for time.',
  ]),
  ex('farmer-carry', 'Farmer carry', ['forearms', 'traps'], ['abs', 'glutes'], ['dumbbell'], 'time', 'compound', 'strength', [
    'Pick up heavy dumbbells or kettlebells at your sides.',
    'Walk with short, controlled steps and an upright posture.',
    'Keep going for the set time, then set the weights down safely.',
  ]),

  // ── Core ──────────────────────────────────────────────
  ex('plank', 'Plank', ['abs'], ['shoulders', 'obliques'], ['bodyweight'], 'time', 'isolation', 'core', [
    'Rest on your forearms and toes, elbows under shoulders.',
    'Brace your stomach and squeeze your glutes so your body forms a straight line.',
    'Hold without letting your hips drop.',
  ]),
  ex('side-plank', 'Side plank', ['obliques'], ['abs', 'shoulders'], ['bodyweight'], 'time', 'isolation', 'core', [
    'Lie on your side, propped on one forearm, feet stacked.',
    'Lift your hips until your body is straight.',
    'Hold, then switch sides.',
  ]),
  ex('crunch', 'Crunch', ['abs'], [], ['bodyweight'], 'reps', 'isolation', 'core', [
    'Lie on your back with knees bent and hands lightly by your temples.',
    'Curl your shoulders off the floor by contracting your abs.',
    'Lower slowly without pulling on your neck.',
  ]),
  ex('dead-bug', 'Dead bug', ['abs'], ['obliques'], ['bodyweight'], 'reps', 'isolation', 'core', [
    'Lie on your back, arms up, hips and knees bent at 90°.',
    'Press your lower back into the floor and extend the opposite arm and leg.',
    'Return and alternate sides. Count each side as one rep.',
  ]),
  ex('hollow-hold', 'Hollow body hold', ['abs'], ['obliques'], ['bodyweight'], 'time', 'isolation', 'core', [
    'Lie on your back and lift your shoulders and legs off the floor.',
    'Keep your lower back pressed down and arms reaching overhead.',
    'Hold the banana-shaped position.',
  ]),
  ex('leg-raise', 'Lying leg raise', ['abs'], ['obliques'], ['bodyweight'], 'reps', 'isolation', 'core', [
    'Lie flat with legs straight and hands under your hips.',
    'Raise your legs to vertical while keeping your lower back down.',
    'Lower them slowly without touching the floor.',
  ]),
  ex('hanging-knee-raise', 'Hanging knee raise', ['abs'], ['forearms', 'obliques'], ['pullup_bar'], 'reps', 'isolation', 'core', [
    'Hang from a bar with straight arms.',
    'Lift your knees toward your chest, curling your pelvis up.',
    'Lower slowly without swinging.',
  ]),
  ex('russian-twist', 'Russian twist', ['obliques'], ['abs'], ['bodyweight'], 'reps', 'isolation', 'core', [
    'Sit with knees bent and lean back slightly, chest tall.',
    'Rotate your torso to touch the floor on one side, then the other.',
    'Hold a plate or dumbbell to make it harder.',
  ]),
  ex('plate-russian-twist', 'Weighted Russian twist', ['obliques'], ['abs'], ['plate'], 'weight_reps', 'isolation', 'core', [
    'Sit leaning back with a plate held at your chest.',
    'Rotate side to side, following the plate with your eyes.',
    'Keep the movement controlled.',
  ]),
  ex('mountain-climber', 'Mountain climber', ['abs'], ['shoulders', 'quads'], ['bodyweight'], 'time', 'compound', 'cardio', [
    'Start in a high plank.',
    'Drive one knee toward your chest, then switch legs quickly.',
    'Keep your hips level and keep moving for the set time.',
  ]),
  ex('bicycle-crunch', 'Bicycle crunch', ['obliques', 'abs'], [], ['bodyweight'], 'reps', 'isolation', 'core', [
    'Lie on your back, hands by your temples, legs lifted.',
    'Bring one elbow toward the opposite knee while extending the other leg.',
    'Alternate sides in a pedalling motion.',
  ]),
  ex('cable-woodchop', 'Cable woodchop', ['obliques'], ['abs', 'shoulders'], ['cable'], 'weight_reps', 'compound', 'core', [
    'Set a pulley high and stand side-on, holding the handle with both hands.',
    'Pull diagonally across your body to the opposite hip, rotating through your torso.',
    'Return slowly. Train both sides.',
  ]),
  ex('bird-dog', 'Bird dog', ['lower_back', 'abs'], ['glutes'], ['bodyweight'], 'reps', 'isolation', 'core', [
    'Start on hands and knees.',
    'Extend one arm and the opposite leg until they are in line with your body.',
    'Pause, return and alternate.',
  ]),

  // ── Legs / glutes ─────────────────────────────────────
  ex('bodyweight-squat', 'Bodyweight squat', ['quads', 'glutes'], ['hamstrings'], ['bodyweight'], 'reps', 'compound', 'strength', [
    'Stand with feet shoulder-width apart, toes slightly out.',
    'Sit your hips back and down, knees tracking over your toes.',
    'Stand up by driving through your whole foot.',
  ]),
  ex('goblet-squat', 'Goblet squat', ['quads', 'glutes'], ['abs'], ['dumbbell'], 'weight_reps', 'compound', 'strength', [
    'Hold a dumbbell vertically against your chest.',
    'Squat between your knees, keeping your chest up.',
    'Drive back up to standing.',
  ]),
  ex('kb-goblet-squat', 'Kettlebell goblet squat', ['quads', 'glutes'], ['abs'], ['kettlebell'], 'weight_reps', 'compound', 'strength', [
    'Hold a kettlebell by the horns at chest height.',
    'Squat down with elbows inside your knees.',
    'Stand up tall.',
  ]),
  ex('bb-back-squat', 'Barbell back squat', ['quads', 'glutes'], ['hamstrings', 'lower_back'], ['barbell'], 'weight_reps', 'compound', 'strength', [
    'Rest the bar across your upper back and unrack it with a tight core.',
    'Squat down until your hips are at least at knee level.',
    'Drive up through mid-foot. Use safety arms in a rack.',
  ]),
  ex('leg-press', 'Leg press', ['quads', 'glutes'], ['hamstrings'], ['machine'], 'weight_reps', 'compound', 'strength', [
    'Sit in the machine with feet shoulder-width on the platform.',
    'Lower the platform until your knees are at about 90°.',
    'Press back up without locking your knees.',
  ]),
  ex('reverse-lunge', 'Reverse lunge', ['quads', 'glutes'], ['hamstrings'], ['bodyweight'], 'reps', 'compound', 'strength', [
    'Stand tall and step one foot back.',
    'Lower until both knees are bent at about 90°.',
    'Push through the front heel to return. Alternate legs.',
  ]),
  ex('db-lunge', 'Dumbbell walking lunge', ['quads', 'glutes'], ['hamstrings'], ['dumbbell'], 'weight_reps', 'compound', 'strength', [
    'Hold dumbbells at your sides.',
    'Step forward into a lunge, then bring the back foot through into the next step.',
    'Keep your torso upright throughout.',
  ]),
  ex('bulgarian-split-squat', 'Bulgarian split squat', ['quads', 'glutes'], ['hamstrings'], ['bench'], 'reps', 'compound', 'strength', [
    'Stand in front of a bench and place the top of one foot on it behind you.',
    'Lower your back knee toward the floor.',
    'Drive up through the front foot. Hold dumbbells to progress.',
  ]),
  ex('step-up', 'Step-up', ['quads', 'glutes'], [], ['bench'], 'reps', 'compound', 'strength', [
    'Place one foot fully on a sturdy bench or box.',
    'Step up by pushing through that foot, standing tall at the top.',
    'Step down with control. Alternate legs.',
  ]),
  ex('wall-sit', 'Wall sit', ['quads'], ['glutes'], ['bodyweight'], 'time', 'isolation', 'strength', [
    'Lean your back against a wall and slide down until your thighs are parallel to the floor.',
    'Keep your knees above your ankles.',
    'Hold for time.',
  ]),
  ex('glute-bridge', 'Glute bridge', ['glutes'], ['hamstrings', 'lower_back'], ['bodyweight'], 'reps', 'isolation', 'strength', [
    'Lie on your back with knees bent and feet flat.',
    'Drive your hips up by squeezing your glutes until your body forms a straight line from knees to shoulders.',
    'Pause at the top, then lower.',
  ]),
  ex('single-leg-glute-bridge', 'Single-leg glute bridge', ['glutes'], ['hamstrings'], ['bodyweight'], 'reps', 'isolation', 'strength', [
    'Set up like a glute bridge and extend one leg.',
    'Bridge up using the planted leg only.',
    'Lower with control and switch sides.',
  ]),
  ex('hip-thrust', 'Barbell hip thrust', ['glutes'], ['hamstrings'], ['barbell', 'bench'], 'weight_reps', 'isolation', 'strength', [
    'Sit with your upper back against a bench and a padded bar across your hips.',
    'Drive your hips up until your torso is parallel to the floor, chin tucked.',
    'Squeeze for a second, then lower.',
  ]),
  ex('db-hip-thrust', 'Dumbbell hip thrust', ['glutes'], ['hamstrings'], ['dumbbell', 'bench'], 'weight_reps', 'isolation', 'strength', [
    'Rest your upper back on a bench, holding a dumbbell on your hips.',
    'Drive up until your hips are fully extended.',
    'Lower slowly and repeat.',
  ]),
  ex('band-lateral-walk', 'Band lateral walk', ['glutes'], [], ['band'], 'reps', 'isolation', 'strength', [
    'Place a mini band above your knees or around your ankles.',
    'Sit into a quarter squat and step sideways, keeping tension on the band.',
    'Take the same number of steps in each direction.',
  ]),
  ex('donkey-kick', 'Donkey kick', ['glutes'], ['hamstrings'], ['bodyweight'], 'reps', 'isolation', 'strength', [
    'Start on hands and knees.',
    'Keeping the knee bent, lift one foot toward the ceiling.',
    'Lower without touching down and repeat. Switch sides.',
  ]),
  ex('band-kickback', 'Band glute kickback', ['glutes'], [], ['band'], 'reps', 'isolation', 'strength', [
    'Loop a band around your feet and get on hands and knees.',
    'Extend one leg back against the band.',
    'Return slowly, then switch sides.',
  ]),
  ex('db-rdl', 'Dumbbell Romanian deadlift', ['hamstrings', 'glutes'], ['lower_back'], ['dumbbell'], 'weight_reps', 'compound', 'strength', [
    'Stand holding dumbbells in front of your thighs.',
    'Push your hips back with soft knees, sliding the weights down your legs.',
    'Stop when you feel a strong hamstring stretch, then drive your hips forward.',
  ]),
  ex('bb-deadlift', 'Barbell deadlift', ['hamstrings', 'glutes', 'lower_back'], ['back', 'traps', 'forearms', 'quads'], ['barbell'], 'weight_reps', 'compound', 'strength', [
    'Stand with mid-foot under the bar, grip just outside your legs.',
    'Brace, flatten your back and push the floor away to stand up with the bar.',
    'Lower by hinging at the hips first, keeping the bar close.',
  ]),
  ex('kb-swing', 'Kettlebell swing', ['glutes', 'hamstrings'], ['lower_back', 'abs', 'shoulders'], ['kettlebell'], 'reps', 'compound', 'cardio', [
    'Hinge and hike the kettlebell back between your legs.',
    'Snap your hips forward to float the bell to chest height.',
    'Let it fall back into the hinge and repeat rhythmically.',
  ]),
  ex('nordic-curl', 'Nordic hamstring curl', ['hamstrings'], ['glutes'], ['bodyweight'], 'reps', 'isolation', 'strength', [
    'Kneel with your ankles anchored under something stable.',
    'Lower your body forward as slowly as possible, keeping hips extended.',
    'Catch yourself with your hands and push back up.',
  ]),
  ex('leg-curl', 'Machine leg curl', ['hamstrings'], ['calves'], ['machine'], 'weight_reps', 'isolation', 'strength', [
    'Adjust the machine so the pad sits just above your heels.',
    'Curl your heels toward your glutes.',
    'Return slowly.',
  ]),
  ex('leg-extension', 'Machine leg extension', ['quads'], [], ['machine'], 'weight_reps', 'isolation', 'strength', [
    'Sit with the pad on your lower shins and knees in line with the pivot.',
    'Extend your legs until they are straight.',
    'Lower slowly.',
  ]),
  ex('calf-raise', 'Standing calf raise', ['calves'], [], ['bodyweight'], 'reps', 'isolation', 'strength', [
    'Stand on the edge of a step with heels hanging off.',
    'Rise up onto your toes as high as possible.',
    'Lower your heels below the step for a full stretch.',
  ]),
  ex('db-calf-raise', 'Dumbbell calf raise', ['calves'], [], ['dumbbell'], 'weight_reps', 'isolation', 'strength', [
    'Hold dumbbells at your sides, balls of your feet on a step.',
    'Rise onto your toes and pause.',
    'Lower slowly into a stretch.',
  ]),

  // ── Conditioning / mobility ───────────────────────────
  ex('burpee', 'Burpee', ['quads', 'chest'], ['shoulders', 'abs', 'glutes'], ['bodyweight'], 'reps', 'compound', 'cardio', [
    'From standing, squat and place your hands on the floor.',
    'Jump your feet back to a plank, optionally do a push-up.',
    'Jump your feet in and explode up into a jump.',
  ]),
  ex('jumping-jack', 'Jumping jacks', ['calves'], ['shoulders', 'quads'], ['bodyweight'], 'time', 'compound', 'cardio', [
    'Jump your feet out while raising your arms overhead.',
    'Jump back to the start with arms at your sides.',
    'Keep a steady rhythm.',
  ]),
  ex('high-knees', 'High knees', ['quads'], ['abs', 'calves'], ['bodyweight'], 'time', 'compound', 'cardio', [
    'Run on the spot, driving your knees to hip height.',
    'Stay on the balls of your feet and pump your arms.',
    'Keep going for the full interval.',
  ]),
  ex('jump-squat', 'Jump squat', ['quads', 'glutes'], ['calves'], ['bodyweight'], 'reps', 'compound', 'cardio', [
    'Squat down to a comfortable depth.',
    'Explode up into a jump.',
    'Land softly and go straight into the next rep.',
  ]),
  ex('skater-hop', 'Skater hops', ['glutes', 'quads'], ['calves'], ['bodyweight'], 'time', 'compound', 'cardio', [
    'Leap sideways onto one foot, swinging the other leg behind you.',
    'Absorb the landing, then bound to the other side.',
    'Stay low and keep a rhythm.',
  ]),
  ex('cat-cow', 'Cat–cow', ['lower_back'], ['abs'], ['bodyweight'], 'reps', 'isolation', 'mobility', [
    'Start on hands and knees.',
    'Round your back toward the ceiling, then let your stomach drop and lift your chest.',
    'Move slowly with your breath.',
  ]),
  ex('worlds-greatest-stretch', 'Lunge with thoracic rotation', ['glutes', 'hamstrings'], ['back', 'quads'], ['bodyweight'], 'reps', 'compound', 'mobility', [
    'Step into a long lunge and place both hands inside the front foot.',
    'Rotate your torso and reach the inside arm to the ceiling.',
    'Return and switch sides.',
  ]),
  ex('hip-flexor-stretch', 'Half-kneeling hip flexor stretch', ['quads'], ['glutes'], ['bodyweight'], 'time', 'isolation', 'mobility', [
    'Kneel on one knee with the other foot in front.',
    'Tuck your pelvis and shift forward until you feel a stretch at the front of the hip.',
    'Hold, then switch sides.',
  ]),
  ex('childs-pose', 'Child’s pose', ['lower_back', 'lats'], [], ['bodyweight'], 'time', 'isolation', 'mobility', [
    'Kneel and sit back on your heels.',
    'Reach your arms forward along the floor and relax your forehead down.',
    'Breathe slowly into your back.',
  ]),
];

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
