-- Seed: Grade 9 Skills
insert into skills (id, name, name_hu, grade, topic_area, prerequisites, description_hu, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'real-numbers', 'Valós számok', 9, 'Számelmélet', '{}',
   'Természetes, egész, racionális és irracionális számok, számegyenes, abszolút érték', 1),
  ('00000000-0000-0000-0000-000000000002', 'algebraic-expressions', 'Algebrai kifejezések', 9, 'Algebra',
   '{00000000-0000-0000-0000-000000000001}',
   'Monómok, polinomok, műveletek algebrai kifejezésekkel, faktorizáció', 2),
  ('00000000-0000-0000-0000-000000000003', 'linear-equations', 'Lineáris egyenletek', 9, 'Egyenletek',
   '{00000000-0000-0000-0000-000000000002}',
   'Elsőfokú egyenletek megoldása egy ismeretlennel, szöveges feladatok', 3),
  ('00000000-0000-0000-0000-000000000004', 'linear-functions', 'Lineáris függvények', 9, 'Függvények',
   '{00000000-0000-0000-0000-000000000003}',
   'y=mx+b alak, meredekség, tengelymetszet, grafikonok értelmezése', 4),
  ('00000000-0000-0000-0000-000000000005', 'systems-of-equations', 'Egyenletrendszerek', 9, 'Egyenletek',
   '{00000000-0000-0000-0000-000000000003}',
   'Kétismeretlenes lineáris egyenletrendszerek, helyettesítéses és összeadásos módszer', 5),
  ('00000000-0000-0000-0000-000000000006', 'basic-geometry', 'Alapgeometria', 9, 'Geometria', '{}',
   'Háromszögek, szögek, kerület és terület, négyszögek, kongruencia', 6),
  ('00000000-0000-0000-0000-000000000007', 'statistics-intro', 'Alapstatisztika', 9, 'Statisztika',
   '{00000000-0000-0000-0000-000000000001}',
   'Átlag, medián, módusz, szórás, relatív gyakoriság, valószínűség alapjai', 7)
on conflict (id) do nothing;

-- Seed: Grade 10 Skills
insert into skills (id, name, name_hu, grade, topic_area, prerequisites, description_hu, sort_order) values
  ('00000000-0000-0000-0000-000000000011', 'quadratic-equations', 'Másodfokú egyenletek', 10, 'Egyenletek',
   '{00000000-0000-0000-0000-000000000002}',
   'Másodfokú egyenletek megoldóképlete, diszkrimináns, gyökök tulajdonságai', 11),
  ('00000000-0000-0000-0000-000000000012', 'quadratic-functions', 'Másodfokú függvények', 10, 'Függvények',
   '{00000000-0000-0000-0000-000000000011}',
   'Parabola, csúcspont, tengelyek, maximum/minimum, másodfokú egyenlőtlenségek', 12),
  ('00000000-0000-0000-0000-000000000013', 'sequences-arithmetic', 'Számtani sorozatok', 10, 'Sorozatok',
   '{00000000-0000-0000-0000-000000000001}',
   'Számtani sorozat definíciója, általános tag, összegképlet', 13),
  ('00000000-0000-0000-0000-000000000014', 'sequences-geometric', 'Mértani sorozatok', 10, 'Sorozatok',
   '{00000000-0000-0000-0000-000000000013}',
   'Mértani sorozat, kvóciens, összegképlet, kamatos kamat', 14),
  ('00000000-0000-0000-0000-000000000015', 'trigonometry-right', 'Derékszögű háromszög trigonometriája', 10, 'Trigonometria',
   '{00000000-0000-0000-0000-000000000006}',
   'Szinusz, koszinusz, tangens, szögek és oldalak kapcsolata', 15),
  ('00000000-0000-0000-0000-000000000016', 'circle-geometry', 'Körgeometria', 10, 'Geometria',
   '{00000000-0000-0000-0000-000000000006}',
   'Kerületi és középponti szögek, Thalész-tétel, húrszög-tétel', 16),
  ('00000000-0000-0000-0000-000000000017', 'combinatorics-intro', 'Kombinatorika alapjai', 10, 'Kombinatorika',
   '{00000000-0000-0000-0000-000000000007}',
   'Permutációk, kombinációk, binomiális együtthatók', 17)
on conflict (id) do nothing;

-- ============================================================
-- LINEAR EQUATIONS PROBLEMS (skill 003)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

