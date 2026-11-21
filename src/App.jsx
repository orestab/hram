import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  Menu, X, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  ArrowLeft, Folder, Image as ImageIcon, ZoomIn, 
  ExternalLink, ChevronLeft as ChevronLeftIcon, ChevronDown, ChevronUp,
  BookOpen, Sparkles
} from 'lucide-react';
import './App.css';

const OrthodoxCrossIcon = ({ className = "w-4 h-4 flex-shrink-0" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="8.5" y1="5.5" x2="15.5" y2="5.5" />
    <line x1="5.5" y1="9.5" x2="18.5" y2="9.5" />
    <line x1="7.5" y1="17.5" x2="16.5" y2="15.5" />
  </svg>
);

// Автоматичний конвертер будь-яких посилань Google Drive у робочий потік для <img>
const getDirectImageUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('lh3.googleusercontent.com') || !trimmed.includes('drive.google.com')) {
    return trimmed;
  }
  const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=s1200`;
  }
  return trimmed;
};

const DEFAULT_CHURCH_DATA = {
  title: "Храм Святої Софії–Премудрості Божої",
  city: "м. Луцьк",
  address: "м. Луцьк, вул. Винниченка, 30а (при ВНУ ім. Лесі Українки)",
  phone: "+380 (50) 123-45-67",
  email: "sophiahram@gmail.com",
  rector: "Протоієрей Віктор Пушко",
  workingHours: "Щодня з 08:00 до 19:00",
  infoTitle: "Духовний осередок при університеті ім. Лесі Українки",
  infoContent: "Храм Святої Софії–Премудрості Божої розташований за адресою м. Луцьк, вул. Винниченка, 30а в місті Луцьк. Будівництво та історія храму тісно пов'язані з Волинським національним університетом імені Лесі Українки.",
  infoImage: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=1000"
};

const DEFAULT_PHOTO_ALBUMS = [
  {
    id: 'arch',
    title: "Храм та Святині",
    subtitle: "Архітектура університетського храму та внутрішнє оздоблення",
    cover: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800",
    date: "2026 рік",
    photos: [
      { id: 'a1', title: "Величний фасад Храму Софії", url: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a2', title: "Святий Вівтар та Іконостас", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" }
    ]
  }
];

(function (root) {
  const MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  const MNOM = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
  const WEEKDAYS = ["неділя", "понеділок", "вівторок", "середа", "четвер", "п’ятниця", "субота"];

  function parseRawData(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.startsWith("[")) {
        try { return JSON.parse(trimmed); } catch (e) { return []; }
      }
      if (typeof document !== "undefined") {
        const el = document.getElementById(trimmed.replace(/^#/, ""));
        if (el && el.textContent.trim().startsWith("[")) {
          try { return JSON.parse(el.textContent); } catch (e) { return []; }
        }
      }
    }
    return [];
  }

  function stripTags(html) {
    return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function createCalendar2027(rawData) {
    const entries = parseRawData(rawData);
    const byKey = new Map();
    for (const item of entries) {
      if (item && typeof item.m === "number" && typeof item.d === "number") {
        byKey.set(`${item.m}-${item.d}`, item);
      }
    }

    function getDay(m, d) {
      const item = byKey.get(`${m}-${d}`) || null;
      const dt = new Date(2027, m - 1, d);
      const valid = dt.getFullYear() === 2027 && dt.getMonth() === m - 1 && dt.getDate() === d;
      const paragraphs = item && Array.isArray(item.p) ? item.p : [];
      const plainText = paragraphs.map(p => stripTags(p.h)).join(" \n ");
      return {
        year: 2027,
        month: m,
        day: d,
        date: valid ? dt : null,
        monthNameGen: MONTHS[m - 1] || "",
        monthNameNom: MNOM[m - 1] || "",
        weekday: valid ? WEEKDAYS[dt.getDay()] : "",
        isRed: Boolean(item && item.x),
        paragraphs,
        plainText,
        raw: item
      };
    }

    function getMonth(m) {
      const daysInMonth = new Date(2027, m, 0).getDate();
      const res = [];
      for (let d = 1; d <= daysInMonth; d++) {
        res.push(getDay(m, d));
      }
      return res;
    }

    function search(query) {
      const q = String(query || "").trim().toLowerCase();
      if (!q) return [];
      return entries.filter(item => {
        const text = (item.p || []).map(p => stripTags(p.h)).join(" ").toLowerCase();
        return text.includes(q);
      }).map(item => getDay(item.m, item.d));
    }

    return { year: 2027, entries, getDay, getMonth, search };
  }

  const defaultDataEl = typeof document !== "undefined" ? document.getElementById("data") : null;
  const cal = createCalendar2027(defaultDataEl ? defaultDataEl.textContent : []);
  cal.create = createCalendar2027;
  root.ChurchCalendar2027 = cal;
})(typeof window !== "undefined" ? window : globalThis);

function getInitial2027Date() {
  const now = new Date();
  const yr = now.getFullYear();
  if (yr < 2027) {
    return { month: 1, day: 1 };
  }
  if (yr > 2027) {
    return { month: 12, day: 31 };
  }
  return { month: now.getMonth() + 1, day: now.getDate() };
}

function ChurchCalendar2027Widget({ url = '/calendar-2027.json' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialDate = React.useMemo(() => getInitial2027Date(), []);
  const cal = React.useMemo(() => window.ChurchCalendar2027.create(data), [data]);
  const [view, setView] = useState('day');
  const [month, setMonth] = useState(initialDate.month);
  const [day, setDay] = useState(initialDate.day);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((json) => {
        if (active && Array.isArray(json)) setData(json);
      })
      .catch(() => {
        if (active) setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [url]);

  const MONTHS_NOM = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-amber-200 text-center text-xs sm:text-sm text-stone-500">
        Завантаження церковного календаря на 2027 рік...
      </div>
    );
  }

  const shiftDay = (delta) => {
    const dt = new Date(2027, month - 1, day);
    dt.setDate(dt.getDate() + delta);
    if (dt.getFullYear() === 2027) {
      setMonth(dt.getMonth() + 1);
      setDay(dt.getDate());
    }
  };

  const dayInfo = cal.getDay(month, day);
  const monthDays = cal.getMonth(month);
  const searchResults = query.trim() ? cal.search(query) : [];

  return (
    <div id="calendar-2027" className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-md border border-amber-200 space-y-4 sm:space-y-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3 sm:pb-4">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm sm:text-xl font-serif font-bold text-slate-900 leading-snug">Церковний календар на 2027 рік</h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium">Свята, пости та читання по днях</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:flex rounded-xl bg-amber-50 p-1 border border-amber-200 w-full sm:w-auto flex-shrink-0">
          <button type="button" onClick={() => setView('day')} className={`px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${view === 'day' ? 'bg-amber-800 text-white' : 'text-amber-900 hover:bg-amber-100'}`}>День</button>
          <button type="button" onClick={() => setView('month')} className={`px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${view === 'month' ? 'bg-amber-800 text-white' : 'text-amber-900 hover:bg-amber-100'}`}>Місяць</button>
          <button type="button" onClick={() => setView('search')} className={`px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${view === 'search' ? 'bg-amber-800 text-white' : 'text-amber-900 hover:bg-amber-100'}`}>Пошук</button>
        </div>
      </div>

      {view === 'day' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              min="2027-01-01"
              max="2027-12-31"
              value={`2027-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                if (y === 2027) { setMonth(m); setDay(d); }
              }}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-amber-200 text-xs sm:text-sm bg-amber-50/40 min-w-0"
            />
            <div className="grid grid-cols-2 sm:flex gap-2 sm:ml-auto w-full sm:w-auto">
              <button type="button" onClick={() => shiftDay(-1)} className="px-2.5 sm:px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[11px] sm:text-xs font-bold text-amber-900 cursor-pointer text-center">← Попередній</button>
              <button type="button" onClick={() => shiftDay(1)} className="px-2.5 sm:px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[11px] sm:text-xs font-bold text-amber-900 cursor-pointer text-center">Наступний →</button>
            </div>
          </div>

          <div className="bg-[#FAF9F6] rounded-2xl p-3.5 sm:p-6 border border-amber-200/80 space-y-3">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap border-b border-amber-200/60 pb-2.5 sm:pb-3">
              <span className={`text-2xl sm:text-4xl font-serif font-bold ${dayInfo.isRed ? 'text-red-700' : 'text-amber-800'}`}>{dayInfo.day}</span>
              <span className="text-xs sm:text-base font-bold text-slate-900">{dayInfo.day} {dayInfo.monthNameGen} {dayInfo.year}</span>
              <span className="text-[11px] sm:text-xs text-stone-500">{dayInfo.weekday}</span>
            </div>
            {dayInfo.paragraphs.length > 0 ? (
              <div className="space-y-2 text-xs sm:text-sm text-stone-700 leading-relaxed break-words [&_s]:no-underline [&_s]:text-inherit">
                {dayInfo.paragraphs.map((p, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: p.h }} />
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-500">Запис за цей день ще не додано до календаря.</p>
            )}
          </div>
        </div>
      )}

      {view === 'month' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {MONTHS_NOM.map((mName, idx) => {
              const mNum = idx + 1;
              return (
                <button
                  key={mNum}
                  type="button"
                  onClick={() => { setMonth(mNum); setDay(1); }}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer truncate ${month === mNum ? 'bg-amber-800 text-white border-amber-800' : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'}`}
                >
                  {mName}
                </button>
              );
            })}
          </div>
          <div className="divide-y divide-stone-100 border border-amber-200/70 rounded-2xl bg-[#FAF9F6] px-2.5 sm:px-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {monthDays.map((dInfo) => {
              const firstLine = (dInfo.paragraphs[0]?.h || '—').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              return (
                <div
                  key={dInfo.day}
                  onClick={() => { setDay(dInfo.day); setView('day'); }}
                  className="py-2 sm:py-2.5 flex items-baseline gap-2 sm:gap-3 cursor-pointer hover:bg-amber-100/40 px-1 rounded transition min-w-0"
                >
                  <strong className={`w-6 sm:w-7 text-right text-xs sm:text-sm flex-shrink-0 ${dInfo.isRed ? 'text-red-700' : 'text-amber-800'}`}>{dInfo.day}</strong>
                  <span className="flex-1 text-xs sm:text-sm text-slate-800 line-clamp-1 min-w-0">{firstLine}</span>
                  <small className="text-[10px] sm:text-xs text-stone-500 flex-shrink-0">{dInfo.weekday}</small>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'search' && (
        <div className="space-y-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук свят, постів, імен по 2027 року..."
            className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-amber-200 text-xs sm:text-sm bg-amber-50/30"
          />
          {query.trim() ? (
            searchResults.length > 0 ? (
              <div className="divide-y divide-stone-100 border border-amber-200/70 rounded-2xl bg-[#FAF9F6] px-2.5 sm:px-4 max-h-72 sm:max-h-80 overflow-y-auto">
                {searchResults.map((res) => (
                  <div
                    key={`${res.month}-${res.day}`}
                    onClick={() => { setMonth(res.month); setDay(res.day); setView('day'); }}
                    className="py-2 sm:py-2.5 flex items-baseline gap-2 sm:gap-3 cursor-pointer hover:bg-amber-100/40 px-1 rounded transition min-w-0"
                  >
                    <strong className={`text-xs sm:text-sm flex-shrink-0 ${res.isRed ? 'text-red-700' : 'text-amber-800'}`}>{res.day}.{String(res.month).padStart(2, '0')}</strong>
                    <span className="flex-1 text-xs sm:text-sm text-slate-800 line-clamp-2 min-w-0">{res.plainText}</span>
                    <small className="text-[10px] sm:text-xs text-stone-500 flex-shrink-0">{res.monthNameGen}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-500 py-4 text-center">Нічого не знайдено за запитом «{query}».</p>
            )
          ) : (
            <p className="text-xs text-stone-500">Введіть ключове слово для пошуку по календарі 2027 року.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [pageView, setPageView] = useState('main');
  const [scrollPosition, setScrollPosition] = useState(0);

  const [churchData, setChurchData] = useState(null);
  const [loadingChurch, setLoadingChurch] = useState(true);

  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [announcementsList, setAnnouncementsList] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const [albumsList, setAlbumsList] = useState(DEFAULT_PHOTO_ALBUMS);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const [booksList, setBooksList] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [sacramentsList, setSacramentsList] = useState([]);
  const [loadingSacraments, setLoadingSacraments] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const [expandedWeeks, setExpandedWeeks] = useState({ 0: true, 1: false, 2: false, 3: false });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    setIsZoomed(false);
  }, [lightboxIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const infoSnap = await getDoc(doc(db, "settings", "churchInfo"));
        if (infoSnap.exists()) {
          setChurchData(infoSnap.data());
        } else {
          setChurchData(DEFAULT_CHURCH_DATA);
        }
      } catch (error) {
        console.error("Помилка завантаження інформації:", error);
        setChurchData(DEFAULT_CHURCH_DATA);
      } finally {
        setLoadingChurch(false);
      }

      try {
        const scheduleSnap = await getDocs(collection(db, "schedule"));
        const loadedSchedule = scheduleSnap.docs.map(doc => {
          const data = doc.data();
          const itemDate = (data.year && data.month && data.day) 
            ? new Date(data.year, data.month - 1, data.day) 
            : new Date();
          return { id: doc.id, ...data, dateObj: itemDate };
        });

        setSchedule(loadedSchedule);
      } catch (error) {
        console.error("Помилка розкладу:", error);
      } finally {
        setLoadingSchedule(false);
      }

      try {
        const newsSnap = await getDocs(collection(db, "news"));
        const loadedNews = newsSnap.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0) };
        });
        loadedNews.sort((a, b) => b.createdAt - a.createdAt);
        setNewsList(loadedNews);
      } catch (error) { 
        console.error("Помилка новин:", error); 
      } finally { 
        setLoadingNews(false); 
      }

      try {
        const annSnap = await getDocs(collection(db, "announcements"));
        const loadedAnn = annSnap.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0) };
        });
        loadedAnn.sort((a, b) => b.createdAt - a.createdAt);
        setAnnouncementsList(loadedAnn);
      } catch (error) { 
        console.error("Помилка оголошень:", error); 
      } finally { 
        setLoadingAnnouncements(false); 
      }

      try {
        const albumsSnap = await getDocs(collection(db, "photoAlbums"));
        if (!albumsSnap.empty) {
          const loadedAlbums = albumsSnap.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0) };
          });
          loadedAlbums.sort((a, b) => b.createdAt - a.createdAt);
          setAlbumsList(loadedAlbums);
        }
      } catch (error) { 
        console.error("Помилка альбомів:", error); 
      } finally { 
        setLoadingAlbums(false); 
      }

      try {
        const booksSnap = await getDocs(collection(db, "libraryBooks"));
        const flatBooks = [];
        booksSnap.docs.forEach(docItem => {
          const data = docItem.data();
          if (Array.isArray(data.books) && data.books.length > 0) {
            data.books.forEach((bk, idx) => {
              flatBooks.push({
                id: `${docItem.id}-${bk.id || idx}`,
                title: bk.title || data.title || 'Книга',
                author: bk.author || '',
                coverUrl: bk.coverUrl || data.cover || '',
                fileUrl: bk.fileUrl || '',
                description: bk.description || '',
                date: data.date || ''
              });
            });
          } else {
            flatBooks.push({
              id: docItem.id,
              title: data.title || 'Книга',
              author: data.author || '',
              coverUrl: data.cover || data.coverUrl || '',
              fileUrl: data.fileUrl || '',
              description: data.description || '',
              date: data.date || ''
            });
          }
        });
        setBooksList(flatBooks);
      } catch (error) {
        console.error("Помилка бібліотеки:", error);
      } finally {
        setLoadingBooks(false);
      }

      try {
        const sacSnap = await getDocs(collection(db, "sacramentsPrep"));
        const loadedSac = sacSnap.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setSacramentsList(loadedSac);
      } catch (error) {
        console.error("Помилка підготовки до таїнств:", error);
      } finally {
        setLoadingSacraments(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null || !selectedAlbum?.photos) return;
      const total = selectedAlbum.photos.length;
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % total);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, selectedAlbum]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isZoomed) return;
    if (!selectedAlbum?.photos) return;
    const swipeThreshold = 140;
    const diff = touchStartX.current - touchEndX.current;
    const total = selectedAlbum.photos.length;

    if (diff > swipeThreshold) {
      setLightboxIndex((prev) => (prev + 1) % total);
    } else if (diff < -swipeThreshold) {
      setLightboxIndex((prev) => (prev - 1 + total) % total);
    }
  };

  const openItemView = (type, item) => {
    setScrollPosition(window.scrollY);
    if (type === 'news') { setSelectedNews(item); setPageView('single-news'); }
    else if (type === 'announcement') { setSelectedAnnouncement(item); setPageView('single-announcement'); }
    else if (type === 'album') { setSelectedAlbum(item); setPageView('single-album'); }
    else if (type === 'book') { setSelectedBook(item); setPageView('single-book'); }
    else if (type === 'sacrament') { setSelectedSacrament(item); setPageView('single-sacrament'); }
    else if (type === 'all-news') { setPageView('all-news'); }
    else if (type === 'all-announcements') { setPageView('all-announcements'); }
    else if (type === 'all-albums') { setPageView('all-albums'); }
    else if (type === 'all-books') { setPageView('all-books'); }
    else if (type === 'all-sacraments') { setPageView('all-sacraments'); }
    else if (type === 'all-schedule') { setPageView('all-schedule'); }
    window.scrollTo(0, 0);
  };

  const backToMain = () => {
    setPageView('main');
    setTimeout(() => { window.scrollTo({ top: scrollPosition, behavior: 'instant' }); }, 10);
  };

  const scrollToSection = (id) => {
    if (pageView !== 'main') {
      setPageView('main');
      setTimeout(() => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setActiveSection(id);
      setIsMobileMenuOpen(false);
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleWeek = (weekIdx) => {
    setExpandedWeeks(prev => ({ ...prev, [weekIdx]: !prev[weekIdx] }));
  };

  const build4WeeksSchedule = () => {
    const dayNames = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"];
    const dayIndexMap = { "Понеділок": 1, "Вівторок": 2, "Середа": 3, "Четвер": 4, "П'ятниця": 5, "Субота": 6, "Неділя": 0 };
    
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayOfWeek = today.getDay(); 
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + distanceToMonday);

    for (let w = 0; w < 4; w++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(currentMonday.getDate() + w * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      let weekTag = w === 0 ? "Поточний тиждень" : `Тиждень ${w + 1}`;
      const weekLabel = `${weekTag}: ${weekStart.getDate()}.${weekStart.getMonth() + 1} — ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.${weekEnd.getFullYear()}`;

      const days = dayNames.map((dName, dayOffset) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayOffset);
        dayDate.setHours(0, 0, 0, 0);

        const dayNum = dayDate.getDate();
        const monthNum = dayDate.getMonth() + 1;
        const yearNum = dayDate.getFullYear();
        const dayOfWeekNum = dayDate.getDay();

        const isPast = dayDate < today;

        const services = schedule.filter(item => {
          if (item.isWeekly) {
            return dayIndexMap[item.dayOfWeek] === dayOfWeekNum;
          }
          return item.day === dayNum && item.month === monthNum && item.year === yearNum;
        });

        return {
          dayName: dName,
          dateStr: `${dayNum < 10 ? '0' + dayNum : dayNum}.${monthNum < 10 ? '0' + monthNum : monthNum}`,
          isPast,
          services
        };
      });

      weeks.push({ label: weekLabel, days, isCurrent: w === 0 });
    }

    return weeks;
  };

  if (loadingChurch || !churchData) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-amber-900 font-serif font-semibold text-sm tracking-wide">Завантаження даних храму...</p>
      </div>
    );
  }

  const schedule4Weeks = build4WeeksSchedule();

  const mainPageUpcomingServices = [];
  schedule4Weeks.forEach(week => {
    week.days.forEach(day => {
      if (!day.isPast && day.services.length > 0) {
        day.services.forEach(srv => {
          mainPageUpcomingServices.push({
            ...srv,
            dayOfWeek: day.dayName,
            dateStr: day.dateStr
          });
        });
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans flex flex-col selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden pt-16 sm:pt-20">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => scrollToSection('home')}>
              <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Emblem_of_the_Orthodox_Church_of_Ukraine.svg/250px-Emblem_of_the_Orthodox_Church_of_Ukraine.svg.png" alt="Emblem" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
              <div>
                <h1 className="text-xs sm:text-lg font-serif font-bold text-slate-900 leading-tight">{churchData.title}</h1>
                <p className="text-[9px] sm:text-xs text-amber-800 font-semibold uppercase tracking-wide">{churchData.city}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1 font-medium text-sm">
              <button onClick={() => scrollToSection('home')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'main' && activeSection === 'home' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Головна</button>
              <button onClick={() => scrollToSection('info')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'main' && activeSection === 'info' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Інформація</button>
              <button onClick={() => scrollToSection('contacts')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'main' && activeSection === 'contacts' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Контакти</button>
              <button onClick={() => scrollToSection('calendar-2027')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'main' && activeSection === 'calendar-2027' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Календар</button>
              <button onClick={() => openItemView('all-albums')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'all-albums' || pageView === 'single-album' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Фототека</button>
              <button onClick={() => scrollToSection('news')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'main' && activeSection === 'news' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Новини</button>
              <button onClick={() => openItemView('all-books')} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'all-books' || pageView === 'single-book' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>Бібліотека</button>
            </nav>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-700 hover:bg-stone-100 rounded-lg focus:outline-none cursor-pointer" aria-label="Меню">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 px-4 py-3 space-y-1 shadow-lg">
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('home'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Головна</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('info'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Інформація</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('contacts'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Контакти</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('calendar-2027'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Календар</button>
            <button onClick={() => { setIsMobileMenuOpen(false); openItemView('all-albums'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Фототека</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('news'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Новини</button>
            <button onClick={() => { setIsMobileMenuOpen(false); openItemView('all-books'); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">Бібліотека</button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {pageView === 'main' && (
          <>
            {/* Hero Section */}
            <section id="home" className="relative bg-slate-950 text-white py-24 sm:py-48 lg:py-72 overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('https://scontent-iev1-1.xx.fbcdn.net/v/t1.6435-9/140737096_164988195388473_5077406916130826611_n.jpg?stp=dst-jpg_tt6&cstp=mx1167x1762&ctp=s1167x1762&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=wFp6MbvykhwQ7kNvwE2RVYa&_nc_oc=AdoG9bd9HJdqIWHMDpKREAImzl3ZGN9n7XBeBK9orsQwLKL7bmMrTkRtJY9H8iHQAyk&_nc_zt=23&_nc_ht=scontent-iev1-1.xx&_nc_gid=7xSYd9brCcJivMgzZcUUUQ&_nc_ss=7b2a8&oh=00_AQQMyv4FqW2rINNuEgLnc5dSc8cnISNvH6su_mPYl1UK8w&oe=6B2686C2')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="relative max-w-5xl mx-auto px-4 text-center space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-5xl lg:text-6xl font-serif font-bold text-amber-100 leading-tight">{churchData.title}</h1>
                <p className="text-xs sm:text-xl text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-2">{churchData.infoTitle}</p>
                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
                  <button onClick={() => scrollToSection('info')} className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-base">
                    <span>Дізнатися більше</span><ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollToSection('contacts')} className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md transition cursor-pointer text-xs sm:text-base">Контакти та адреса</button>
                </div>
              </div>
            </section>

            {/* Info Section */}
            <section id="info" className="py-10 sm:py-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-16">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Інформація про Храм</h2>
                <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                <div className="lg:col-span-7 space-y-4 text-stone-700 leading-relaxed text-xs sm:text-base whitespace-pre-line">
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-amber-800">{churchData.infoTitle}</h3>
                  <p>{churchData.infoContent}</p>
                  {churchData.rector && (
                    <p className="font-bold text-amber-900 pt-2">Настоятель: {churchData.rector}</p>
                  )}
                </div>
                <div className="lg:col-span-5">
                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-amber-100 bg-stone-100 flex items-center justify-center p-2">
                    <img 
                      src={getDirectImageUrl(churchData.infoImage)} 
                      alt="Храм" 
                      className="w-full h-56 sm:h-80 object-contain rounded-2xl" 
                    />
                  </div>
                </div>
              </div>

              {/* Contacts (перенесено перед розкладом, однакова висота коробок) */}
              <div id="contacts" className="space-y-6 pt-2">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Контакти</span>
                  <h3 className="text-xl sm:text-3xl font-serif font-bold text-slate-900">Як нас знайти</h3>
                  <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 bg-white p-5 sm:p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between space-y-4 h-full">
                    <h4 className="text-base sm:text-xl font-serif font-bold text-amber-800">Контактна інформація</h4>
                    <div className="space-y-3 text-xs sm:text-sm text-stone-700 flex-grow">
                      <div className="flex items-start space-x-3"><MapPin className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Адреса</span><span>{churchData.address}</span></div></div>
                      <div className="flex items-start space-x-3"><Phone className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Телефон</span><a href={`tel:${churchData.phone}`} className="hover:underline">{churchData.phone}</a></div></div>
                      <div className="flex items-start space-x-3"><Mail className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Електронна пошта</span><a href={`mailto:${churchData.email}`} className="hover:underline">{churchData.email}</a></div></div>
                      <div className="flex items-start space-x-3"><Clock className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Години роботи</span><span>{churchData.workingHours}</span></div></div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-amber-200 shadow-sm h-64 sm:h-80 flex flex-col justify-center items-center text-center p-6">
                    <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-amber-800 mb-2 animate-bounce" />
                    <h4 className="font-serif font-bold text-sm sm:text-lg text-slate-900">{churchData.title}</h4>
                    <p className="text-[11px] sm:text-xs text-stone-600 max-w-sm mt-1">{churchData.address}</p>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(churchData.address)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-xs font-bold text-white bg-amber-700 px-4 py-2 rounded-xl hover:bg-amber-800 transition shadow">
                      Відкрити карту Google <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-md border border-amber-200 space-y-4">
                <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800 flex-shrink-0" />
                    <div>
                      <h3 className="text-base sm:text-xl font-serif font-bold text-slate-900">Розклад богослужінь</h3>
                      <p className="text-[10px] sm:text-xs text-stone-500 font-medium">Найближчі служби</p>
                    </div>
                  </div>
                  <button onClick={() => openItemView('all-schedule')} className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1">
                    <span>Більше (на 4 тижні)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loadingSchedule ? (
                  <div className="text-center py-6 text-xs sm:text-sm text-stone-500">Завантаження розкладу...</div>
                ) : mainPageUpcomingServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mainPageUpcomingServices.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2">
                        <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                          <span className="font-bold text-amber-900 text-xs sm:text-sm">{item.dayOfWeek} ({item.dateStr})</span>
                          <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                            <Clock className="w-3 h-3 mr-1 text-amber-800" />{item.time}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">{item.service}</h4>
                        {item.desc && <p className="text-[11px] sm:text-xs text-stone-600">{item.desc}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs sm:text-sm text-stone-500">Наразі немає активних розкладів на найближчі дні.</div>
                )}
              </div>

              <ChurchCalendar2027Widget url="/calendar-2027.json" />
            </section>

            {/* Оголошення та події */}
            <section className="py-10 sm:py-20 bg-stone-100/80 border-y border-stone-200">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Оголошення та події</h2>
                  <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
                </div>

                {loadingAnnouncements ? (
                  <div className="text-center py-6 text-sm text-stone-500">Завантаження оголошень...</div>
                ) : announcementsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {announcementsList.slice(0, 3).map((item) => (
                      <div key={item.id} onClick={() => openItemView('announcement', item)} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group">
                        {item.image && (
                          <div className="h-48 sm:h-56 relative bg-stone-100 flex items-center justify-center p-2">
                            <img src={getDirectImageUrl(item.image)} alt={item.title} className="w-full h-full object-contain rounded-xl" />
                          </div>
                        )}
                        <div className="p-3.5 sm:p-5 flex-grow flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] sm:text-xs text-stone-400 font-medium">{item.date}</span>
                            <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-base group-hover:text-amber-800 transition line-clamp-2 mt-1">{item.title}</h3>
                            <p className="text-[11px] sm:text-xs text-stone-600 line-clamp-3 mt-1.5">{item.summary}</p>
                          </div>
                          <div className="pt-2 text-xs font-bold text-amber-800 flex items-center"><span>Читати детальніше</span><ChevronRight className="w-3.5 h-3.5 ml-1" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs sm:text-sm text-stone-500">Наразі немає активних оголошень.</div>
                )}

                {announcementsList.length > 3 && (
                  <div className="text-center pt-2">
                    <button onClick={() => openItemView('all-announcements')} className="bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-amber-300 shadow-sm transition cursor-pointer">
                      Показати більше оголошень ({announcementsList.length - 3})
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* News Section */}
            <section id="news" className="py-10 sm:py-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Новини та Оголошення</h2>
                <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {newsList.slice(0, 3).map((item) => (
                  <div key={item.id} onClick={() => openItemView('news', item)} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group">
                    <div className="h-52 sm:h-60 relative bg-stone-100 flex items-center justify-center p-2">
                      {item.image && <img src={getDirectImageUrl(item.image)} alt={item.title} className="w-full h-full object-contain rounded-xl" />}
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-amber-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow z-10">{item.category || 'Новина'}</span>
                    </div>
                    <div className="p-3.5 sm:p-5 flex-grow flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[10px] sm:text-xs text-stone-400 font-medium">{item.date}</span>
                        <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-base group-hover:text-amber-800 transition line-clamp-2 mt-1">{item.title}</h3>
                        <p className="text-[11px] sm:text-xs text-stone-600 line-clamp-3 mt-1.5">{item.summary}</p>
                      </div>
                      <div className="pt-2 text-xs font-bold text-amber-800 flex items-center"><span>Читати повністю</span><ChevronRight className="w-3.5 h-3.5 ml-1" /></div>
                    </div>
                  </div>
                ))}
              </div>

              {newsList.length > 3 && (
                <div className="text-center pt-2">
                  <button onClick={() => openItemView('all-news')} className="bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-amber-300 shadow-sm transition cursor-pointer">
                    Показати більше новин ({newsList.length - 3})
                  </button>
                </div>
              )}
            </section>

            {/* Підготовка до таїнств */}
            <section id="sacraments" className="py-10 sm:py-20 bg-stone-100/80 border-t border-stone-200">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Підготовка до таїнств</h2>
                  <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
                </div>

                {loadingSacraments ? (
                  <div className="text-center py-6 text-xs sm:text-sm text-stone-500">Завантаження...</div>
                ) : sacramentsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {sacramentsList.map((item) => (
                      <div key={item.id} onClick={() => openItemView('sacrament', item)} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer p-4 sm:p-5 flex flex-col justify-between space-y-3 group">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2 text-amber-800">
                            <OrthodoxCrossIcon className="w-4 h-4 flex-shrink-0" />
                            {item.subtitle && <span className="text-[10px] sm:text-xs font-bold">{item.subtitle}</span>}
                          </div>
                          <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base group-hover:text-amber-800 transition">{item.title}</h3>
                          <p className="text-[11px] sm:text-xs text-stone-600 line-clamp-3">{item.content}</p>
                        </div>
                        <div className="pt-2 text-xs font-bold text-amber-800 flex items-center">
                          <span>Детальніше про підготовку</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs sm:text-sm text-stone-500">Блоки підготовки до таїнств ще не додано.</div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Підсторінка: Електронна бібліотека (як у фототеці) */}
        {pageView === 'all-books' && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-center">Електронна бібліотека</h2>
            {loadingBooks ? (
              <div className="text-center py-6 text-sm text-stone-500">Завантаження книжок...</div>
            ) : booksList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {booksList.map(book => (
                  <div key={book.id} onClick={() => openItemView('book', book)} className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition p-3 cursor-pointer flex flex-col justify-between space-y-2">
                    <div>
                      <div className="h-48 w-full bg-stone-100 rounded-lg mb-2 flex items-center justify-center p-2">
                        {book.coverUrl ? (
                          <img src={getDirectImageUrl(book.coverUrl)} alt={book.title} className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <BookOpen className="w-10 h-10 text-amber-800/50" />
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-sm text-slate-900">{book.title}</h3>
                      {book.author && <p className="text-xs text-stone-500 mt-0.5">{book.author}</p>}
                    </div>
                    <span className="text-xs font-bold text-amber-800 pt-1">Читати →</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-stone-500">Книжок поки немає.</div>
            )}
          </section>
        )}

        {/* Підсторінка: Обрана книжка */}
        {pageView === 'single-book' && selectedBook && (
          <section className="py-8 sm:py-16 max-w-4xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={() => setPageView('all-books')} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до електронної бібліотеки</button>
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 p-4 sm:p-8 space-y-4">
              {selectedBook.coverUrl && (
                <div className="relative min-h-[220px] max-h-[450px] w-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center p-2">
                  <img src={getDirectImageUrl(selectedBook.coverUrl)} alt={selectedBook.title} className="max-h-[420px] w-auto max-w-full object-contain rounded-xl" />
                </div>
              )}
              <div className="space-y-1">
                {selectedBook.author && <div className="text-xs font-bold text-amber-800">{selectedBook.author}</div>}
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{selectedBook.title}</h2>
              </div>
              {selectedBook.description && (
                <div className="text-stone-700 text-xs sm:text-base leading-relaxed whitespace-pre-line">{selectedBook.description}</div>
              )}
              {selectedBook.fileUrl && (
                <div className="pt-2">
                  <a href={getDirectImageUrl(selectedBook.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs sm:text-sm font-bold text-white bg-amber-700 px-5 py-2.5 rounded-xl hover:bg-amber-800 transition shadow">
                    Читати книжку <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Підсторінка: Підготовка до конкретного таїнства */}
        {pageView === 'single-sacrament' && selectedSacrament && (
          <section className="py-8 sm:py-16 max-w-4xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 p-4 sm:p-8 space-y-4">
              {selectedSacrament.image && (
                <div className="relative min-h-[220px] max-h-[450px] w-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center p-2">
                  <img src={getDirectImageUrl(selectedSacrament.image)} alt={selectedSacrament.title} className="max-h-[420px] w-auto max-w-full object-contain rounded-xl" />
                </div>
              )}
              <div className="space-y-1">
                {selectedSacrament.subtitle && <div className="text-xs font-bold text-amber-800">{selectedSacrament.subtitle}</div>}
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{selectedSacrament.title}</h2>
              </div>
              {selectedSacrament.requirements && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-stone-800">
                  <span className="font-bold text-amber-950">Підготовка та умови: </span>{selectedSacrament.requirements}
                </div>
              )}
              {selectedSacrament.scheduleNote && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-800">
                  <span className="font-bold text-slate-900">Коли звершується: </span>{selectedSacrament.scheduleNote}
                </div>
              )}
              <div className="text-stone-700 text-xs sm:text-base leading-relaxed whitespace-pre-line">{selectedSacrament.content}</div>
            </div>
          </section>
        )}

        {/* Підсторінка: Повний розклад на 4 тижні */}
        {pageView === 'all-schedule' && (
          <section className="py-8 sm:py-16 max-w-5xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100 transition">
              <ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної
            </button>

            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Розклад богослужінь на 4 тижні</h2>
              <p className="text-xs sm:text-sm text-stone-600">Кожного тижня розклад автоматично оновлюється та зсувається на наступні 4 тижні</p>
              <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4 pt-2">
              {schedule4Weeks.map((week, weekIdx) => {
                const isExpanded = !!expandedWeeks[weekIdx];
                return (
                  <div key={weekIdx} className="bg-white rounded-2xl sm:rounded-3xl border border-amber-200 shadow-sm overflow-hidden transition">
                    <button 
                      onClick={() => toggleWeek(weekIdx)}
                      className={`w-full p-4 sm:p-5 flex justify-between items-center text-left transition cursor-pointer ${
                        week.isCurrent ? 'bg-amber-100/90 hover:bg-amber-100' : 'bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-amber-800 flex-shrink-0" />
                        <span className="font-serif font-bold text-xs sm:text-base text-slate-900">{week.label}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                        <span className="hidden sm:inline">{isExpanded ? 'Згорнути' : 'Розгорнути'}</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-800" /> : <ChevronDown className="w-5 h-5 text-amber-800" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 sm:p-5 border-t border-amber-100 divide-y divide-stone-100 space-y-3 sm:space-y-0">
                        {week.days.map((dayItem, dayIdx) => (
                          <div key={dayIdx} className={`pt-3 first:pt-0 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 ${dayItem.isPast ? 'opacity-60' : ''}`}>
                            <div className="flex items-center space-x-2 sm:w-48 flex-shrink-0">
                              <span className="font-bold text-amber-800 text-xs sm:text-sm">{dayItem.dayName}</span>
                              <span className="text-[10px] sm:text-xs text-stone-500 font-medium">({dayItem.dateStr})</span>
                              {dayItem.isPast && <span className="text-[9px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">Минув</span>}
                            </div>

                            <div className="flex-grow">
                              {dayItem.services.length > 0 ? (
                                <div className="space-y-1.5">
                                  {dayItem.services.map((srv, sIdx) => (
                                    <div key={sIdx} className="bg-stone-50 p-2 sm:p-2.5 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                      <div>
                                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900">{srv.service}</h4>
                                        {srv.desc && <p className="text-[10px] sm:text-xs text-stone-600">{srv.desc}</p>}
                                      </div>
                                      <span className="inline-flex items-center self-start sm:self-center text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                                        <Clock className="w-3 h-3 mr-1 text-amber-800" />{srv.time}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] sm:text-xs text-stone-400 italic">Служби немає</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Підсторінка: Новина */}
        {pageView === 'single-news' && selectedNews && (
          <section className="py-8 sm:py-16 max-w-4xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 p-4 sm:p-8 space-y-4">
              {selectedNews.image && (
                <div className="relative min-h-[220px] max-h-[450px] w-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center p-2">
                  <img src={getDirectImageUrl(selectedNews.image)} alt={selectedNews.title} className="max-h-[420px] w-auto max-w-full object-contain rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <div className="text-xs text-stone-500">{selectedNews.date}</div>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{selectedNews.title}</h2>
              </div>
              <div className="text-stone-700 text-xs sm:text-base leading-relaxed whitespace-pre-line">{selectedNews.content}</div>
            </div>
          </section>
        )}

        {/* Підсторінка: Оголошення */}
        {pageView === 'single-announcement' && selectedAnnouncement && (
          <section className="py-8 sm:py-16 max-w-4xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 p-4 sm:p-8 space-y-4">
              {selectedAnnouncement.image && (
                <div className="relative min-h-[220px] max-h-[450px] w-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center p-2">
                  <img src={getDirectImageUrl(selectedAnnouncement.image)} alt={selectedAnnouncement.title} className="max-h-[420px] w-auto max-w-full object-contain rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <div className="text-xs text-stone-500">{selectedAnnouncement.date}</div>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{selectedAnnouncement.title}</h2>
              </div>
              <div className="text-stone-700 text-xs sm:text-base leading-relaxed whitespace-pre-line">{selectedAnnouncement.content}</div>
            </div>
          </section>
        )}

        {/* Підсторінка: Фотоальбом */}
        {pageView === 'single-album' && selectedAlbum && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={() => { setPageView('all-albums'); }} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до фототеки</button>
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 flex justify-between items-center">
              <div><h3 className="text-lg sm:text-2xl font-serif font-bold">{selectedAlbum.title}</h3><p className="text-xs text-stone-600">{selectedAlbum.subtitle}</p></div>
              <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">{selectedAlbum.date}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedAlbum.photos?.map((photo, index) => (
                <div key={photo.id || index} onClick={() => setLightboxIndex(index)} className="group relative h-44 sm:h-60 rounded-xl overflow-hidden shadow border bg-stone-100 p-2 flex items-center justify-center cursor-pointer">
                  <img src={getDirectImageUrl(photo.url)} alt={photo.title} className="w-full h-full object-contain group-hover:scale-105 transition" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Підсторінка: Усі Новини */}
        {pageView === 'all-news' && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <h2 className="text-2xl font-serif font-bold text-center">Усі Новини</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newsList.map(item => (
                <div key={item.id} onClick={() => openItemView('news', item)} className="bg-white rounded-2xl overflow-hidden border shadow-sm p-4 cursor-pointer">
                  {item.image && (
                    <div className="h-48 w-full bg-stone-100 rounded-lg mb-2 flex items-center justify-center p-2">
                      <img src={getDirectImageUrl(item.image)} alt="" className="w-full h-full object-contain rounded-lg" />
                    </div>
                  )}
                  <h3 className="font-serif font-bold text-sm">{item.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Підсторінка: Усі Оголошення */}
        {pageView === 'all-announcements' && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <h2 className="text-2xl font-serif font-bold text-center">Усі Оголошення та події</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcementsList.map(item => (
                <div key={item.id} onClick={() => openItemView('announcement', item)} className="bg-white rounded-2xl overflow-hidden border shadow-sm p-4 cursor-pointer">
                  {item.image && (
                    <div className="h-48 w-full bg-stone-100 rounded-lg mb-2 flex items-center justify-center p-2">
                      <img src={getDirectImageUrl(item.image)} alt="" className="w-full h-full object-contain rounded-lg" />
                    </div>
                  )}
                  <h3 className="font-serif font-bold text-sm">{item.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Підсторінка: Усі Альбоми (Фототека) */}
        {pageView === 'all-albums' && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <h2 className="text-2xl font-serif font-bold text-center">Фототека Храму</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {albumsList.map(album => (
                <div key={album.id} onClick={() => openItemView('album', album)} className="bg-white rounded-2xl overflow-hidden border shadow-sm p-3 cursor-pointer">
                  {album.cover && (
                    <div className="h-48 w-full bg-stone-100 rounded-lg mb-2 flex items-center justify-center p-2">
                      <img src={getDirectImageUrl(album.cover)} alt="" className="w-full h-full object-contain rounded-lg" />
                    </div>
                  )}
                  <h3 className="font-serif font-bold text-sm">{album.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox */}
      {selectedAlbum && lightboxIndex !== null && selectedAlbum.photos && selectedAlbum.photos[lightboxIndex] && (
        <div 
          className="fixed inset-0 w-screen h-[100dvh] z-[100] bg-black/95 flex items-center justify-center p-0 select-none overflow-hidden" 
          onClick={() => {
            if (!isZoomed) setLightboxIndex(null);
          }}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setLightboxIndex(null)} 
              className="fixed top-3 right-3 sm:top-5 sm:right-5 bg-white/15 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full cursor-pointer z-30 backdrop-blur-md transition"
              aria-label="Закрити"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {!isZoomed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const total = selectedAlbum.photos.length;
                  setLightboxIndex((prev) => (prev - 1 + total) % total);
                }}
                className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white p-2.5 sm:p-3.5 rounded-full backdrop-blur-md transition z-20 cursor-pointer"
                aria-label="Попереднє фото"
              >
                <ChevronLeftIcon className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
            )}

            <div 
              className="w-full h-full flex items-center justify-center overflow-auto p-2 sm:p-6"
              style={{ touchAction: 'pinch-zoom' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={getDirectImageUrl(selectedAlbum.photos[lightboxIndex].url)} 
                alt={selectedAlbum.photos[lightboxIndex].title || "Фото"} 
                onDoubleClick={() => setIsZoomed(!isZoomed)}
                className={`w-full h-full max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 sm:scale-250 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`} 
              />
            </div>

            {!isZoomed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const total = selectedAlbum.photos.length;
                  setLightboxIndex((prev) => (prev + 1) % total);
                }}
                className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white p-2.5 sm:p-3.5 rounded-full backdrop-blur-md transition z-20 cursor-pointer"
                aria-label="Наступне фото"
              >
                <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
            )}

            {!isZoomed && selectedAlbum.photos[lightboxIndex].title && (
              <p className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 text-white/90 text-[11px] sm:text-sm text-center px-3 sm:px-4 font-medium line-clamp-2 z-20 bg-black/55 py-1.5 sm:py-2 rounded-xl backdrop-blur-sm max-w-[92vw] sm:max-w-xl">
                {selectedAlbum.photos[lightboxIndex].title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#FAF9F6] border-t border-amber-200 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="font-serif text-xs sm:text-sm font-bold text-amber-800">{churchData.title} ({churchData.city})</p>
          <p className="text-amber-800 text-[11px] sm:text-xs font-medium">© {new Date().getFullYear()} Усі права захищені.</p>
        </div>
      </footer>

    </div>
  );
}