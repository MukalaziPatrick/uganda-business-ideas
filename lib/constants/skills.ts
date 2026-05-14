export interface SkillOption {
  value: string;
  label: string;
}

export const ALL_SKILLS: string[] = [
  "Carpenter",
  "Electrician",
  "Plumber",
  "Mason",
  "Painter",
  "Welder",
  "Driver",
  "Gardener",
  "Cleaner",
  "Cook"
];

export const UGANDA_DISTRICTS: string[] = [
  "Kampala",
  "Wakiso",
  "Mukono",
  "Jinja",
  "Mbale"
];

export const EDUCATION_LEVELS: SkillOption[] = [
  { value: "primary", label: "Primary School" },
  { value: "secondary", label: "Secondary School" },
  { value: "diploma", label: "Diploma" },
  { value: "degree", label: "Degree" },
  { value: "masters", label: "Masters" }
];

export const LANGUAGES: string[] = [
  "English",
  "Luganda",
  "Runyankole",
  "Luo",
  "Ateso"
];

export const JOB_TYPES: SkillOption[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" }
];

export const PAY_PERIODS: SkillOption[] = [
  { value: "hour", label: "Per Hour" },
  { value: "day", label: "Per Day" },
  { value: "week", label: "Per Week" },
  { value: "month", label: "Per Month" }
];