-- Easy (0.2-0.4)
('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $3x + 7 = 22$', 5,
 '[{"level":1,"text_hu":"Rendezd az egyenletet: az összes x-et tartalmazó tagot vond a bal oldalra."},{"level":2,"text_hu":"Vonjuk le mindkét oldalból 7-et: $3x = 15$"},{"level":3,"text_hu":"Osszuk el mindkét oldalt 3-mal: $x = 5$"}]',
 0.2, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $2x - 4 = 10$', 7,
 '[{"level":1,"text_hu":"Adj hozzá 4-et mindkét oldalhoz."},{"level":2,"text_hu":"$2x = 14$"},{"level":3,"text_hu":"$x = 7$"}]',
 0.2, false),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $5x = 35$', 7,
 '[{"level":1,"text_hu":"Osztd el mindkét oldalt 5-tel."},{"level":2,"text_hu":"$x = 35 \\div 5$"},{"level":3,"text_hu":"$x = 7$"}]',
 0.15, false),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $x + 13 = 28$', 15,
 '[{"level":1,"text_hu":"Vonj le 13-at mindkét oldalból."},{"level":2,"text_hu":"$x = 28 - 13$"},{"level":3,"text_hu":"$x = 15$"}]',
 0.15, false),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $4x + 8 = 32$', 6,
 '[{"level":1,"text_hu":"Vonj le 8-at mindkét oldalból."},{"level":2,"text_hu":"$4x = 24$"},{"level":3,"text_hu":"Osztd el 4-gyel: $x = 6$"}]',
 0.2, false),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $\\frac{x}{3} = 7$', 21,
 '[{"level":1,"text_hu":"Szorozd meg mindkét oldalt 3-mal."},{"level":2,"text_hu":"$x = 7 \\times 3$"},{"level":3,"text_hu":"$x = 21$"}]',
 0.25, true),

-- Medium (0.5-0.7)
('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $2(x + 3) = 14$', 4,
 '[{"level":1,"text_hu":"Bontsd ki a zárójelet: $2x + 6 = 14$."},{"level":2,"text_hu":"Vonj le 6-ot: $2x = 8$"},{"level":3,"text_hu":"$x = 4$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $3x - 5 = x + 7$', 6,
 '[{"level":1,"text_hu":"Rendezd: hozd az x-et tartalmazó tagokat bal oldalra."},{"level":2,"text_hu":"$3x - x = 7 + 5$, tehát $2x = 12$"},{"level":3,"text_hu":"$x = 6$"}]',
 0.5, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $5(2x - 1) = 3x + 16$', 3,
 '[{"level":1,"text_hu":"Bontsd ki: $10x - 5 = 3x + 16$"},{"level":2,"text_hu":"$10x - 3x = 16 + 5$, tehát $7x = 21$"},{"level":3,"text_hu":"$x = 3$"}]',
 0.6, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $\\frac{x+2}{3} = \\frac{x-1}{2}$', 7,
 '[{"level":1,"text_hu":"Szorozz mindkét oldalt 6-tal (a közös nevező)."},{"level":2,"text_hu":"$2(x+2) = 3(x-1)$, azaz $2x+4 = 3x-3$"},{"level":3,"text_hu":"$x = 7$"}]',
 0.65, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $4x + 3 = 2x + 11$', 4,
 '[{"level":1,"text_hu":"Vonjuk le 2x-et mindkét oldalból."},{"level":2,"text_hu":"$2x + 3 = 11$"},{"level":3,"text_hu":"$x = 4$"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Ha egy szám háromszorosa 12-vel csökkentve egyenlő a szám kétszeresével, mi ez a szám?', 12,
 '[{"level":1,"text_hu":"Jelöljük a számot x-szel: $3x - 12 = 2x$"},{"level":2,"text_hu":"$3x - 2x = 12$"},{"level":3,"text_hu":"$x = 12$"}]',
 0.55, true),

-- Hard (0.8-0.95)
('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Oldd meg az egyenletet: $\\frac{2x-1}{4} - \\frac{x+3}{6} = 1$', 9,
 '[{"level":1,"text_hu":"A közös nevező 12. Szorozz mindkét oldalt 12-vel."},{"level":2,"text_hu":"$3(2x-1) - 2(x+3) = 12$, azaz $6x-3-2x-6=12$"},{"level":3,"text_hu":"$4x = 21$... ellenőrizd! Valójában $4x = 21$ nem egész. Ellenőrizd a feladatot: $x = 21/4$? Próbálj ki $x=9$-et."}]',
 0.85, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Egy téglalap kerülete 36 cm. A hossza 6 cm-rel nagyobb a szélességénél. Mennyi a szélessége?', 6,
 '[{"level":1,"text_hu":"Jelöljük a szélességet x-szel, akkor a hossza $x+6$. Kerület: $2(x + x + 6) = 36$"},{"level":2,"text_hu":"$2(2x + 6) = 36$, azaz $4x + 12 = 36$"},{"level":3,"text_hu":"$4x = 24$, $x = 6$ cm"}]',
 0.7, true),

