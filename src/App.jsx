import React, { useState } from 'react';
import { 
  Menu, X, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  ArrowLeft, Folder, Image as ImageIcon, ZoomIn, Sun, Sparkles, 
  User, ExternalLink, ChevronLeft as ChevronLeftIcon, Search 
} from 'lucide-react';

const CHURCH_DATA = {
  title: "Храм Софії Премудрості Божої",
  city: "м. Луцьк",
  address: "м. Луцьк, вул. Софіївська, 12",
  phone: "+380 (50) 123-45-67",
  email: "sofia.lutsk.church@gmail.com",
  rector: "Протоієрей Василій",
  workingHours: "Щодня з 08:00 до 19:00"
};

const SCHEDULE = [
  { day: "Субота", time: "17:00", service: "Всенічне бдіння", desc: "Святкове вечірнє богослужіння, сповідь" },
  { day: "Неділя", time: "07:30", service: "Ранкова Божественна Літургія", desc: "Сповідь та Причастя Святих Христових Таїн" },
  { day: "Неділя", time: "10:00", service: "Пізня Божественна Літургія", desc: "Святкове служіння, дитячий хор" },
  { day: "Середа", time: "17:00", service: "Молебень з акафістом", desc: "Молитва до Премудрості Божої за мир та воїнів" },
  { day: "П'ятниця", time: "17:00", service: "Вечірнє богослужіння", desc: "Заупокійна панахида та загальна молитва" }
];

const CLERGY = [
  { name: "Протоієрей Василій", role: "Настоятель Храму", desc: "Духовний наставник парафії, опікується духовним та соціальним життям громади." },
  { name: "Ієрей Михайло", role: "Клірик Храму", desc: "Священнослужитель, здійснює душпастирську опіку та недільну катехізацію." },
  { name: "Диякон Олексій", role: "Священнослужитель", desc: "Керує церковним хором та супроводжує богослужіння." }
];

