"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Minimal i18n for the open-demo web app.
 *
 * One flat dictionary per locale, looked up by dotted keys. No
 * interpolation, no pluralization — when a string needs a runtime
 * value the caller should pass the translated template to a helper
 * that does the substitution.
 *
 * Persists the selection in localStorage under "leadgen.lang"; defaults
 * to Russian because the team that QAs the site is Russian-speaking.
 */

export type Locale = "ru" | "en";

const STORAGE_KEY = "leadgen.lang";

const TRANSLATIONS = {
  ru: {
    // Shared / buttons
    "common.newSearch": "Новый поиск",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.saving": "Сохраняю…",
    "common.viewAll": "Все →",
    "common.openCrm": "Открыть CRM →",
    "common.back": "Назад",
    "common.signIn": "Войти",
    "common.loading": "Загрузка…",
    "common.retry": "Повторить",
    "common.none": "—",
    "common.export": "Экспорт",
    "common.excel": "Excel",
    "common.edit": "Изменить",
    "common.invite": "Пригласить",

    // Language switcher
    "lang.switch": "Язык",

    // Sidebar
    "nav.workspace": "Рабочее пространство",
    "nav.team": "Команда",
    "nav.dashboard": "Дашборд",
    "nav.newSearch": "Новый поиск",
    "nav.sessions": "Сессии",
    "nav.leads": "Все лиды",
    "nav.teamPage": "Команда",
    "nav.profile": "Мой профиль",
    "nav.settings": "Настройки",

    // Landing
    "landing.nav.openWorkspace": "Открыть рабочую зону",
    "landing.nav.runSearch": "Запустить поиск",
    "landing.hero.eyebrow": "B2B-интеллект по лидам — готово за 90 секунд",
    "landing.hero.titlePre": "Первые",
    "landing.hero.titleAccent": "50 компаний,",
    "landing.hero.titlePost1": "которые действительно",
    "landing.hero.titlePost2": "подходят вам.",
    "landing.hero.subtitle":
      "Опишите кого вы продаёте. Мы достаём каждое совпадение из Google Places, проходимся по их сайтам и отзывам, и возвращаем список, размеченный AI, с персональной подачей для каждого.",
    "landing.hero.nichePh": "кровельные компании",
    "landing.hero.regionPh": "Нью-Йорк",
    "landing.hero.runSearch": "Запустить поиск",
    "landing.hero.hint": "Попробуйте со своей нишей — покажем что нашли бы",
    "landing.stats.time": "Среднее время",
    "landing.stats.perQuery": "Лидов за запрос",
    "landing.stats.accuracy": "Точность контактов",
    "landing.stats.speed": "Быстрее ручного поиска",
    "landing.how.eyebrow": "Как это работает",
    "landing.how.title1": "От ниши до",
    "landing.how.titleItalic": "готового к холодному касанию",
    "landing.how.title2": "списка — без рутины.",
    "landing.how.01.title": "Опишите цель",
    "landing.how.01.body":
      "Введите нишу и регион. Всё — никакого матричного фильтра, никаких форм. Ассистент поможет сузить охват если нужно.",
    "landing.how.02.title": "Ищем, обогащаем, оцениваем",
    "landing.how.02.body":
      "Забираем совпадения из Google Places, заходим на каждый сайт, собираем соцсети и отзывы, прогоняем лидов через Claude для персональной оценки.",
    "landing.how.03.title": "Ведём в CRM",
    "landing.how.03.body":
      "Каждый лид получает AI-пчикап под ваше предложение. Ставьте статусы, заметки, передавайте команде, выгружайте в Excel.",
    "landing.cta.title1": "Хватит искать лидов вручную.",
    "landing.cta.title2": "Начните закрывать сделки.",
    "landing.cta.primary": "Запустить первый поиск",
    "landing.cta.secondary": "Посмотреть прототип",
    "landing.footer.built": "© 2026 Leadgen. Для агентств.",
    "landing.footer.privacy": "Приватность",
    "landing.footer.terms": "Условия",
    "landing.footer.contact": "Контакты",

    // Preview (fake browser chrome on landing)
    "preview.session": "Сессия",
    "preview.analyzed": "{n} лидов проанализировано",
    "preview.hot": "Горячие",
    "preview.warm": "Тёплые",
    "preview.cold": "Холодные",

    // Auth (stubs)
    "auth.login.title": "С возвращением.",
    "auth.login.subtitle":
      "Регистрация и вход добавятся вместе с обычным логином. Пока демо — заходите сразу.",
    "auth.login.enter": "Войти в рабочее пространство",
    "auth.login.back": "На главную",
    "auth.login.demoNote":
      "Заметка: публичная демо-версия работает без аккаунтов. Telegram-вход и email-ссылки добавим ближе к релизу.",
    "auth.register.title": "Присоединяйтесь к команде.",
    "auth.register.subtitle":
      "Регистрация откроется когда будет готов логин. Демо-воркспейс открыт по ссылке.",
    "auth.register.enter": "Открыть демо",
    "auth.inside.eyebrow": "Внутри",
    "auth.inside.body":
      "50 лидов с AI-оценкой в каждом поиске. Персонализировано под то, что продаёте именно вы.",
    "auth.inside.tags": "Google Places · Claude Haiku · Живое обогащение",

    // Dashboard
    "dashboard.topbar.greetingMorning": "Доброе утро",
    "dashboard.topbar.greetingAfternoon": "Добрый день",
    "dashboard.topbar.subtitle": "Что происходит в вашей рабочей зоне.",
    "dashboard.stats.sessions": "Сессий запущено",
    "dashboard.stats.sessionsSub": "{n} сейчас активно",
    "dashboard.stats.leads": "Лидов проанализировано",
    "dashboard.stats.leadsSub": "во всех сессиях",
    "dashboard.stats.hot": "Горячих лидов",
    "dashboard.stats.hotSub": "готовы к контакту",
    "dashboard.stats.rest": "Тёплые + холодные",
    "dashboard.stats.restSub": "стоят второго прохода",
    "dashboard.recent.eyebrow": "Недавние сессии",
    "dashboard.recent.title": "Ваши поиски",
    "dashboard.empty.title": "Поисков пока нет",
    "dashboard.empty.body": "Запустите первый поиск из сайдбара — занимает около 90 секунд.",
    "dashboard.quick.eyebrow": "Начать сейчас",
    "dashboard.quick.title": "Быстрые действия",
    "dashboard.quick.launch.title": "Запустить новый поиск",
    "dashboard.quick.launch.body":
      "Опишите целевую нишу и регион. Lumen возьмёт остальное на себя.",
    "dashboard.quick.leads.title": "Открыть базу лидов",
    "dashboard.quick.leads.body":
      "Ищите, фильтруйте и ведите каждого собранного лида.",
    "dashboard.hot.eyebrow": "Горячие за неделю",
    "dashboard.hot.title": "Лиды с лучшим скором",

    // Session row
    "session.row.running": "Выполняется — {status}",
    "session.row.failed": "Ошибка — {err}",
    "session.row.summary": "{n} лидов · {hot} горячих",
    "session.row.hot": "горячих",
    "session.row.rest": "остальных",
  },
  en: {
    "common.newSearch": "New search",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.saving": "Saving…",
    "common.viewAll": "View all →",
    "common.openCrm": "Open CRM →",
    "common.back": "Back",
    "common.signIn": "Sign in",
    "common.loading": "Loading…",
    "common.retry": "Retry",
    "common.none": "—",
    "common.export": "Export",
    "common.excel": "Excel",
    "common.edit": "Edit",
    "common.invite": "Invite",

    "lang.switch": "Language",

    "nav.workspace": "Workspace",
    "nav.team": "Team",
    "nav.dashboard": "Dashboard",
    "nav.newSearch": "New search",
    "nav.sessions": "Sessions",
    "nav.leads": "All leads",
    "nav.teamPage": "Team",
    "nav.profile": "My profile",
    "nav.settings": "Settings",

    "landing.nav.openWorkspace": "Open workspace",
    "landing.nav.runSearch": "Run a search",
    "landing.hero.eyebrow": "B2B lead intelligence — live in 90 seconds",
    "landing.hero.titlePre": "The first",
    "landing.hero.titleAccent": "50 prospects",
    "landing.hero.titlePost1": "that actually",
    "landing.hero.titlePost2": "fit your service.",
    "landing.hero.subtitle":
      "Describe who you're selling to. We pull every match from Google Places, scan their sites and reviews, and hand you an AI-scored list with a custom pitch for each one.",
    "landing.hero.nichePh": "roofing companies",
    "landing.hero.regionPh": "New York",
    "landing.hero.runSearch": "Run search",
    "landing.hero.hint": "Try it with your own niche — we'll show you what we'd find",
    "landing.stats.time": "Avg. search time",
    "landing.stats.perQuery": "Leads per query",
    "landing.stats.accuracy": "Contact-info accuracy",
    "landing.stats.speed": "Faster than manual",
    "landing.how.eyebrow": "How it works",
    "landing.how.title1": "From niche to",
    "landing.how.titleItalic": "outreach-ready",
    "landing.how.title2": "list, without the grunt work.",
    "landing.how.01.title": "Describe your target",
    "landing.how.01.body":
      "Type a niche and a region. That's it — no filter matrix, no form fatigue. Our assistant can help you narrow it too.",
    "landing.how.02.title": "We search, enrich, score",
    "landing.how.02.body":
      "We pull matches from Google Places, visit every site, grab socials and reviews, and pass each lead through Claude for a personalized score.",
    "landing.how.03.title": "Work them in your CRM",
    "landing.how.03.body":
      "Every lead gets an AI-written pitch tailored to your offer. Mark status, add notes, hand off to your team, export to Excel.",
    "landing.cta.title1": "Stop prospecting.",
    "landing.cta.title2": "Start closing.",
    "landing.cta.primary": "Run your first search",
    "landing.cta.secondary": "Explore the prototype",
    "landing.footer.built": "© 2026 Leadgen. Built for agencies.",
    "landing.footer.privacy": "Privacy",
    "landing.footer.terms": "Terms",
    "landing.footer.contact": "Contact",

    "preview.session": "Session",
    "preview.analyzed": "{n} leads analyzed",
    "preview.hot": "Hot",
    "preview.warm": "Warm",
    "preview.cold": "Cold",

    "auth.login.title": "Welcome back.",
    "auth.login.subtitle":
      "Sign-in is coming with the next milestone. For the demo, jump straight in.",
    "auth.login.enter": "Enter the workspace",
    "auth.login.back": "Back to home",
    "auth.login.demoNote":
      "Note: the public demo runs without accounts. Telegram login + email magic-link ship before launch.",
    "auth.register.title": "Join your team.",
    "auth.register.subtitle":
      "Account signup unlocks when auth ships. The demo workspace is open to anyone with the link.",
    "auth.register.enter": "Open the demo workspace",
    "auth.inside.eyebrow": "Inside",
    "auth.inside.body":
      "50 AI-scored prospects. Every search. Personalized to what you sell.",
    "auth.inside.tags": "Google Places · Claude Haiku · Live enrichment",

    "dashboard.topbar.greetingMorning": "Good morning",
    "dashboard.topbar.greetingAfternoon": "Good afternoon",
    "dashboard.topbar.subtitle": "Here's what's happening in your workspace.",
    "dashboard.stats.sessions": "Sessions run",
    "dashboard.stats.sessionsSub": "{n} active now",
    "dashboard.stats.leads": "Leads analyzed",
    "dashboard.stats.leadsSub": "across all sessions",
    "dashboard.stats.hot": "Hot leads",
    "dashboard.stats.hotSub": "ready for outreach",
    "dashboard.stats.rest": "Warm + cold",
    "dashboard.stats.restSub": "worth a second pass",
    "dashboard.recent.eyebrow": "Recent sessions",
    "dashboard.recent.title": "Your searches",
    "dashboard.empty.title": "No searches yet",
    "dashboard.empty.body":
      "Launch your first search from the sidebar — it takes about 90 seconds.",
    "dashboard.quick.eyebrow": "Start now",
    "dashboard.quick.title": "Quick actions",
    "dashboard.quick.launch.title": "Launch a new search",
    "dashboard.quick.launch.body":
      "Describe your target niche and region. Lumen will handle the rest.",
    "dashboard.quick.leads.title": "Open the lead base",
    "dashboard.quick.leads.body":
      "Search, filter and organize every lead you've collected.",
    "dashboard.hot.eyebrow": "Hot this week",
    "dashboard.hot.title": "Top-scoring leads",

    "session.row.running": "Running — {status}",
    "session.row.failed": "Failed — {err}",
    "session.row.summary": "{n} leads · {hot} hot",
    "session.row.hot": "hot",
    "session.row.rest": "rest",
  },
} as const;

export type TranslationKey = keyof (typeof TRANSLATIONS)["ru"];

type Ctx = {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("ru");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ru") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore quota / disabled storage
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = TRANSLATIONS[lang] as Record<string, string>;
      const raw = dict[key] ?? TRANSLATIONS.en[key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, k) =>
        k in vars ? String(vars[k]) : `{${k}}`,
      );
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return ctx;
}