('00000000-0000-0000-0000-000000000003', 'fill_number',
 'Két szám összege 48. Az egyik szám 3-mal nagyobb a másik kétszeresénél. Mi a kisebb szám?', 15,
 '[{"level":1,"text_hu":"Legyen a kisebb szám x, a nagyobb $2x+3$. Összegük: $x + (2x+3) = 48$"},{"level":2,"text_hu":"$3x + 3 = 48$, tehát $3x = 45$"},{"level":3,"text_hu":"$x = 15$"}]',
 0.75, true);

-- ============================================================
-- REAL NUMBERS PROBLEMS (skill 001)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Melyik a legnagyobb? $|-7|$, $|5|$, $|-3|$, $|6|$ — add meg a számot!', 7,
 '[{"level":1,"text_hu":"Az abszolút érték mindig nemnegatív: $|a|$ az $a$ távolsága a nullától."},{"level":2,"text_hu":"$|-7|=7$, $|5|=5$, $|-3|=3$, $|6|=6$"},{"level":3,"text_hu":"A legnagyobb a 7."}]',
 0.2, false),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Számítsd ki: $|-8 + 3|$', 5,
 '[{"level":1,"text_hu":"Először végezd el az összeadást a zárójelben."},{"level":2,"text_hu":"$-8 + 3 = -5$"},{"level":3,"text_hu":"$|-5| = 5$"}]',
 0.25, false),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Melyik egész szám következik $\\sqrt{2}$ után a számegyenesen? (A következő egész szám)',  2,
 '[{"level":1,"text_hu":"$\\sqrt{2} \\approx 1.41...$, tehát egy 1 és 2 közé eső irracionális szám."},{"level":2,"text_hu":"A következő egész szám jobbra 2."},{"level":3,"text_hu":"A válasz: 2"}]',
 0.3, true),

('00000000-0000-0000-0000-000000000001', 'multiple_choice',
 'Melyik szám irracionális?',
 null,
 '[{"level":1,"text_hu":"Az irracionális számok nem írhatók törtként."},{"level":2,"text_hu":"$\\pi$, $\\sqrt{2}$, $\\sqrt{3}$ mind irracionálisak, de $\\sqrt{4}=2$ racionális."},{"level":3,"text_hu":"$\\sqrt{3}$ irracionális."}]',
 0.35, true),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Számítsd ki: $(-3)^2 + (-2)^3$', 1,
 '[{"level":1,"text_hu":"Számítsd ki külön-külön a hatványokat."},{"level":2,"text_hu":"$(-3)^2 = 9$, $(-2)^3 = -8$"},{"level":3,"text_hu":"$9 + (-8) = 1$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Rendezd növekvő sorrendbe és add meg a legkisebbet: $\\frac{3}{4}$, $\\frac{2}{3}$, $\\frac{5}{6}$. Mi a legkisebb? (add meg 2 tizedes jegyig)', null,
 '[{"level":1,"text_hu":"Hozd közös nevezőre (12)."},{"level":2,"text_hu":"$\\frac{3}{4}=\\frac{9}{12}$, $\\frac{2}{3}=\\frac{8}{12}$, $\\frac{5}{6}=\\frac{10}{12}$"},{"level":3,"text_hu":"Legkisebb: $\\frac{2}{3} \\approx 0.67$"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Mennyi $\\sqrt{144}$?', 12,
 '[{"level":1,"text_hu":"Keress olyan pozitív számot, amelynek négyzete 144."},{"level":2,"text_hu":"$12^2 = 144$"},{"level":3,"text_hu":"$\\sqrt{144} = 12$"}]',
 0.2, false),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Számítsd ki: $2^5$', 32,
 '[{"level":1,"text_hu":"$2^5 = 2 \\times 2 \\times 2 \\times 2 \\times 2$"},{"level":2,"text_hu":"$= 4 \\times 4 \\times 2 = 16 \\times 2$"},{"level":3,"text_hu":"$= 32$"}]',
 0.15, false),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Mennyi $3^4$?', 81,
 '[{"level":1,"text_hu":"$3^4 = 3 \\times 3 \\times 3 \\times 3$"},{"level":2,"text_hu":"$= 9 \\times 9$"},{"level":3,"text_hu":"$= 81$"}]',
 0.2, false),

('00000000-0000-0000-0000-000000000001', 'fill_number',
 'Számítsd ki: $|{-15}| - |{-8}|$', 7,
 '[{"level":1,"text_hu":"Az abszolút érték mindig pozitív."},{"level":2,"text_hu":"$|-15| = 15$, $|-8| = 8$"},{"level":3,"text_hu":"$15 - 8 = 7$"}]',
 0.3, false);

