/**
 * Mard221 Fuse Bead Palette + Color Utilities
 */
const Palette = (() => {

  const colors = [
    {hex:"#F9F6C3",tag:"A1",r:249,g:246,b:195},
    {hex:"#FFFED7",tag:"A2",r:255,g:254,b:215},
    {hex:"#FEFD91",tag:"A3",r:254,g:253,b:145},
    {hex:"#F9EE56",tag:"A4",r:249,g:238,b:86},
    {hex:"#F3D537",tag:"A5",r:243,g:213,b:55},
    {hex:"#FFAD49",tag:"A6",r:255,g:173,b:73},
    {hex:"#FA8C4D",tag:"A7",r:250,g:140,b:77},
    {hex:"#FFD948",tag:"A8",r:255,g:217,b:72},
    {hex:"#FF995B",tag:"A9",r:255,g:153,b:91},
    {hex:"#FC7933",tag:"A10",r:252,g:121,b:51},
    {hex:"#FBDE9C",tag:"A11",r:251,g:222,b:156},
    {hex:"#FF9C72",tag:"A12",r:255,g:156,b:114},
    {hex:"#FEC26A",tag:"A13",r:254,g:194,b:106},
    {hex:"#FC503C",tag:"A14",r:252,g:80,b:60},
    {hex:"#FFEF6B",tag:"A15",r:255,g:239,b:107},
    {hex:"#FFFB9A",tag:"A16",r:255,g:251,b:154},
    {hex:"#F8DE7D",tag:"A17",r:248,g:222,b:125},
    {hex:"#F7C07F",tag:"A18",r:247,g:192,b:127},
    {hex:"#FC7E72",tag:"A19",r:252,g:126,b:114},
    {hex:"#FED46E",tag:"A20",r:254,g:212,b:110},
    {hex:"#F6E597",tag:"A21",r:246,g:229,b:151},
    {hex:"#EBFA79",tag:"A22",r:235,g:250,b:121},
    {hex:"#E1C9C5",tag:"A23",r:225,g:201,b:197},
    {hex:"#EFF7AA",tag:"A24",r:239,g:247,b:170},
    {hex:"#FADC86",tag:"A25",r:250,g:220,b:134},
    {hex:"#FBC837",tag:"A26",r:251,g:200,b:55},
    {hex:"#E5EE33",tag:"B1",r:229,g:238,b:51},
    {hex:"#69ED5C",tag:"B2",r:105,g:237,b:92},
    {hex:"#9FF47D",tag:"B3",r:159,g:244,b:125},
    {hex:"#5DDE39",tag:"B4",r:93,g:222,b:57},
    {hex:"#38E150",tag:"B5",r:56,g:225,b:80},
    {hex:"#62E4A4",tag:"B6",r:98,g:228,b:164},
    {hex:"#3BB083",tag:"B7",r:59,g:176,b:131},
    {hex:"#1A9D4D",tag:"B8",r:26,g:157,b:77},
    {hex:"#335640",tag:"B9",r:51,g:86,b:64},
    {hex:"#95D2C2",tag:"B10",r:149,g:210,b:194},
    {hex:"#5E722D",tag:"B11",r:94,g:114,b:45},
    {hex:"#11723D",tag:"B12",r:17,g:114,b:61},
    {hex:"#C6EC7B",tag:"B13",r:198,g:236,b:123},
    {hex:"#AFE750",tag:"B14",r:175,g:231,b:80},
    {hex:"#2E5131",tag:"B15",r:46,g:81,b:49},
    {hex:"#C6ED9E",tag:"B16",r:198,g:237,b:158},
    {hex:"#9DB03D",tag:"B17",r:157,g:176,b:61},
    {hex:"#E0F045",tag:"B18",r:224,g:240,b:69},
    {hex:"#28B68E",tag:"B19",r:40,g:182,b:142},
    {hex:"#C5EED0",tag:"B20",r:197,g:238,b:208},
    {hex:"#196A6D",tag:"B21",r:25,g:106,b:109},
    {hex:"#104D48",tag:"B22",r:16,g:77,b:72},
    {hex:"#3A441F",tag:"B23",r:58,g:68,b:31},
    {hex:"#E7FAA9",tag:"B24",r:231,g:250,b:169},
    {hex:"#5B8B75",tag:"B25",r:91,g:139,b:117},
    {hex:"#938642",tag:"B26",r:147,g:134,b:66},
    {hex:"#D7E5B2",tag:"B27",r:215,g:229,b:178},
    {hex:"#B0E2C7",tag:"B28",r:176,g:226,b:199},
    {hex:"#D0EA6D",tag:"B29",r:208,g:234,b:109},
    {hex:"#EBFDC3",tag:"B30",r:235,g:253,b:195},
    {hex:"#C0E69D",tag:"B31",r:192,g:230,b:157},
    {hex:"#9CB36F",tag:"B32",r:156,g:179,b:111},
    {hex:"#E8FEE7",tag:"C1",r:232,g:254,b:231},
    {hex:"#A7F6FB",tag:"C2",r:167,g:246,b:251},
    {hex:"#A0E1FF",tag:"C3",r:160,g:225,b:255},
    {hex:"#42C7FF",tag:"C4",r:66,g:199,b:255},
    {hex:"#06AAE9",tag:"C5",r:6,g:170,b:233},
    {hex:"#4FABEE",tag:"C6",r:79,g:171,b:238},
    {hex:"#3578D1",tag:"C7",r:53,g:120,b:209},
    {hex:"#1155BA",tag:"C8",r:17,g:85,b:186},
    {hex:"#304CC7",tag:"C9",r:48,g:76,b:199},
    {hex:"#43BBE0",tag:"C10",r:67,g:187,b:224},
    {hex:"#28DCD9",tag:"C11",r:40,g:220,b:217},
    {hex:"#2B3A57",tag:"C12",r:43,g:58,b:87},
    {hex:"#CDE9FF",tag:"C13",r:205,g:233,b:255},
    {hex:"#D5FDFF",tag:"C14",r:213,g:253,b:255},
    {hex:"#1CC6C5",tag:"C15",r:28,g:198,b:197},
    {hex:"#1459A7",tag:"C16",r:20,g:89,b:167},
    {hex:"#05D2F1",tag:"C17",r:5,g:210,b:241},
    {hex:"#293744",tag:"C18",r:41,g:55,b:68},
    {hex:"#1F8FA3",tag:"C19",r:31,g:143,b:163},
    {hex:"#2576AB",tag:"C20",r:37,g:118,b:171},
    {hex:"#BCDEFA",tag:"C21",r:188,g:222,b:250},
    {hex:"#76B7BD",tag:"C22",r:118,g:183,b:189},
    {hex:"#CDE1FC",tag:"C23",r:205,g:225,b:252},
    {hex:"#89C9F7",tag:"C24",r:137,g:201,b:247},
    {hex:"#AFE8E2",tag:"C25",r:175,g:232,b:226},
    {hex:"#3FBDCB",tag:"C26",r:63,g:189,b:203},
    {hex:"#DBE1F1",tag:"C27",r:219,g:225,b:241},
    {hex:"#C2D2E9",tag:"C28",r:194,g:210,b:233},
    {hex:"#454F94",tag:"C29",r:69,g:79,b:148},
    {hex:"#AEB4F2",tag:"D1",r:174,g:180,b:242},
    {hex:"#868ED7",tag:"D2",r:134,g:142,b:215},
    {hex:"#2E55B4",tag:"D3",r:46,g:85,b:180},
    {hex:"#162B7C",tag:"D4",r:22,g:43,b:124},
    {hex:"#B144C3",tag:"D5",r:177,g:68,b:195},
    {hex:"#AA7BD9",tag:"D6",r:170,g:123,b:217},
    {hex:"#8953B1",tag:"D7",r:137,g:83,b:177},
    {hex:"#E3D4FB",tag:"D8",r:227,g:212,b:251},
    {hex:"#D5B8F8",tag:"D9",r:213,g:184,b:248},
    {hex:"#2E1944",tag:"D10",r:46,g:25,b:68},
    {hex:"#B8BAE3",tag:"D11",r:184,g:186,b:227},
    {hex:"#DA99D3",tag:"D12",r:218,g:153,b:211},
    {hex:"#B50292",tag:"D13",r:181,g:2,b:146},
    {hex:"#8B269C",tag:"D14",r:139,g:38,b:156},
    {hex:"#2F1F8C",tag:"D15",r:47,g:31,b:140},
    {hex:"#E1E1E9",tag:"D16",r:225,g:225,b:233},
    {hex:"#C5D4F3",tag:"D17",r:197,g:212,b:243},
    {hex:"#A55EC6",tag:"D18",r:165,g:94,b:198},
    {hex:"#D9C3D8",tag:"D19",r:217,g:195,b:216},
    {hex:"#9830AD",tag:"D20",r:152,g:48,b:173},
    {hex:"#970399",tag:"D21",r:151,g:3,b:153},
    {hex:"#333D92",tag:"D22",r:51,g:61,b:146},
    {hex:"#EADEF6",tag:"D23",r:234,g:222,b:246},
    {hex:"#7488E7",tag:"D24",r:116,g:136,b:231},
    {hex:"#454EC5",tag:"D25",r:69,g:78,b:197},
    {hex:"#D4C5E6",tag:"D26",r:212,g:197,b:230},
    {hex:"#FBD5C8",tag:"E1",r:251,g:213,b:200},
    {hex:"#FCBFE0",tag:"E2",r:252,g:191,b:224},
    {hex:"#FFB7E2",tag:"E3",r:255,g:183,b:226},
    {hex:"#E9629D",tag:"E4",r:233,g:98,b:157},
    {hex:"#F451A2",tag:"E5",r:244,g:81,b:162},
    {hex:"#EF3C74",tag:"E6",r:239,g:60,b:116},
    {hex:"#C43376",tag:"E7",r:196,g:51,b:118},
    {hex:"#FFDAE9",tag:"E8",r:255,g:218,b:233},
    {hex:"#E872CA",tag:"E9",r:232,g:114,b:202},
    {hex:"#D63497",tag:"E10",r:214,g:52,b:151},
    {hex:"#F7DFD3",tag:"E11",r:247,g:223,b:211},
    {hex:"#F391C2",tag:"E12",r:243,g:145,b:194},
    {hex:"#B6006E",tag:"E13",r:182,g:0,b:110},
    {hex:"#FBD1B9",tag:"E14",r:251,g:209,b:185},
    {hex:"#FDC4CA",tag:"E15",r:253,g:196,b:202},
    {hex:"#FAF5F1",tag:"E16",r:250,g:245,b:241},
    {hex:"#F8E5EB",tag:"E17",r:248,g:229,b:235},
    {hex:"#FDC6D9",tag:"E18",r:253,g:198,b:217},
    {hex:"#F3BACD",tag:"E19",r:243,g:186,b:205},
    {hex:"#D9C5D1",tag:"E20",r:217,g:197,b:209},
    {hex:"#BE9FA4",tag:"E21",r:190,g:159,b:164},
    {hex:"#B48B9B",tag:"E22",r:180,g:139,b:155},
    {hex:"#927E87",tag:"E23",r:146,g:126,b:135},
    {hex:"#DCBEE2",tag:"E24",r:220,g:190,b:226},
    {hex:"#FE947C",tag:"F1",r:254,g:148,b:124},
    {hex:"#F73C43",tag:"F2",r:247,g:60,b:67},
    {hex:"#F54A42",tag:"F3",r:245,g:74,b:66},
    {hex:"#FA293C",tag:"F4",r:250,g:41,b:60},
    {hex:"#E80032",tag:"F5",r:232,g:0,b:50},
    {hex:"#943533",tag:"F6",r:148,g:53,b:51},
    {hex:"#951A36",tag:"F7",r:149,g:26,b:54},
    {hex:"#B9042F",tag:"F8",r:185,g:4,b:47},
    {hex:"#E2677C",tag:"F9",r:226,g:103,b:124},
    {hex:"#8A4323",tag:"F10",r:138,g:67,b:35},
    {hex:"#592120",tag:"F11",r:89,g:33,b:32},
    {hex:"#FD4B6B",tag:"F12",r:253,g:75,b:107},
    {hex:"#F05944",tag:"F13",r:240,g:89,b:68},
    {hex:"#FFA9A8",tag:"F14",r:255,g:169,b:168},
    {hex:"#DC0735",tag:"F15",r:220,g:7,b:53},
    {hex:"#F5C5AF",tag:"F16",r:245,g:197,b:175},
    {hex:"#E9A189",tag:"F17",r:233,g:161,b:137},
    {hex:"#D3874D",tag:"F18",r:211,g:135,b:77},
    {hex:"#C64D56",tag:"F19",r:198,g:77,b:86},
    {hex:"#D0979E",tag:"F20",r:208,g:151,b:158},
    {hex:"#F0C1D1",tag:"F21",r:240,g:193,b:209},
    {hex:"#F4CCCD",tag:"F22",r:244,g:204,b:205},
    {hex:"#EC866F",tag:"F23",r:236,g:134,b:111},
    {hex:"#E0A3B2",tag:"F24",r:224,g:163,b:178},
    {hex:"#EB4A5A",tag:"F25",r:235,g:74,b:90},
    {hex:"#FFE0CC",tag:"G1",r:255,g:224,b:204},
    {hex:"#F4C1A6",tag:"G2",r:244,g:193,b:166},
    {hex:"#F5C2A7",tag:"G3",r:245,g:194,b:167},
    {hex:"#E1B381",tag:"G4",r:225,g:179,b:129},
    {hex:"#EBB048",tag:"G5",r:235,g:176,b:72},
    {hex:"#E49E1C",tag:"G6",r:228,g:158,b:28},
    {hex:"#9C5D3E",tag:"G7",r:156,g:93,b:62},
    {hex:"#703C2F",tag:"G8",r:112,g:60,b:47},
    {hex:"#E7B383",tag:"G9",r:231,g:179,b:131},
    {hex:"#D68D40",tag:"G10",r:214,g:141,b:64},
    {hex:"#E3C390",tag:"G11",r:227,g:195,b:144},
    {hex:"#FEC78F",tag:"G12",r:254,g:199,b:143},
    {hex:"#B97248",tag:"G13",r:185,g:114,b:72},
    {hex:"#8B6148",tag:"G14",r:139,g:97,b:72},
    {hex:"#FCF7E1",tag:"G15",r:252,g:247,b:225},
    {hex:"#F0DAB3",tag:"G16",r:240,g:218,b:179},
    {hex:"#7E514C",tag:"G17",r:126,g:81,b:76},
    {hex:"#F8E4DD",tag:"G18",r:248,g:228,b:221},
    {hex:"#E07E3F",tag:"G19",r:224,g:126,b:63},
    {hex:"#9D462A",tag:"G20",r:157,g:70,b:42},
    {hex:"#AB8669",tag:"G21",r:171,g:134,b:105},
    {hex:"#FDFBFE",tag:"H1",r:253,g:251,b:254},
    {hex:"#FDFBFE",tag:"H2",r:253,g:251,b:254},
    {hex:"#B4B1BA",tag:"H3",r:180,g:177,b:186},
    {hex:"#89868D",tag:"H4",r:137,g:134,b:141},
    {hex:"#484852",tag:"H5",r:72,g:72,b:82},
    {hex:"#2E2C2D",tag:"H6",r:46,g:44,b:45},
    {hex:"#080808",tag:"H7",r:8,g:8,b:8},
    {hex:"#E7D7D7",tag:"H8",r:231,g:215,b:215},
    {hex:"#EDEDED",tag:"H9",r:237,g:237,b:237},
    {hex:"#ECEAEB",tag:"H10",r:236,g:234,b:235},
    {hex:"#CFCCD5",tag:"H11",r:207,g:204,b:213},
    {hex:"#FFF8EF",tag:"H12",r:255,g:248,b:239},
    {hex:"#F5EAD4",tag:"H13",r:245,g:234,b:212},
    {hex:"#D0D6D4",tag:"H14",r:208,g:214,b:212},
    {hex:"#98A8A7",tag:"H15",r:152,g:168,b:167},
    {hex:"#1B1517",tag:"H16",r:27,g:21,b:23},
    {hex:"#EFEBEC",tag:"H17",r:239,g:235,b:236},
    {hex:"#FDFFFA",tag:"H18",r:253,g:255,b:250},
    {hex:"#F1EDE2",tag:"H19",r:241,g:237,b:226},
    {hex:"#97A09B",tag:"H20",r:151,g:160,b:155},
    {hex:"#FBFEE9",tag:"H21",r:251,g:254,b:233},
    {hex:"#C9C9D1",tag:"H22",r:201,g:201,b:209},
    {hex:"#989B90",tag:"H23",r:152,g:155,b:144},
    {hex:"#BBC5BA",tag:"M1",r:187,g:197,b:186},
    {hex:"#8CA387",tag:"M2",r:140,g:163,b:135},
    {hex:"#6C797F",tag:"M3",r:108,g:121,b:127},
    {hex:"#E3D2C0",tag:"M4",r:227,g:210,b:192},
    {hex:"#D3CAAB",tag:"M5",r:211,g:202,b:171},
    {hex:"#B2A585",tag:"M6",r:178,g:165,b:133},
    {hex:"#B0A498",tag:"M7",r:176,g:164,b:152},
    {hex:"#B3827E",tag:"M8",r:179,g:130,b:126},
    {hex:"#A58667",tag:"M9",r:165,g:134,b:103},
    {hex:"#C5B1BC",tag:"M10",r:197,g:177,b:188},
    {hex:"#A17294",tag:"M11",r:161,g:114,b:148},
    {hex:"#61474A",tag:"M12",r:97,g:71,b:74},
    {hex:"#CD9266",tag:"M13",r:205,g:146,b:102},
    {hex:"#C97261",tag:"M14",r:201,g:114,b:97},
    {hex:"#767A79",tag:"M15",r:118,g:122,b:121},
  ];

  // ── Color space conversions ─────────────────────────────────────────

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [h * 360, s, l];
  }

  // ── Distance functions ──────────────────────────────────────────────

  function rgbDist(a, b) {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  }

  function perceptualDist(a, b) {
    // Weighted Euclidean approximating perceptual difference
    return Math.sqrt(2 * (a.r - b.r) ** 2 + 4 * (a.g - b.g) ** 2 + 3 * (a.b - b.b) ** 2);
  }

  function hueDist(a, b) {
    const ha = rgbToHsl(a.r, a.g, a.b)[0];
    const hb = rgbToHsl(b.r, b.g, b.b)[0];
    const diff = Math.abs(ha - hb);
    return Math.min(diff, 360 - diff);
  }

  const distanceFns = { rgb: rgbDist, perceptual: perceptualDist, hue: hueDist };

  function findClosest(color, distFn) {
    let minD = Infinity, best = colors[0];
    for (const c of colors) {
      const d = distFn(color, c);
      if (d < minD) { minD = d; best = c; }
    }
    return best;
  }

  // Group colors by letter prefix for picker display
  function getGroups() {
    const groups = {};
    for (const c of colors) {
      const g = c.tag.match(/^[A-Z]+/)[0];
      if (!groups[g]) groups[g] = [];
      groups[g].push(c);
    }
    return groups;
  }

  return { colors, rgbToHsl, rgbDist, perceptualDist, hueDist, distanceFns, findClosest, getGroups };
})();