const PHOTO_ALBUMS = [
  {
    id: 'arch',
    title: "Храм та Святині",
    subtitle: "Архітектура, внутрішнє оздоблення та хрести Храму Софії",
    cover: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800",
    date: "2026 рік",
    photos: [
      { id: 'a1', title: "Величний фасад Храму Софії", url: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a2', title: "Святий Вівтар та Іконостас", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a3', title: "Куполи храмів у сонячний день", url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200" },
      { id: 'a4', title: "Дзвони Софіївської дзвіниці", url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=1200" }
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
      { id: 's2', title: "Спільна молитва парафіян", url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1200" },
      { id: 's3', title: "Таїнство Святого Причастя", url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  {
    id: 'feasts',
    title: "Престольні Свята",
    subtitle: "Урочистості з нагоди дня Софії Премудрості Божої",
    cover: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=800",
    date: "Вересень 2026",
    photos: [
      { id: 'f1', title: "Святковий хресний хід навколо храму", url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1200" },
      { id: 'f2', title: "Благословення та окроплення святою водою", url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=1200" },
      { id: 'f3', title: "Святково прикрашена ікона Премудрості", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  {
    id: 'restoration',
    title: "Благоустрій та Реставрація",
    subtitle: "Оновлення іконостасу та території довкола храму",
    cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    date: "Літо - Осінь 2026",
    photos: [
      { id: 'r1', title: "Завершальний етап розпису святинь", url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" },
      { id: 'r2', title: "Оновлені елементи центрального іконостасу", url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200" }
    ]
  }
];

const NEWS_LIST = [
  {
    id: 1,
    title: "Святкове богослужіння у День Премудрості Божої",
    date: "10 Жовтня 2026",
    category: "Свята",
    summary: "У нашому храмі відбулося урочисте богослужіння з нагоди престольного свята. Чимало парафіян зібралися для спільної молитви.",
    content: "У день пам'яті Премудрості Божої у Храмі Софії м. Луцька відбулося святкове богослужіння. Очолив Божественну Літургію настоятель храму протоієрей Василій у співслужінні духовенства міста. Під час служби підносилися особливі молебні за мир в Україні, захист наших воїнів та здоров'я усіх парафіян. Після завершення Літургії відбувся традиційний хресний хід довкола храму.",
    image: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Розклад богослужінь на осінньо-зимовий період",
    date: "01 Жовтня 2026",
    category: "Оголошення",
    summary: "Зверніть увагу на оновлений розклад вечірніх та ранкових служб у нашому храмі.",
    content: "Шановні парафіяни! З нового місяця вступає в дію оновлений розклад богослужінь. Ранкові служби у недільні дні здійснюються о 07:30 та 10:00, вечірні відправи — о 17:00. Запрошуємо усіх розділити радість молитви.",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Завершення чергового етапу реставрації іконостасу",
    date: "20 Вересня 2026",
    category: "Життя храму",
    summary: "Майстри-іконописці завершили відновлення центральних ікон святого вівтаря.",
    content: "Завдяки старанням нашої парафіяльної громади було успішно завершено реставрацію центральних ікон. Відтепер іконостас постає перед вірянами у всій своїй величі та духовному сяйві. Щиро дякуємо кожному, хто долучився.",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
  }
];

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [selectedNews, setSelectedNews] = useState(null);
  const [newsSearch, setNewsSearch] = useState('');

  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredNews = NEWS_LIST.filter(item => 
    item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
    item.summary.toLowerCase().includes(newsSearch.toLowerCase())
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
              
              <div>
                <h1 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-tight">
                  Храм Софії Премудрості Божої
                </h1>
                <p className="text-xs text-amber-800 font-semibold uppercase tracking-wide">
                  м. Луцьк
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
                  className={`px-4 py-2 rounded-lg transition-colors ${
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
                className="p-2 text-slate-700 hover:bg-stone-100 rounded-lg focus:outline-none"
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
                className="w-full text-left px-4 py-3 rounded-lg font-medium text-stone-800 hover:bg-amber-50"
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
          

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-amber-100 leading-tight">
            Храм Софії Премудрості Божої
          </h1>

          

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollToSection('info')}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <span>Дізнатися більше</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('contacts')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md transition"
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
            <h3 className="text-2xl font-serif font-bold text-amber-900">Історія та значення Премудрості Божої</h3>
            <p>
              Храм Софії Премудрості Божої у місті Луцьк є важливим осередком духовного життя Волині. Закладений з молитвою та благословенням, він об'єднує вірян для спільної молитви, духовної підтримки та збереження православних традицій.
            </p>
            <p>
              Назва храму присвячена Премудрості Божій — Самому Господу Ісусу Христу. Храм постає як символ святості та світла, що просвітлює кожну людину на шляху віри.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-amber-100">
              <img 
                src="https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800" 
                alt="Храм Софії м. Луцьк" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 space-y-6">
          <div className="flex items-center space-x-3 border-b border-amber-100 pb-4">
            <Calendar className="w-6 h-6 text-amber-700" />
            <h3 className="text-xl font-serif font-bold text-slate-900">Розклад богослужінь</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCHEDULE.map((item, idx) => (
              <div key={idx} className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60 space-y-2">
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
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Духовенство Храму</h3>
            <p className="text-xs text-stone-600 mt-1">Священнослужителі парафії</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mb-2 transition"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 text-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">
                  {item.category}
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
          <p className="font-serif text-sm font-bold text-amber-200">Храм Софії Премудрості Божої (м. Луцьк)</p>
          <p>© {new Date().getFullYear()} Усі права захищені.</p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {activeAlbum && lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 p-2"
            >
              <X className="w-8 h-8" />
            </button>

            <button 
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button 
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition"
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

      {/* News Details Modal */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-stone-200">
              <img 
                src={selectedNews.image} 
                alt={selectedNews.title} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-amber-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-lg">
                {selectedNews.category}
              </span>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <span className="text-xs text-stone-500 font-medium">{selectedNews.date}</span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 leading-snug">
                {selectedNews.title}
              </h2>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {selectedNews.content}
              </p>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button 
                onClick={() => setSelectedNews(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
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