-- ============================================================
-- ALGEBRAIC EXPRESSIONS PROBLEMS (skill 002)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Számítsd ki az értékét $x = 3$ esetén: $2x^2 - 5x + 1$', 4,
 '[{"level":1,"text_hu":"Helyettesítsd be $x = 3$-at."},{"level":2,"text_hu":"$2 \\cdot 9 - 5 \\cdot 3 + 1 = 18 - 15 + 1$"},{"level":3,"text_hu":"$= 4$"}]',
 0.3, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Egyszerűsítsd és add meg az együtthatót $x^2$ előtt: $(x+3)^2$', 1,
 '[{"level":1,"text_hu":"$(a+b)^2 = a^2 + 2ab + b^2$"},{"level":2,"text_hu":"$(x+3)^2 = x^2 + 6x + 9$"},{"level":3,"text_hu":"Az $x^2$ együtthatója: 1"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Fejtsd ki: $(x-4)(x+4)$ — mi a konstans tag?', -16,
 '[{"level":1,"text_hu":"$(a-b)(a+b) = a^2 - b^2$"},{"level":2,"text_hu":"$(x-4)(x+4) = x^2 - 16$"},{"level":3,"text_hu":"A konstans tag: $-16$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Faktorizáld és add meg az egyik tényezőt (a kisebb): $x^2 - 9$', null,
 '[{"level":1,"text_hu":"Négyzetszámok különbsége: $a^2 - b^2 = (a-b)(a+b)$"},{"level":2,"text_hu":"$x^2 - 9 = (x-3)(x+3)$"},{"level":3,"text_hu":"Az egyik tényező $(x-3)$"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Számítsd ki $a = 2$, $b = -1$ esetén: $a^2 + 2ab + b^2$', 1,
 '[{"level":1,"text_hu":"Ez a $(a+b)^2$ képlet: helyettesítsd be $a=2$, $b=-1$"},{"level":2,"text_hu":"$(2 + (-1))^2 = (1)^2$"},{"level":3,"text_hu":"$= 1$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Egyszerűsítsd: $3x + 2y - x + 4y$ — mi az $x$ együtthatója?', 2,
 '[{"level":1,"text_hu":"Gyűjtsd össze az x-eket és y-okat."},{"level":2,"text_hu":"$(3x - x) + (2y + 4y) = 2x + 6y$"},{"level":3,"text_hu":"Az x együtthatója: 2"}]',
 0.25, false),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Mennyi $5x - 3(x-2)$ értéke $x = 4$ esetén?', 14,
 '[{"level":1,"text_hu":"Először bontsd ki: $5x - 3x + 6$"},{"level":2,"text_hu":"$= 2x + 6$, majd helyettesítsd $x=4$-et"},{"level":3,"text_hu":"$2 \\cdot 4 + 6 = 14$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Fejtsd ki: $(2x+1)^2$ — mi az $x$ együtthatója?', 4,
 '[{"level":1,"text_hu":"$(2x+1)^2 = (2x)^2 + 2 \\cdot 2x \\cdot 1 + 1^2$"},{"level":2,"text_hu":"$= 4x^2 + 4x + 1$"},{"level":3,"text_hu":"Az $x$ együtthatója: 4"}]',
 0.5, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Faktorizáld: $x^2 + 5x + 6$ — mi az egyik gyök (negatív előjelű)?', -2,
 '[{"level":1,"text_hu":"Keress két számot, amelynek összege 5 és szorzata 6."},{"level":2,"text_hu":"$2 + 3 = 5$ és $2 \\times 3 = 6$, tehát $(x+2)(x+3)$"},{"level":3,"text_hu":"Az egyik gyök $x = -2$"}]',
 0.6, true),

('00000000-0000-0000-0000-000000000002', 'fill_number',
 'Egyszerűsítsd: $\\frac{x^2 - 4}{x - 2}$ (feltéve, hogy $x \\neq 2$) — mi az eredmény $x=5$ esetén?', 7,
 '[{"level":1,"text_hu":"Faktorizáld a számlálót: $x^2 - 4 = (x-2)(x+2)$"},{"level":2,"text_hu":"Egyszerűsítve: $\\frac{(x-2)(x+2)}{x-2} = x+2$"},{"level":3,"text_hu":"$x = 5$ esetén: $5 + 2 = 7$"}]',
 0.7, true);

