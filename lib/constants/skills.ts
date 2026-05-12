export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Construction & Trades": ["Carpenter","Mason","Painter","Plumber","Electrician","Welder","Roofer","Tiler"],
  "Transport":             ["Boda rider","Taxi driver","Truck driver","Tuk-tuk driver"],
  "Domestic":              ["House cleaner","Cook","Nanny / Babysitter","Gardener","Laundry"],
  "Healthcare":            ["Nurse","Clinical officer","Lab technician","Pharmacist","Midwife"],
  "Security":              ["Security guard","Watchman"],
  "Agriculture":           ["Farm worker","Irrigation tech","Poultry worker","Dairy worker"],
  "Hospitality":           ["Waiter","Bartender","Hotel receptionist","Chef"],
  "Digital & Office":      ["Data entry","Receptionist","Accountant","Graphic designer","Social media"],
  "Retail":                ["Shop attendant","Cashier","Market vendor"],
  "Education":             ["Teacher (primary)","Teacher (secondary)","Tutor"],
  "Beauty":                ["Hairdresser","Barber","Nail technician","Makeup artist"],
};

export const ALL_SKILLS: string[] = Object.values(SKILL_CATEGORIES).flat();

export const UGANDA_DISTRICTS: string[] = [
  "Abim","Adjumani","Agago","Alebtong","Amolatar","Amudat","Amuria","Amuru",
  "Apac","Arua","Budaka","Bududa","Bugiri","Buhweju","Buikwe","Bukedea",
  "Bukomansimbi","Bukwa","Bulambuli","Buliisa","Bundibugyo","Bunyangabu",
  "Bushenyi","Busia","Butaleja","Butebo","Buvuma","Buyende","Dokolo",
  "Gomba","Gulu","Hoima","Ibanda","Iganga","Isingiro","Jinja","Kaabong",
  "Kabale","Kabarole","Kaberamaido","Kagadi","Kakumiro","Kalaki","Kalangala",
  "Kaliro","Kalungu","Kampala","Kamuli","Kamwenge","Kanungu","Kapchorwa",
  "Kapelebyong","Karenga","Kasanda","Kasese","Katakwi","Kayunga","Kazo",
  "Kibale","Kiboga","Kibuku","Kikuube","Kiruhura","Kiryandongo","Kisoro",
  "Kitagwenda","Kitgum","Koboko","Kole","Kotido","Kumi","Kwania","Kween",
  "Kyankwanzi","Kyegegwa","Kyenjojo","Kyotera","Lamwo","Lira","Luuka",
  "Luwero","Lwengo","Lyantonde","Madi-Okollo","Manafwa","Maracha","Masaka",
  "Masindi","Mayuge","Mbale","Mbarara","Mitooma","Mityana","Moroto","Moyo",
  "Mpigi","Mubende","Mukono","Nabilatuk","Nakapiripirit","Nakaseke","Nakasongola",
  "Namayingo","Namisindwa","Namutumba","Napak","Nebbi","Ngora","Ntoroko",
  "Ntungamo","Nwoya","Obongi","Omoro","Otuke","Oyam","Pader","Pakwach",
  "Pallisa","Rakai","Rubanda","Rubirizi","Rukiga","Rukungiri","Rwampara",
  "Sembabule","Serere","Sheema","Sironko","Soroti","Tororo","Wakiso",
  "Yumbe","Zombo",
];

export const EDUCATION_LEVELS = [
  { value: "none",        label: "None required" },
  { value: "ple",         label: "PLE (Primary)" },
  { value: "uce",         label: "UCE / O-Level" },
  { value: "uace",        label: "UACE / A-Level" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma",     label: "Diploma" },
  { value: "degree",      label: "Degree" },
];

export const LANGUAGES = ["Luganda","English","Swahili","Runyankole","Acholi","Lusoga","Ateso","Lugbara","Luo"];

export const JOB_TYPES = [
  { value: "permanent", label: "Permanent" },
  { value: "casual",    label: "Casual (by the day)" },
  { value: "contract",  label: "Contract (fixed period)" },
];

export const PAY_PERIODS = [
  { value: "daily",   label: "Per day" },
  { value: "weekly",  label: "Per week" },
  { value: "monthly", label: "Per month" },
];
