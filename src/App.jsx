import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  Menu, X, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  ArrowLeft, Folder, Image as ImageIcon, ZoomIn, 
  ExternalLink, ChevronLeft as ChevronLeftIcon, Search, ChevronDown, ChevronUp 
} from 'lucide-react';
import './App.css';

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
  infoImage: "https://scontent-iev1-1.xx.fbcdn.net/v/t39.30808-6/474156837_1026994389187845_7722730926577361377_n.jpg"
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

  const [albumsList, setAlbumsList] = useState(DEFAULT_PHOTO_ALBUMS);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
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
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const loadedSchedule = scheduleSnap.docs.map(doc => {
          const data = doc.data();
          const itemDate = new Date(data.year, data.month - 1, data.day);
          return { id: doc.id, ...data, dateObj: itemDate };
        });

        const activeSchedule = loadedSchedule.filter(item => {
          if (item.isWeekly) return true;
          return item.dateObj >= now;
        });

        activeSchedule.sort((a, b) => a.dateObj - b.dateObj);
        setSchedule(activeSchedule);
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
    const swipeThreshold = 50;
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
    else if (type === 'album') { setSelectedAlbum(item); setPageView('single-album'); }
    else if (type === 'all-news') { setPageView('all-news'); }
    else if (type === 'all-albums') { setPageView('all-albums'); }
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
              {[{ id: 'home', label: 'Головна' }, { id: 'info', label: 'Інформація' }, { id: 'gallery', label: 'Фототека' }, { id: 'news', label: 'Новини' }, { id: 'contacts', label: 'Контакти' }].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${pageView === 'main' && activeSection === item.id ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'}`}>
                  {item.label}
                </button>
              ))}
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
            {[{ id: 'home', label: 'Головна' }, { id: 'info', label: 'Інформація' }, { id: 'gallery', label: 'Фототека' }, { id: 'news', label: 'Новини' }, { id: 'contacts', label: 'Контакти' }].map((item) => (
              <button key={item.id} onClick={() => { setIsMobileMenuOpen(false); scrollToSection(item.id); }} className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm">
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-grow">
        {pageView === 'main' && (
          <>
            {/* Hero Section */}
            <section id="home" className="relative bg-slate-950 text-white py-24 sm:py-48 lg:py-72 overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('https://scontent-iev1-1.xx.fbcdn.net/v/t1.6435-9/140737096_164988195388473_5077406916130826611_n.jpg?stp=dst-jpg_tt6&cstp=mx1167x1762&ctp=s1167x1762&_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=P8KxkbZXSNcQ7kNvwECoCSw&_nc_oc=AdpS9415cf9TFX-I9eCkstCz5zhCPvkGT48xXY42N32hbylXHfDYHo8OnzPZK2sfqpA&_nc_zt=23&_nc_ht=scontent-iev1-1.xx&_nc_gid=rPjI2IMKFiO9bzBZJHgSsA&_nc_ss=7b289&oh=00_AQN_fA27jemzdMqsl2y4zK423RoC0nHikjLJR763vCVZ4g&oe=6AF710C2')` }}></div>
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
                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-amber-100 bg-stone-100">
                    <img src={churchData.infoImage} alt="Храм" className="w-full h-56 sm:h-80 object-contain" />
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
                ) : schedule.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {schedule.slice(0, 6).map((item) => (
                      <div key={item.id} className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2">
                        <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                          <span className="font-bold text-amber-900 text-xs sm:text-sm">{item.dayOfWeek} ({item.day}.{item.month})</span>
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
                  <div className="text-center py-6 text-xs sm:text-sm text-stone-500">Наразі немає активних розкладів.</div>
                )}
              </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-10 sm:py-20 bg-stone-100/80 border-y border-stone-200">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Фототека</h2>
                  <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {albumsList.slice(0, 4).map((album) => (
                    <div key={album.id} onClick={() => openItemView('album', album)} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col group">
                      <div className="h-48 sm:h-56 relative overflow-hidden bg-stone-100 flex items-center justify-center p-1">
                        <img src={album.cover} alt={album.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                        <div className="absolute top-2 right-2 bg-slate-950/75 text-amber-200 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3" /><span>{album.photos?.length || 0}</span>
                        </div>
                      </div>
                      <div className="p-3.5 sm:p-5 flex-grow flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase">{album.date}</span>
                          <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-base group-hover:text-amber-800 transition line-clamp-1">{album.title}</h3>
                        </div>
                        <div className="pt-2 border-t border-stone-100 text-xs font-bold text-amber-800 flex items-center justify-between">
                          <span>Переглянути</span><ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {albumsList.length > 4 && (
                  <div className="text-center pt-2">
                    <button onClick={() => openItemView('all-albums')} className="bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-amber-300 shadow-sm transition cursor-pointer">
                      Показати більше альбомів ({albumsList.length - 4})
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
                    <div className="h-52 sm:h-60 relative bg-stone-100 flex items-center justify-center p-1">
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-amber-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow">{item.category || 'Новина'}</span>
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

            {/* Contacts */}
            <section id="contacts" className="py-10 sm:py-20 bg-[#FAF9F6] border-t border-amber-200">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Контакти</span>
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Як нас знайти</h2>
                  <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 bg-white p-5 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-4">
                    <h3 className="text-base sm:text-xl font-serif font-bold text-amber-800">Контактна інформація</h3>
                    <div className="space-y-3 text-xs sm:text-sm text-stone-700">
                      <div className="flex items-start space-x-3"><MapPin className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Адреса</span><span>{churchData.address}</span></div></div>
                      <div className="flex items-start space-x-3"><Phone className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Телефон</span><a href={`tel:${churchData.phone}`} className="hover:underline">{churchData.phone}</a></div></div>
                      <div className="flex items-start space-x-3"><Mail className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Електронна пошта</span><a href={`mailto:${churchData.email}`} className="hover:underline">{churchData.email}</a></div></div>
                      <div className="flex items-start space-x-3"><Clock className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" /><div><span className="font-bold text-amber-900 block">Години роботи</span><span>{churchData.workingHours}</span></div></div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-amber-200 shadow-sm h-56 sm:h-80 flex flex-col justify-center items-center text-center p-4">
                    <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-amber-800 mb-2 animate-bounce" />
                    <h4 className="font-serif font-bold text-sm sm:text-lg text-slate-900">{churchData.title}</h4>
                    <p className="text-[11px] sm:text-xs text-stone-600 max-w-sm mt-1">{churchData.address}</p>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(churchData.address)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-xs font-bold text-white bg-amber-700 px-4 py-2 rounded-xl hover:bg-amber-800 transition shadow">
                      Відкрити карту Google <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
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
              <div className="relative min-h-[220px] max-h-[450px] w-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center p-2">
                <img src={selectedNews.image} alt={selectedNews.title} className="max-h-[420px] w-auto max-w-full object-contain rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-stone-500">{selectedNews.date}</div>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{selectedNews.title}</h2>
              </div>
              <div className="text-stone-700 text-xs sm:text-base leading-relaxed whitespace-pre-line">{selectedNews.content}</div>
            </div>
          </section>
        )}

        {/* Підсторінка: Фотоальбом */}
        {pageView === 'single-album' && selectedAlbum && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 flex justify-between items-center">
              <div><h3 className="text-lg sm:text-2xl font-serif font-bold">{selectedAlbum.title}</h3><p className="text-xs text-stone-600">{selectedAlbum.subtitle}</p></div>
              <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">{selectedAlbum.date}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedAlbum.photos?.map((photo, index) => (
                <div key={photo.id || index} onClick={() => setLightboxIndex(index)} className="group relative h-44 sm:h-60 rounded-xl overflow-hidden shadow border bg-stone-100 p-1 flex items-center justify-center cursor-pointer">
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-contain group-hover:scale-105 transition" />
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
                  <div className="h-48 w-full bg-stone-100 rounded-lg mb-2 flex items-center justify-center p-1">
                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-serif font-bold text-sm">{item.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Підсторінка: Усі Альбоми */}
        {pageView === 'all-albums' && (
          <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
            <button onClick={backToMain} className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 cursor-pointer"><ArrowLeft className="w-4 h-4 mr-2" /> Назад до головної</button>
            <h2 className="text-2xl font-serif font-bold text-center">Усі Фотоальбоми</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {albumsList.map(album => (
                <div key={album.id} onClick={() => openItemView('album', album)} className="bg-white rounded-2xl overflow-hidden border shadow-sm p-3 cursor-pointer">
                  <div className="h-48 w-full bg-stone-100 rounded-lg mb-2 flex items-center justify-center p-1">
                    <img src={album.cover} alt="" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-serif font-bold text-sm">{album.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox (Повноекранний перегляд) */}
      {selectedAlbum && lightboxIndex !== null && selectedAlbum.photos && selectedAlbum.photos[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4 select-none overflow-hidden" 
          onClick={() => {
            if (!isZoomed) setLightboxIndex(null);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            
            {/* Кнопка закриття */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }} 
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full cursor-pointer z-30 backdrop-blur-md transition pointer-events-auto"
              aria-label="Закрити"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Кнопка "Назад" (ліворуч) */}
            {!isZoomed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const total = selectedAlbum.photos.length;
                  setLightboxIndex((prev) => (prev - 1 + total) % total);
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3.5 rounded-full backdrop-blur-md transition z-20 cursor-pointer pointer-events-auto"
                aria-label="Попереднє фото"
              >
                <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Зображення: заборонено будь-які перегортання від натискання на фото */}
            <div 
              className="w-full h-full flex items-center justify-center overflow-auto p-4 pointer-events-auto"
              style={{ touchAction: 'pinch-zoom' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedAlbum.photos[lightboxIndex].url} 
                alt={selectedAlbum.photos[lightboxIndex].title || "Фото"} 
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 sm:scale-250' : 'scale-100'}`} 
              />
            </div>

            {/* Кнопка "Вперед" (праворуч) */}
            {!isZoomed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const total = selectedAlbum.photos.length;
                  setLightboxIndex((prev) => (prev + 1) % total);
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3.5 rounded-full backdrop-blur-md transition z-20 cursor-pointer pointer-events-auto"
                aria-label="Наступне фото"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Підпис до фото */}
            {!isZoomed && selectedAlbum.photos[lightboxIndex].title && (
              <p className="absolute bottom-4 text-white/90 text-xs sm:text-sm text-center px-4 font-medium line-clamp-2 z-20 bg-black/40 py-2 rounded-xl backdrop-blur-sm max-w-xl pointer-events-auto">
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