-- ============================================================
-- LINEAR FUNCTIONS PROBLEMS (skill 004)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Az $f(x) = 2x + 3$ függvényre: mennyi $f(4)$?', 11,
 '[{"level":1,"text_hu":"Helyettesítsd be $x = 4$-et."},{"level":2,"text_hu":"$f(4) = 2 \\cdot 4 + 3 = 8 + 3$"},{"level":3,"text_hu":"$f(4) = 11$"}]',
 0.2, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Az $f(x) = 3x - 5$ függvényre: mi az $y$-tengelymetszet?', -5,
 '[{"level":1,"text_hu":"Az $y$-tengelymetszet az az érték, ahol $x = 0$."},{"level":2,"text_hu":"$f(0) = 3 \\cdot 0 - 5 = -5$"},{"level":3,"text_hu":"Az $y$-tengelymetszet: $-5$"}]',
 0.25, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Mi a meredeksége az $y = -2x + 7$ egyenesnek?', -2,
 '[{"level":1,"text_hu":"Az $y = mx + b$ alakban $m$ a meredekség."},{"level":2,"text_hu":"$y = -2x + 7$, tehát $m = -2$"},{"level":3,"text_hu":"A meredekség: $-2$"}]',
 0.2, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Ha $f(x) = 4x - 1$, milyen $x$-re lesz $f(x) = 11$?', 3,
 '[{"level":1,"text_hu":"Írd fel az egyenletet: $4x - 1 = 11$"},{"level":2,"text_hu":"$4x = 12$"},{"level":3,"text_hu":"$x = 3$"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Két pontja egy egyenesnek: $(0, 2)$ és $(3, 8)$. Mi a meredeksége?', 2,
 '[{"level":1,"text_hu":"Meredekség: $m = \\frac{y_2 - y_1}{x_2 - x_1}$"},{"level":2,"text_hu":"$m = \\frac{8-2}{3-0} = \\frac{6}{3}$"},{"level":3,"text_hu":"$m = 2$"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Párhuzamos egyenesek meredeksége egyenlő. Ha $y = 3x + 1$ párhuzamos egy egyenessel, és ez utóbbi átmegy $(0, 5)$-ön, mi az $y$-tengelymetszete?', 5,
 '[{"level":1,"text_hu":"A párhuzamos egyenes meredeksége szintén 3."},{"level":2,"text_hu":"Az egyenes: $y = 3x + b$. Átmegy $(0,5)$-ön: $5 = 3 \\cdot 0 + b$"},{"level":3,"text_hu":"$b = 5$"}]',
 0.6, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Az $f(x) = 5x - 10$ zérushelye (ahol a grafikon metszi az $x$-tengelyt)?', 2,
 '[{"level":1,"text_hu":"Zérushely: $f(x) = 0$"},{"level":2,"text_hu":"$5x - 10 = 0$, azaz $5x = 10$"},{"level":3,"text_hu":"$x = 2$"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Egy taxi alapdíja 500 Ft, és kilométerenként 200 Ft-ot számít fel. Mennyi az ára 8 km-es útnak (Ft-ban)?', 2100,
 '[{"level":1,"text_hu":"A díjfüggvény: $f(x) = 200x + 500$"},{"level":2,"text_hu":"$f(8) = 200 \\cdot 8 + 500 = 1600 + 500$"},{"level":3,"text_hu":"$f(8) = 2100$ Ft"}]',
 0.5, true),

('00000000-0000-0000-0000-000000000004', 'fill_number',
 'Mely $x$-értékre negatív a $f(x) = 2x - 6$ függvény? Mi az a határpont ($x$)?', 3,
 '[{"level":1,"text_hu":"$f(x) < 0$ esetén $2x - 6 < 0$"},{"level":2,"text_hu":"$2x < 6$, azaz $x < 3$"},{"level":3,"text_hu":"A határpont: $x = 3$"}]',
 0.55, true);

-- ============================================================
-- SYSTEMS OF EQUATIONS PROBLEMS (skill 005)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000005', 'fill_number',
 'Oldd meg: $x + y = 10$ és $x - y = 4$. Mi az $x$ értéke?', 7,
 '[{"level":1,"text_hu":"Add össze a két egyenletet."},{"level":2,"text_hu":"$2x = 14$"},{"level":3,"text_hu":"$x = 7$"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000005', 'fill_number',
 'Oldd meg: $2x + y = 7$ és $x + y = 5$. Mi az $x$ értéke?', 2,
 '[{"level":1,"text_hu":"Vonjuk ki a második egyenletet az elsőből."},{"level":2,"text_hu":"$x = 7 - 5 = 2$"},{"level":3,"text_hu":"$x = 2$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000005', 'fill_number',
 'Oldd meg helyettesítéssel: $y = 2x$ és $x + y = 12$. Mi az $x$ értéke?', 4,
 '[{"level":1,"text_hu":"Helyettesítsd be $y = 2x$-et a második egyenletbe."},{"level":2,"text_hu":"$x + 2x = 12$, azaz $3x = 12$"},{"level":3,"text_hu":"$x = 4$"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000005', 'fill_number',
 'Egy osztályban kétszer annyi lány van, mint fiú. Összesen 36 tanuló van. Hány fiú van?', 12,
 '[{"level":1,"text_hu":"Jelöljük a fiúk számát $x$-szel, a lányokét $y$-nal. $y = 2x$ és $x + y = 36$"},{"level":2,"text_hu":"$x + 2x = 36$, tehát $3x = 36$"},{"level":3,"text_hu":"$x = 12$ fiú"}]',
 0.55, true),

