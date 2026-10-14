import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Menu, X, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  ArrowLeft, Folder, Image as ImageIcon, ZoomIn, Sun, Sparkles, 
  User, ExternalLink, ChevronLeft as ChevronLeftIcon, Search, ChevronDown, ChevronUp 
} from 'lucide-react';
import './App.css';

const CHURCH_DATA = {
  title: "Храм Святої Софії–Премудрості Божої",
  city: "м. Луцьк",
  address: "м. Луцьк, вул. Банкова, 9",
  phone: "+380 (50) 123-45-67",
  email: "sophiahram@gmail.com",
  rector: "Протоієрей Віктор Пушко",

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
  
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [albumsList, setAlbumsList] = useState(DEFAULT_PHOTO_ALBUMS);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [selectedNews, setSelectedNews] = useState(null);
  const [newsSearch, setNewsSearch] = useState('');

  // Стани для перемикання "Показати більше"
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);

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

      try {
        const albumsSnap = await getDocs(collection(db, "photoAlbums"));
        if (!albumsSnap.empty) {
          setAlbumsList(albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Помилка завантаження фототеки:", error);
      } finally {
        setLoadingAlbums(false);
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

  // Обрізання списків до 4 елементів, якщо не натиснуто "Показати більше"
  const displayedAlbums = showAllAlbums ? albumsList : albumsList.slice(0, 4);
  const displayedNews = showAllNews ? filteredNews : filteredNews.slice(0, 4);

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
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans flex flex-col selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden pt-16 sm:pt-20">
      
      {/* Header (Фіксований при прокручуванні) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            <div 
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer"
              onClick={() => scrollToSection('home')}
            >
              <img 
                src="https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Emblem_of_the_Orthodox_Church_of_Ukraine.svg/250px-Emblem_of_the_Orthodox_Church_of_Ukraine.svg.png" 
                alt="Emblem" 
                className="w-9 h-9 sm:w-12 sm:h-12 object-contain"
              />
              <div>
                <h1 className="text-sm sm:text-lg font-serif font-bold text-slate-900 leading-tight">
                  Храм Софії Премудрості Божої
                </h1>
                <p className="text-[10px] sm:text-xs text-amber-800 font-semibold uppercase tracking-wide">
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
                aria-label="Меню"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 px-4 py-3 space-y-1 shadow-lg">
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
                className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-800 hover:bg-amber-50 cursor-pointer text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Hero Section */}
{/* Hero Section */}
      <section id="home" className="relative bg-slate-950 text-white py-32 sm:py-48 lg:py-72 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url('https://scontent-iev1-1.xx.fbcdn.net/v/t1.6435-9/140737096_164988195388473_5077406916130826611_n.jpg?stp=dst-jpg_tt6&cstp=mx1167x1762&ctp=s1167x1762&_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=P8KxkbZXSNcQ7kNvwECoCSw&_nc_oc=AdpS9415cf9TFX-I9eCkstCz5zhCPvkGT48xXY42N32hbylXHfDYHo8OnzPZK2sfqpA&_nc_zt=23&_nc_ht=scontent-iev1-1.xx&_nc_gid=rPjI2IMKFiO9bzBZJHgSsA&_nc_ss=7b289&oh=00_AQN_fA27jemzdMqsl2y4zK423RoC0nHikjLJR763vCVZ4g&oe=6AF710C2')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-amber-100 leading-tight">
            Храм Софії Премудрості Божої
          </h1>

          <p className="text-sm sm:text-xl text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-2">
            Храм Софії Премудрості Божої при Волинському Національному університеті ім. Лесі Українки.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <button
              onClick={() => scrollToSection('info')}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer text-sm sm:text-base"
            >
              <span>Дізнатися більше</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('contacts')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md transition cursor-pointer text-sm sm:text-base"
            >
              Контакти та адреса
            </button>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Інформація про Храм</h2>
          <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-stone-700 leading-relaxed text-sm sm:text-base">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-800">Духовний осередок при університеті ім. Лесі Українки</h3>
            <p>
              Храм Святої Софії–Премудрості Божої розташований за адресою вул. Винниченка, 30а в місті Луцьк. Будівництво та історія храму тісно пов'язані з Волинським национальним університетом імені Лесі Українки, об'єднуючи студентів, викладачів та мешканців навколишніх районів у єдину молитовну родину ПЦУ.
            </p>
            <p>
              У храмі регулярно проходять недільні та святкові богослужіння, акафісти та освітньо-духовні заходи, що сприяють вихованню молоді на християнських моральних цінностях.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-amber-100">
              <img 
                src="https://scontent-iev1-1.xx.fbcdn.net/v/t39.30808-6/474156837_1026994389187845_7722730926577361377_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1357&ctp=s2048x1357&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=GwIIUrlRwd4Q7kNvwFbSXnk&_nc_oc=AdpQuosJB0dGcyiKUBNUFjtsg5AMqIG9T6tbXSb-HYcqZfFVwbi4UTg0dHmS7YuI5n8&_nc_zt=23&_nc_ht=scontent-iev1-1.xx&_nc_gid=s17S0xaOxw2SN64TD1ITJw&_nc_ss=7b2a8&oh=00_AQMwPt2aBCWy2J0roJi16BHOrs97-KGeaP_GAjxIEVSq_g&oe=6AD5A914" 
                alt="Храм Святої Софії у Луцьку" 
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-md border border-amber-200 space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3 border-b border-amber-100 pb-3 sm:pb-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">Розклад богослужінь</h3>
          </div>

          {loadingSchedule ? (
            <div className="text-center py-8 text-xs sm:text-sm text-stone-500">Завантаження розкладу...</div>
          ) : schedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {schedule.map((item) => (
                <div key={item.id} className="bg-amber-50/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-200/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-800 text-xs sm:text-sm">{item.day}</span>
                    <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-slate-900 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-sm border border-amber-200">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-amber-800" />
                      {item.time}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-800 text-xs sm:text-sm">{item.service}</h4>
                  <p className="text-[11px] sm:text-xs text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs sm:text-sm text-stone-500">
              Розклад наразі оновлюється в системі. Завітайте пізніше.
            </div>
          )}
        </div>

      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 sm:py-20 bg-stone-100/80 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Фототека</h2>
            <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
          </div>

          {loadingAlbums ? (
            <div className="text-center py-12 text-xs sm:text-sm text-stone-500">Завантаження фототеки...</div>
          ) : activeAlbum ? (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <button 
                    onClick={() => setActiveAlbum(null)}
                    className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mb-2 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Назад до всіх альбомів
                  </button>
                  <div className="flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-amber-800 flex-shrink-0" />
                    <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900">
                      {activeAlbum.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600">
                    {activeAlbum.subtitle} — <span className="font-semibold text-slate-800">{activeAlbum.photos?.length || 0} світлин</span>
                  </p>
                </div>

                <span className="self-start md:self-center text-xs font-medium text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                  {activeAlbum.date}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeAlbum.photos?.map((photo, index) => (
                  <div 
                    key={photo.id || index}
                    onClick={() => openLightbox(index)}
                    className="group relative h-40 sm:h-56 rounded-xl sm:rounded-2xl overflow-hidden shadow border border-stone-200 bg-stone-200 cursor-pointer"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <div className="bg-white/90 text-slate-900 p-2 rounded-full shadow">
                        <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-slate-950/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition duration-300">
                      <p className="text-[10px] sm:text-xs font-serif font-medium line-clamp-1">{photo.title}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayedAlbums.map((album) => (
                  <div 
                    key={album.id}
                    onClick={() => setActiveAlbum(album)}
                    className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col group"
                  >
                    <div className="h-44 sm:h-52 relative overflow-hidden bg-stone-200">
                      <img 
                        src={album.cover} 
                        alt={album.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-slate-950/75 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center space-x-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{album.photos?.length || 0}</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">{album.date}</span>
                        <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base group-hover:text-amber-800 transition">
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

              {/* Кнопка "Показати більше / Згорнути" для фототеки */}
              {albumsList.length > 4 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAllAlbums(!showAllAlbums)}
                    className="inline-flex items-center space-x-2 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-amber-300 shadow-sm transition cursor-pointer"
                  >
                    <span>{showAllAlbums ? 'Згорнути альбоми' : `Показати більше альбомів (${albumsList.length - 4})`}</span>
                    {showAllAlbums ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Новини та Оголошення</h2>
          <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
        </div>

        <div className="max-w-md mx-auto relative px-2 sm:px-0">
          <Search className="w-4 h-4 absolute left-5 sm:left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text"
            placeholder="Пошук новини..."
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 shadow-sm"
          />
        </div>

        {loadingNews ? (
          <div className="text-center py-12 text-xs sm:text-sm text-stone-500">Завантаження новин з бази даних...</div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {displayedNews.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
                >
                  <div className="news-card-img-wrapper h-48 sm:h-52 relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 text-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded shadow">
                      {item.category || 'Новина'}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] sm:text-xs text-stone-400 font-medium">{item.date}</span>
                      <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base group-hover:text-amber-800 transition line-clamp-2 mt-1">
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

            {/* Кнопка "Показати більше / Згорнути" для новин */}
            {filteredNews.length > 4 && !newsSearch && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllNews(!showAllNews)}
                  className="inline-flex items-center space-x-2 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-amber-300 shadow-sm transition cursor-pointer"
                >
                  <span>{showAllNews ? 'Згорнути новини' : `Показати більше новин (${filteredNews.length - 4})`}</span>
                  {showAllNews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-xs sm:text-sm text-stone-500">
            Наразі немає опублікованих новин.
          </div>
        )}

      </section>

      {/* Contacts Section */}
      <section id="contacts" className="py-12 sm:py-20 bg-[#FAF9F6] border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">Як нас знайти</h2>
            <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-amber-200 shadow-sm space-y-5 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-800">Контактна інформація</h3>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900 block">Адреса</span>
                    <span>{CHURCH_DATA.address}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900 block">Телефон</span>
                    <a href={`tel:${CHURCH_DATA.phone}`} className="hover:underline">{CHURCH_DATA.phone}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900 block">Електронна пошта</span>
                    <a href={`mailto:${CHURCH_DATA.email}`} className="hover:underline">{CHURCH_DATA.email}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  
                  
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-200 shadow-sm h-64 sm:h-80 flex flex-col justify-center items-center text-center p-6 relative">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-amber-800 mb-2 sm:mb-3 animate-bounce" />
              <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900">{CHURCH_DATA.title}</h4>
              <p className="text-[11px] sm:text-xs text-stone-600 max-w-sm mt-1">{CHURCH_DATA.address}</p>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(CHURCH_DATA.address)}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-3 sm:mt-4 inline-flex items-center text-xs font-bold text-white bg-amber-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-amber-800 transition shadow"
              >
                Відкрити карту Google <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF9F6] border-t border-amber-200 py-6 sm:py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1.5 sm:space-y-2">
          <p className="font-serif text-xs sm:text-sm font-bold text-amber-800">Храм Святої Софії–Премудрості Божої (м. Луцьк)</p>
          <p className="text-amber-800 text-[11px] sm:text-xs font-medium">© {new Date().getFullYear()} Усі права захищені.</p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {activeAlbum && lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={closeLightbox}
              className="absolute top-2 right-2 sm:-top-12 sm:right-0 bg-black/60 sm:bg-transparent text-white hover:text-amber-400 p-2 rounded-full cursor-pointer z-20"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <button 
              onClick={prevPhoto}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 sm:p-3 rounded-full hover:bg-black/80 transition cursor-pointer z-10"
            >
              <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={nextPhoto}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 sm:p-3 rounded-full hover:bg-black/80 transition cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <img 
              src={activeAlbum.photos[lightboxIndex].url} 
              alt={activeAlbum.photos[lightboxIndex].title} 
              className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full object-contain rounded-lg sm:rounded-xl shadow-2xl" 
            />

            <div className="mt-3 text-center space-y-1 px-4">
              <p className="text-white font-serif font-bold text-sm sm:text-base">
                {activeAlbum.photos[lightboxIndex].title}
              </p>
              <p className="text-[11px] sm:text-xs text-amber-300">
                Світлина {lightboxIndex + 1} з {activeAlbum.photos.length} — {activeAlbum.title}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Модальне вікно новини */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="relative h-48 sm:h-64 w-full flex-shrink-0 bg-stone-900">
              <img 
                src={selectedNews.image} 
                alt={selectedNews.title} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition cursor-pointer shadow-lg z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-3 left-3 bg-amber-800 text-white text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded-lg">
                {selectedNews.category || 'Новина'}
              </span>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 flex-grow">
              <div className="text-xs text-stone-500 font-medium">
                {selectedNews.date}
              </div>

              <h2 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 leading-snug">
                {selectedNews.title}
              </h2>

              <div className="w-12 h-0.5 bg-amber-800 rounded-full"></div>

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