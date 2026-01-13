// Login page constants and configuration

export const FORM_VALIDATION_RULES = {
  EMAIL_REGEX: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
};

export const FORM_INITIAL_STATE = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const MEET_SECTIONS = [
  {
    id: "create",
    title: "Create with CodeSeed",
    icon: "FileText",
    body: "Draft and iterate on code, documents and UI concepts alongside your chat. CodeSeed stays in sync with your changes so you can move from idea to implementation faster.",
  },
  {
    id: "knowledge",
    title: "Bring your knowledge",
    icon: "BookOpen",
    body: "Connect your own projects, docs and notes so CodeSeed can answer with your context in mind while keeping your data private and secure.",
  },
  {
    id: "collaborate",
    title: "Share and collaborate with your team",
    icon: "Users",
    body: "Share your best prompts, snippets and workflows to help your team move faster together on engineering work, docs and experiments.",
  },
];

export const FAQ_ITEMS = [
  {
    id: "what",
    question: "What is CodeSeed and how does it work?",
    answer:
      "CodeSeed is an AI assistant designed to help you understand code, explore ideas and ship features faster. It can read your prompts, reason about problems, and suggest or generate code while keeping you in control of the final implementation.",
  },
  {
    id: "use-for",
    question: "What should I use CodeSeed for?",
    answer:
      "Use CodeSeed to explore new concepts, refactor existing code, debug issues, sketch out UI, or draft technical documents. It's great for brainstorming and turning rough ideas into working prototypes.",
  },
  {
    id: "cost",
    question: "How much does it cost to use?",
    answer:
      "You can start using CodeSeed on a free tier and upgrade later if you need more usage or team features. Pricing is designed to stay accessible while scaling with more intensive workloads.",
  },
];

export const LOGIN_ERROR_MESSAGES = {
  INVALID_EMAIL: "Incorrect email or password.",
  DUPLICATE_EMAIL: "An account with this email already exists.",
  GENERIC_ERROR: "Unable to complete the request. Please try again.",
  SERVER_UNREACHABLE: "Unable to reach the server. Please try again.",
};