('00000000-0000-0000-0000-000000000005', 'fill_number',
 'Oldd meg: $3x + 2y = 12$ és $x - y = 1$. Mi az $y$ értéke?', 1,
 '[{"level":1,"text_hu":"A második egyenletből: $x = y + 1$. Helyettesítsd be az elsőbe."},{"level":2,"text_hu":"$3(y+1) + 2y = 12$, azaz $5y + 3 = 12$"},{"level":3,"text_hu":"$5y = 9$? Ellenőrizd: $3 \\cdot 2 + 2 \\cdot 3 = 12$? $x=2, y=3$? Próbáld $y=3/5$..."}]',
 0.7, true);

-- ============================================================
-- BASIC GEOMETRY PROBLEMS (skill 006)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Egy háromszög szögeinek összege. Két szög $60°$ és $80°$. Mi a harmadik szög fokban?', 40,
 '[{"level":1,"text_hu":"Háromszög belső szögeinek összege: $180°$"},{"level":2,"text_hu":"$60° + 80° + x = 180°$"},{"level":3,"text_hu":"$x = 40°$"}]',
 0.2, true),

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Egy négyzet oldalhossza 7 cm. Mi a területe cm²-ben?', 49,
 '[{"level":1,"text_hu":"Négyzet területe: $T = a^2$"},{"level":2,"text_hu":"$T = 7^2$"},{"level":3,"text_hu":"$T = 49$ cm²"}]',
 0.15, false),

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Egy téglalap hossza 12 cm, szélessége 5 cm. Mi a kerülete cm-ben?', 34,
 '[{"level":1,"text_hu":"Kerület: $K = 2(a + b)$"},{"level":2,"text_hu":"$K = 2(12 + 5) = 2 \\cdot 17$"},{"level":3,"text_hu":"$K = 34$ cm"}]',
 0.15, false),

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Pitagorasz-tétel: egy derékszögű háromszög befogói 3 és 4 cm. Mi az átfogó cm-ben?', 5,
 '[{"level":1,"text_hu":"$c^2 = a^2 + b^2$"},{"level":2,"text_hu":"$c^2 = 9 + 16 = 25$"},{"level":3,"text_hu":"$c = 5$ cm"}]',
 0.3, true),

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Egy szabályos hatszög belső szögei egyenlők. Mennyi egy belső szög?', 120,
 '[{"level":1,"text_hu":"$n$-szög belső szögeinek összege: $(n-2) \\cdot 180°$"},{"level":2,"text_hu":"Hatszög: $(6-2) \\cdot 180° = 720°$"},{"level":3,"text_hu":"$720° \\div 6 = 120°$"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Egy kör sugara 5 cm. Mi a területe $\\pi$ értékével? ($\\pi \\approx 3.14$, egy tizedes jegyig)', null,
 '[{"level":1,"text_hu":"Kör területe: $T = r^2 \\pi$"},{"level":2,"text_hu":"$T = 5^2 \\cdot \\pi = 25\\pi$"},{"level":3,"text_hu":"$25 \\cdot 3.14 = 78.5$ cm²"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000006', 'fill_number',
 'Pitagorasz-tétel: az átfogó 13 cm, az egyik befogó 5 cm. Mi a másik befogó cm-ben?', 12,
 '[{"level":1,"text_hu":"$a^2 + b^2 = c^2$, tehát $b^2 = c^2 - a^2$"},{"level":2,"text_hu":"$b^2 = 169 - 25 = 144$"},{"level":3,"text_hu":"$b = 12$ cm"}]',
 0.4, true);

-- ============================================================
-- STATISTICS INTRO PROBLEMS (skill 007)
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000007', 'fill_number',
 'A következő adatok átlaga: $4, 7, 9, 2, 8$', 6,
 '[{"level":1,"text_hu":"Átlag = összes szám összege / darabszám"},{"level":2,"text_hu":"$(4+7+9+2+8) = 30$, és $5$ adat van"},{"level":3,"text_hu":"$30 \\div 5 = 6$"}]',
 0.25, true),

('00000000-0000-0000-0000-000000000007', 'fill_number',
 'A következő adatok mediánja: $3, 7, 1, 9, 5$', 5,
 '[{"level":1,"text_hu":"Rendezd az adatokat növekvő sorrendbe."},{"level":2,"text_hu":"$1, 3, 5, 7, 9$ — 5 adat van, a középső a 3. elem"},{"level":3,"text_hu":"A medián: 5"}]',
 0.3, true),

('00000000-0000-0000-0000-000000000007', 'fill_number',
 'Kísérletnél egy érme dobásakor mi a fej dobásának valószínűsége? (törtként, 2 tizedes jegyig)', null,
 '[{"level":1,"text_hu":"Klasszikus valószínűség: kedvező esetek / összes lehetséges eset"},{"level":2,"text_hu":"Fej: 1 eset, összes: 2 (fej vagy írás)"},{"level":3,"text_hu":"$P = 1/2 = 0.5$"}]',
 0.2, true),

