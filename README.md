Student Management — Mobile (React Native / Expo)
<p align="center"> <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=F5B301&center=true&vCenter=true&width=460&lines=Welcome+to+GRPUP+WORK;Student+Registry+App;Built+with+React+Native+%2B+Expo;Styled+with+NativeWind" alt="Typing SVG" /> </p>

A native companion app to the existing web frontend, talking to the same Express + MySQL backend (/api/students, /api/departments, /api/courses).

Design system
Palette: warm parchment background + ink text, with a rotating "signature color" per department (navy, brass, forest, burgundy, teal, plum, clay, olive). The same department always resolves to the same color everywhere — student rows, badges, course chips, department cards — so the color itself communicates "which department" at a glance.
Type: Fraunces (serif display) for headings, Inter for UI text, IBM Plex Mono for course codes/IDs — reads like an academic ledger.
Signature element: the student "ledger row" — a colored spine on the left edge of each card, keyed to that student's department.

All tokens live in src/theme/ — edit colors/fonts there, nothing is hardcoded in the screens.

Entry gateway & dashboard (new)

The app now opens on a Login screen, styled as a navy + gold "entry gateway" (hero banner + sign-in card), with a Signup screen modeled on a classic student-registration layout. After sign in/up, the app lands on a Dashboard tab with stat cards and quick actions, then the existing Students/Departments registry.

src/screens/LoginScreen.js / SignupScreen.js / DashboardScreen.js — new screens, styled with NativeWind (Tailwind for React Native).
assets/images/ — reference banner images used as backgrounds (hero-mastery.jpg on Login/Dashboard, ref-signup.jpg on Signup). Swap these for your own artwork any time — same filenames, same spot.
tailwind.config.js — brand tokens (navy, gold, paper, ink…) used via className in the three new screens. The rest of the app still uses the original src/theme/ tokens — both systems can coexist.
Sign in/up is currently client-side only (no backend auth endpoint exists yet) — it validates the form, then routes into the app. Wire it to a real /api/auth endpoint whenever the backend adds one.
1. Install
bash
cd mobile
npm install
2. Point the app at your backend — the important part

Unlike a website, a phone (physical device or emulator) is a different machine from your laptop. http://localhost:5000 on the phone means the phone itself, not your computer running the API. You must use your computer's LAN IP address instead.

Find your computer's local IP:
macOS/Linux: ifconfig | grep inet (or ipconfig getifaddr en0)
Windows: ipconfig → look for "IPv4 Address" (something like 192.168.1.23)
Open mobile/app.json and set it under expo.extra.apiBaseUrl:
json
   "extra": {
     "apiBaseUrl": "http://192.168.1.23:5000/api"
   }
Make sure your backend is actually listening on that network, not just 127.0.0.1 (the default Express app.listen(PORT, ...) already binds to all interfaces, so this is usually fine as-is).
Your phone and computer must be on the same Wi-Fi network.

Android emulator only: you can alternatively use http://10.0.2.2:5000/api, which the Android emulator maps back to your host machine.

Note: CORS (the browser restriction) does not apply to this native app — that's only relevant to the web frontend in /frontend. Still, the backend CORS fix has been applied so the web app works too.

3. Run
bash
npm start

Scan the QR code with Expo Go (iOS/Android), or press a / i for an emulator.

4. Backend must be running
bash
cd ../backend
npm install
npm run dev

Make sure backend/.env has real DB credentials and the MySQL schema from database/schema.sql has been imported.

Group
Role	Members
Admin	Abdulmajid Nuuri
Frontend	Hayidar, Adnan
Backend	Caala, Abdulhamid Nuri
