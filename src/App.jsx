import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Menu, X, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  ArrowLeft, Folder, Image as ImageIcon, ZoomIn, Sun, Sparkles, 
  User, ExternalLink, ChevronLeft as ChevronLeftIcon, Search 
} from 'lucide-react';
import './App.css';

const CHURCH_DATA = {
  title: "Храм Святої Софії–Премудрості Божої",
  city: "м. Луцьк",
  address: "м. Луцьк, вул. Винниченка, 30а (при ВНУ ім. Лесі Українки)",
  phone: "+380 (50) 123-45-67",
  email: "sophiahram@gmail.com",
  rector: "Протоієрей Віктор Пушко",
  workingHours: "Щодня з 08:00 до 19:00"
};

const CLERGY = [
  { name: "Протоієрей Віктор Пушко", role: "Настоятель Храму", desc: "Духовний наставник парафії, опікується університетською громадою та духовним життям вірян." },
  { name: "Митрополит Михаїл", role: "Керуючий єпархією (ПЦУ)", desc: "Митрополит Луцький і Волинський, очолює головні архієрейські богослужіння." }
];

const PHOTO_ALBUMS = [
  {
    id: 'arch',
    title: "Храм та Святині",
    subtitle: "Архітектура університетського храму та внутрішнє оздоблення",
    cover: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800",
    date: "2026 рік",
    photos: [
      { id: 'a1', title: "Величний фасад Храму Софії", url: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a2', title: "Святий Вівтар та Іконостас", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a3', title: "Куполи храму у сонячний день", url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a4', title: "Церковний простір та ікони", url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  {
    id: 'services',
    title: "Божественні Літургії",
    subtitle: "Молитовний та духовний уклад недільних і святкових служб",
    cover: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800",
    date: "Осінь 2026",
    photos: [
      { id: 's1', title: "Недільна Божественна Літургія", url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200" },
      { id: 's2', title: "Спільна молитва студентів і парафіян", url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1200" },
      { id: 's3', title: "Таїнство Святого Причастя", url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  {
    id: 'feasts',
    title: "Престольне Свято",
    subtitle: "Урочистості у Храмі Софії Премудрості Божої",
    cover: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=800",
    date: "Вересень 2026",
    photos: [
      { id: 'f1', title: "Архієрейське богослужіння", url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1200" },
      { id: 'f2', title: "Праздничний хресний хід довкола храму", url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=1200" },
      { id: 'f3', title: "Особлива флористика та прикрашення", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  {
    id: 'community',
    title: "Життя громади",
    subtitle: "Благодійні заходи, зустрічі та університетські події",
    cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200",
    date: "2026 рік",
    photos: [
      { id: 'c1', title: "Осіннє оформлення храмового простору", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" },
      { id: 'c2', title: "Молодіжна парафіяльна спільнота", url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200" }
    ]
  }
];

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [selectedNews, setSelectedNews] = useState(null);
  const [newsSearch, setNewsSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scheduleSnap = await getDocs(collection(db, "schedule"));
        setSchedule(scheduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Помилка завантаження розкладу:", error);
      } finally {
        setLoadingSchedule(false);
      }

      try {
        const newsSnap = await getDocs(collection(db, "news"));
        setNewsList(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Помилка завантаження новин:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchData();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredNews = newsList.filter(item => 
    item.title?.toLowerCase().includes(newsSearch.toLowerCase()) ||
    item.summary?.toLowerCase().includes(newsSearch.toLowerCase())
  );

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => {
    if (!activeAlbum) return;
    setLightboxIndex((prev) => (prev === 0 ? activeAlbum.photos.length - 1 : prev - 1));
  };
  const nextPhoto = () => {
    if (!activeAlbum) return;
    setLightboxIndex((prev) => (prev === activeAlbum.photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans flex flex-col selection:bg-amber-200 selection:text-amber-900">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection('home')}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-600 to-sky-950 flex items-center justify-center text-amber-200 shadow border-2 border-amber-300">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-tight">
                  Храм Святої Софії
                </h1>
                <p className="text-xs text-amber-800 font-semibold uppercase tracking-wide">
                  м. Луцьк (ВНУ ім. Л. Українки)
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1 font-medium text-sm">
              {[
                { id: 'home', label: 'Головна' },
                { id: 'info', label: 'Інформація' },
                { id: 'gallery', label: 'Фототека' },
                { id: 'news', label: 'Новини' },
                { id: 'contacts', label: 'Контакти' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-amber-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:bg-stone-100 rounded-lg focus:outline-none cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-2 shadow-lg">
            {[
              { id: 'home', label: 'Головна' },
              { id: 'info', label: 'Інформація' },
              { id: 'gallery', label: 'Фототека' },
              { id: 'news', label: 'Новини' },
              { id: 'contacts', label: 'Контакти' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-4 py-3 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-slate-950 text-white py-24 sm:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=1600')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-amber-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Православна Церква України (ПЦУ) • м. Луцьк</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-amber-100 leading-tight">
            Храм Святої Софії–Премудрості Божої
          </h1>

          <p className="text-base sm:text-xl text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
            Університетський храм при ВНУ ім. Лесі Українки — осередок віри, студентської молитви та духовності на Волині.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollToSection('info')}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
            >
              <span>Дізнатися більше</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('contacts')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md transition cursor-pointer"
            >
              Контакти та проїзд
            </button>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Про храм</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">Інформація про Храм</h2>
          <div className="w-16 h-1 bg-amber-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5 text-stone-700 leading-relaxed text-sm sm:text-base">
            <h3 className="text-2xl font-serif font-bold text-amber-900">Духовний осередок при університеті ім. Лесі Українки</h3>
            <p>
              Храм Святої Софії–Премудрості Божої розташований за адресою вул. Винниченка, 30а в місті Луцьк. Будівництво та історія храму тісно пов'язані з Волинським національним університетом імені Лесі Українки, об'єднуючи студентів, викладачів та мешканців навколишніх районів у єдину молитовну родину ПЦУ.
            </p>
            <p>
              У храмі регулярно проходять недільні та святкові богослужіння, акафісти та освітньо-духовні заходи, що сприяють вихованню молоді на християнських моральних цінностях.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-amber-100">
              <img 
                src="https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800" 
                alt="Храм Святої Софії у Луцьку" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Schedule from Firebase */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 space-y-6">
          <div className="flex items-center space-x-3 border-b border-amber-100 pb-4">
            <Calendar className="w-6 h-6 text-amber-700" />
            <h3 className="text-xl font-serif font-bold text-slate-900">Розклад богослужінь</h3>
          </div>

          {loadingSchedule ? (
            <div className="text-center py-8 text-sm text-stone-500">Завантаження розкладу...</div>
          ) : schedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.map((item) => (
                <div key={item.id} className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900 text-sm">{item.day}</span>
                    <span className="inline-flex items-center text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-amber-200">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                      {item.time}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-800 text-sm">{item.service}</h4>
                  <p className="text-xs text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-stone-500">
              Розклад наразі оновлюється в системі. Завітайте пізніше.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Духовенство Храму</h3>
            <p className="text-xs text-stone-600 mt-1">Священнослужителі парафії</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {CLERGY.map((person, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center space-y-3">
                <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-lg">{person.name}</h4>
                <p className="text-xs font-bold text-amber-800 uppercase">{person.role}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{person.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-stone-100/80 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Галерея та альбоми</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">Фототека</h2>
            <div className="w-16 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>

          {activeAlbum ? (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <button 
                    onClick={() => setActiveAlbum(null)}
                    className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mb-2 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Назад до всіх альбомів
                  </button>
                  <div className="flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                      {activeAlbum.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600">
                    {activeAlbum.subtitle} — <span className="font-semibold text-slate-800">{activeAlbum.photos.length} світлин</span>
                  </p>
                </div>

                <span className="self-start md:self-center text-xs font-medium text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                  {activeAlbum.date}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeAlbum.photos.map((photo, index) => (
                  <div 
                    key={photo.id}
                    onClick={() => openLightbox(index)}
                    className="group relative h-56 rounded-2xl overflow-hidden shadow border border-stone-200 bg-stone-200 cursor-pointer"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <div className="bg-white/90 text-slate-900 p-2 rounded-full shadow">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition duration-300">
                      <p className="text-xs font-serif font-medium line-clamp-1">{photo.title}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PHOTO_ALBUMS.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => setActiveAlbum(album)}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col group"
                >
                  <div className="h-52 relative overflow-hidden bg-stone-200">
                    <img 
                      src={album.cover} 
                      alt={album.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/75 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center space-x-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{album.photos.length}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">{album.date}</span>
                      <h3 className="font-serif font-bold text-slate-900 text-base group-hover:text-amber-800 transition">
                        {album.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                        {album.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 text-xs font-bold text-amber-800 flex items-center justify-between">
                      <span>Переглянути колекцію</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Життя парафії</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">Новини та Оголошення</h2>
          <div className="w-16 h-1 bg-amber-600 mx-auto rounded-full"></div>
        </div>

        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text"
            placeholder="Пошук новини..."
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 shadow-sm"
          />
        </div>

        {loadingNews ? (
          <div className="text-center py-12 text-sm text-stone-500">Завантаження новин з бази даних...</div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
              >
                {/* Картка новини: фото повністю видиме без обрізання */}
                <div className="news-card-img-wrapper">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="news-card-img"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded shadow">
                    {item.category || 'Новина'}
                  </span>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs text-stone-400 font-medium">{item.date}</span>
                    <h3 className="font-serif font-bold text-slate-900 text-base group-hover:text-amber-800 transition line-clamp-2 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-3 mt-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-bold text-amber-800 flex items-center">
                    <span>Читати повністю</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-stone-500">
            Наразі немає опублікованих новин.
          </div>
        )}

      </section>

      {/* Contacts Section */}
      <section id="contacts" className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Контакти</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-100">Як нас знайти</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 bg-slate-900 p-8 rounded-3xl border border-stone-800 space-y-6">
              <h3 className="text-xl font-serif font-bold text-amber-200">Контактна інформація</h3>

              <div className="space-y-4 text-sm text-stone-300">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Адреса</span>
                    <span>{CHURCH_DATA.address}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Телефон</span>
                    <span>{CHURCH_DATA.phone}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Електронна пошта</span>
                    <span>{CHURCH_DATA.email}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Години роботи</span>
                    <span>{CHURCH_DATA.workingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 rounded-3xl overflow-hidden border border-stone-800 h-80 flex flex-col justify-center items-center text-center p-6 relative">
              <MapPin className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
              <h4 className="font-serif font-bold text-lg text-amber-100">{CHURCH_DATA.title}</h4>
              <p className="text-xs text-stone-400 max-w-sm mt-1">{CHURCH_DATA.address}</p>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(CHURCH_DATA.address)}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 inline-flex items-center text-xs font-bold text-slate-950 bg-amber-400 px-4 py-2 rounded-xl hover:bg-amber-300 transition"
              >
                Відкрити карту Google <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-stone-800 text-stone-400 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-serif text-sm font-bold text-amber-200">Храм Святої Софії–Премудрості Божої (м. Луцьк)</p>
          <p>© {new Date().getFullYear()} Усі права захищені.</p>
        </div>
      </footer>

      {/* Lightbox Modal (для галереї) */}
      {activeAlbum && lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 p-2 cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>

            <button 
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition cursor-pointer"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button 
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <img 
              src={activeAlbum.photos[lightboxIndex].url} 
              alt={activeAlbum.photos[lightboxIndex].title} 
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl" 
            />

            <div className="mt-3 text-center space-y-1">
              <p className="text-white font-serif font-bold text-base">
                {activeAlbum.photos[lightboxIndex].title}
              </p>
              <p className="text-xs text-amber-300">
                Світлина {lightboxIndex + 1} з {activeAlbum.photos.length} — {activeAlbum.title}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Модальне вікно новини: Рівно 40% фото (повне, без обрізання) + 60% текст із скролом */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="news-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Верхня частина з фото: рівно 40% висоти, повне фото без обрізання */}
            <div className="news-modal-img-wrapper">
              <img 
                src={selectedNews.image} 
                alt={selectedNews.title} 
                className="news-modal-img"
              />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition cursor-pointer shadow-lg z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-3 left-3 bg-amber-600 text-white text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded-lg">
                {selectedNews.category || 'Новина'}
              </span>
            </div>

            {/* Нижня частина: рівно 60% висоти під текст зі скролом */}
            <div className="news-modal-body">
              <div className="text-xs text-stone-500 font-medium">
                {selectedNews.date}
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug">
                {selectedNews.title}
              </h2>

              <div className="w-12 h-0.5 bg-amber-500 rounded-full"></div>

              <div className="text-stone-700 text-xs sm:text-base leading-relaxed whitespace-pre-line space-y-3 pt-1">
                {selectedNews.content}
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex justify-end flex-shrink-0">
              <button 
                onClick={() => setSelectedNews(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Закрити
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}