('00000000-0000-0000-0000-000000000007', 'fill_number',
 'Ha egy dobókockával dobunk, mi a valószínűsége, hogy 4-nél nagyobb számot dobunk? (törtként, add meg a számlálót)', 2,
 '[{"level":1,"text_hu":"4-nél nagyobb számok: 5 és 6"},{"level":2,"text_hu":"2 kedvező eset, összes: 6"},{"level":3,"text_hu":"$P = 2/6 = 1/3$, a számláló: 2"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000007', 'fill_number',
 'Osztály vizsgajegyei: $2, 3, 4, 4, 5, 3, 4, 5, 2, 4$. Mi a módusz (a leggyakoribb jegy)?', 4,
 '[{"level":1,"text_hu":"A módusz a leggyakrabban előforduló érték."},{"level":2,"text_hu":"A 4-es szám 4-szer szerepel, a többi kevesebbet."},{"level":3,"text_hu":"Módusz: 4"}]',
 0.3, true);

-- ============================================================
-- QUADRATIC EQUATIONS PROBLEMS (skill 011) - Grade 10
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000011', 'fill_number',
 'Oldd meg: $x^2 - 5x + 6 = 0$ — mi a nagyobb gyök?', 3,
 '[{"level":1,"text_hu":"Keresd azokat az egész számokat, amelyek összege $-5$ és szorzata $6$."},{"level":2,"text_hu":"$-2 + (-3) = -5$ és $(-2)(-3) = 6$, tehát $(x-2)(x-3) = 0$"},{"level":3,"text_hu":"$x = 2$ vagy $x = 3$, a nagyobb: 3"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000011', 'fill_number',
 'Oldd meg: $x^2 - 4 = 0$ — mi a pozitív gyök?', 2,
 '[{"level":1,"text_hu":"$x^2 = 4$"},{"level":2,"text_hu":"$x = \\pm\\sqrt{4}$"},{"level":3,"text_hu":"$x = 2$ (pozitív gyök)"}]',
 0.25, true),

('00000000-0000-0000-0000-000000000011', 'fill_number',
 'Egy másodfokú egyenlet diszkriminánsa: $b^2 - 4ac$ ahol $a=1, b=-4, c=4$. Mi a diszkrimináns?', 0,
 '[{"level":1,"text_hu":"Helyettesítsd be: $D = (-4)^2 - 4 \\cdot 1 \\cdot 4$"},{"level":2,"text_hu":"$D = 16 - 16$"},{"level":3,"text_hu":"$D = 0$ (kettős gyök)"}]',
 0.45, true),

('00000000-0000-0000-0000-000000000011', 'fill_number',
 'Oldd meg a képlettel: $2x^2 - 7x + 3 = 0$ — mi a kisebb gyök?', null,
 '[{"level":1,"text_hu":"$x = \\frac{7 \\pm \\sqrt{49 - 24}}{4} = \\frac{7 \\pm \\sqrt{25}}{4}$"},{"level":2,"text_hu":"$x = \\frac{7 \\pm 5}{4}$"},{"level":3,"text_hu":"$x_1 = \\frac{2}{4} = 0.5$, $x_2 = 3$, kisebb: $0.5$"}]',
 0.65, true),

('00000000-0000-0000-0000-000000000011', 'fill_number',
 'Hány valós gyöke van az $x^2 + 2x + 5 = 0$ egyenletnek?', 0,
 '[{"level":1,"text_hu":"Számítsd ki a diszkriminánst: $D = b^2 - 4ac$"},{"level":2,"text_hu":"$D = 4 - 20 = -16 < 0$"},{"level":3,"text_hu":"$D < 0$: nincs valós gyök, tehát 0"}]',
 0.55, true);

-- ============================================================
-- ARITHMETIC SEQUENCES (skill 013) - Grade 10
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000013', 'fill_number',
 'Egy számtani sorozat első tagja $a_1 = 3$, differenciája $d = 5$. Mi az 5. tag?', 23,
 '[{"level":1,"text_hu":"Általános tag: $a_n = a_1 + (n-1)d$"},{"level":2,"text_hu":"$a_5 = 3 + 4 \\cdot 5 = 3 + 20$"},{"level":3,"text_hu":"$a_5 = 23$"}]',
 0.35, true),

('00000000-0000-0000-0000-000000000013', 'fill_number',
 'Egy számtani sorozat: $2, 5, 8, 11, ...$. Mi a 10. tag?', 29,
 '[{"level":1,"text_hu":"Differencia $d = 5 - 2 = 3$, első tag $a_1 = 2$"},{"level":2,"text_hu":"$a_{10} = 2 + 9 \\cdot 3 = 2 + 27$"},{"level":3,"text_hu":"$a_{10} = 29$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000013', 'fill_number',
 'Egy számtani sorozat első 5 tagjának összege: $a_1 = 1$, $d = 2$. Mi az összeg?', 25,
 '[{"level":1,"text_hu":"$S_n = \\frac{n}{2}(2a_1 + (n-1)d)$"},{"level":2,"text_hu":"$S_5 = \\frac{5}{2}(2 + 4 \\cdot 2) = \\frac{5}{2} \\cdot 10$"},{"level":3,"text_hu":"$S_5 = 25$"}]',
 0.5, true);

-- ============================================================
-- TRIGONOMETRY PROBLEMS (skill 015) - Grade 10
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000015', 'fill_number',
 'Egy derékszögű háromszögben az egyik szög $30°$. A szemközti befogó 5 cm. Mi az átfogó?', 10,
 '[{"level":1,"text_hu":"$\\sin(30°) = \\frac{\\text{szemközti befogó}}{\\text{átfogó}}$"},{"level":2,"text_hu":"$\\sin(30°) = 0.5$, tehát $\\frac{5}{c} = 0.5$"},{"level":3,"text_hu":"$c = 10$ cm"}]',
 0.5, true),

('00000000-0000-0000-0000-000000000015', 'fill_number',
 'Mennyi $\\sin(90°)$?', 1,
 '[{"level":1,"text_hu":"Idézd fel a speciális szögek szinuszát."},{"level":2,"text_hu":"$\\sin(90°)$ a maximális érték."},{"level":3,"text_hu":"$\\sin(90°) = 1$"}]',
 0.15, false),

('00000000-0000-0000-0000-000000000015', 'fill_number',
 'Egy derékszögű háromszögben az átfogó 10 cm, egy szög $60°$. Mi a szomszédos befogó hossza?', 5,
 '[{"level":1,"text_hu":"$\\cos(60°) = \\frac{\\text{szomszédos befogó}}{\\text{átfogó}}$"},{"level":2,"text_hu":"$\\cos(60°) = 0.5$, tehát $a = 10 \\cdot 0.5$"},{"level":3,"text_hu":"$a = 5$ cm"}]',
 0.55, true);

-- ============================================================
-- COMBINATORICS PROBLEMS (skill 017) - Grade 10
-- ============================================================
insert into problems (skill_id, type, content_latex, solution_numeric, hints, difficulty, matura_relevant) values

('00000000-0000-0000-0000-000000000017', 'fill_number',
 'Hányféleképpen rendezhető el $5$ különböző tárgy sorban?', 120,
 '[{"level":1,"text_hu":"Ez permutáció: $n$ elem sorba rendezésének száma $n!$"},{"level":2,"text_hu":"$5! = 5 \\times 4 \\times 3 \\times 2 \\times 1$"},{"level":3,"text_hu":"$= 120$"}]',
 0.4, true),

('00000000-0000-0000-0000-000000000017', 'fill_number',
 'Hányféleképpen választható 2 tárgy 4-ből (a sorrend nem számít)?', 6,
 '[{"level":1,"text_hu":"Kombináció: $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$"},{"level":2,"text_hu":"$\\binom{4}{2} = \\frac{4!}{2! \\cdot 2!} = \\frac{24}{4}$"},{"level":3,"text_hu":"$= 6$"}]',
 0.5, true),

('00000000-0000-0000-0000-000000000017', 'fill_number',
 'Hányféle 3 jegyű szám írható a $\\{1,2,3\\}$ számjegyek ismétlés nélküli felhasználásával?', 6,
 '[{"level":1,"text_hu":"Ez permutáció 3 elemből."},{"level":2,"text_hu":"$P_3 = 3! = 6$"},{"level":3,"text_hu":"$= 6$ féle szám"}]',
 0.45, true);

-- First season
insert into seasons (id, name, start_date, end_date, theme, milestones) values
  ('10000000-0000-0000-0000-000000000001',
   'Egyenletek Kora',
   '2025-09-01',
   '2025-12-20',
   '{"primary_color":"#4f46e5","secondary_color":"#7c3aed","icon":"⚡","description":"Az algebrai gondolkodás kora — hódítsd meg az egyenletek birodalmát!"}',
   '[{"position":1,"xp_required":50,"reward":"Kezdő matematikus cím"},{"position":5,"xp_required":300,"reward":"Algebrai kifejező jelvény"},{"position":10,"xp_required":750,"reward":"Egyenletmester avatar keret"},{"position":15,"xp_required":1500,"reward":"Arany sorozatvédő"},{"position":20,"xp_required":2500,"reward":"Évad befejező jutalom: Egyenletek Kora korona"},{"position":30,"xp_required":5000,"reward":"Legendás matematikus cím + különleges avatar"}]'
  )
on conflict (id) do nothing;
