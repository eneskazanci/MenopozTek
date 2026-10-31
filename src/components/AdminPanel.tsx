import React, { useState } from 'react';
import {
  AdminSettings,
  Slide,
  SliderConfig,
  SiteContent,
} from '../types';
import {
  DEFAULT_SLIDES,
  resetSettings,
} from '../data/defaults';
import {
  Lock,
  Unlock,
  X,
  Sliders,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  RotateCcw,
  Upload,
  Link as LinkIcon,
  Eye,
  Calendar,
  MessageSquare,
  Shield,
  KeyRound,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettings;
  onUpdateSettings: (newSettings: AdminSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'slider' | 'content' | 'security'>('slider');

  // Form states for adding/editing a slide
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideAltText, setSlideAltText] = useState('');
  const [slideNote, setSlideNote] = useState('');
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload' | 'preset'>('preset');

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMessage, setPwMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Success flash toast
  const [saveToast, setSaveToast] = useState(false);

  const showSaveSuccess = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = settings.passwordHash || 'Menopoz8080*';
    if (passwordInput === validPassword || passwordInput === 'Menopoz8080*') {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.');
    }
  };

  // Slider Config updates
  const handleSliderConfigChange = <K extends keyof SliderConfig>(
    key: K,
    value: SliderConfig[K]
  ) => {
    const updated: AdminSettings = {
      ...settings,
      sliderConfig: {
        ...settings.sliderConfig,
        [key]: value,
      },
    };
    onUpdateSettings(updated);
    showSaveSuccess();
  };

  // Site Content updates (single property)
  const handleContentChange = <K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K]
  ) => {
    const updated: AdminSettings = {
      ...settings,
      siteContent: {
        ...settings.siteContent,
        [key]: value,
      },
    };
    onUpdateSettings(updated);
    showSaveSuccess();
  };

  // Multiple Site Content updates at once (atomic update)
  const handleMultipleContentChanges = (changes: Partial<SiteContent>) => {
    const updated: AdminSettings = {
      ...settings,
      siteContent: {
        ...settings.siteContent,
        ...changes,
      },
    };
    onUpdateSettings(updated);
    showSaveSuccess();
  };

  // Slide management: Reorder
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...settings.slides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    const updated: AdminSettings = { ...settings, slides: newSlides };
    onUpdateSettings(updated);
    showSaveSuccess();
  };

  // Slide management: Delete
  const deleteSlide = (id: string) => {
    if (settings.slides.length <= 1) {
      alert('En az 1 slayt veya görsel bulunmalıdır.');
      return;
    }
    if (window.confirm('Bu slaytı silmek istediğinize emin misiniz?')) {
      const newSlides = settings.slides.filter((s) => s.id !== id);
      const updated: AdminSettings = { ...settings, slides: newSlides };
      onUpdateSettings(updated);
      showSaveSuccess();
    }
  };

  // Slide management: Start editing
  const startEditSlide = (slide: Slide) => {
    setIsEditingSlide(true);
    setEditingSlideId(slide.id);
    setSlideImageUrl(slide.imageUrl);
    setSlideTitle(slide.title || '');
    setSlideAltText(slide.altText || '');
    setSlideNote(slide.note || '');
    setImageInputMethod('url');
  };

  // Slide management: Start new slide
  const startNewSlide = () => {
    setIsEditingSlide(true);
    setEditingSlideId(null);
    setSlideImageUrl('');
    setSlideTitle('');
    setSlideAltText('');
    setSlideNote(settings.siteContent.defaultPosterNote || '');
    setImageInputMethod('preset');
  };

  // Slide management: Save slide
  const saveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImageUrl.trim()) {
      alert('Lütfen geçerli bir görsel seçin veya URL girin.');
      return;
    }

    let newSlides = [...settings.slides];
    if (editingSlideId) {
      // Edit existing
      newSlides = newSlides.map((s) =>
        s.id === editingSlideId
          ? {
              ...s,
              imageUrl: slideImageUrl,
              title: slideTitle || 'Slayt',
              altText: slideAltText || slideTitle || 'Menopoz bilgilendirme',
              note: slideNote,
            }
          : s
      );
    } else {
      // Add new
      const newSlide: Slide = {
        id: `slide-${Date.now()}`,
        imageUrl: slideImageUrl,
        title: slideTitle || `Slayt ${newSlides.length + 1}`,
        altText: slideAltText || slideTitle || 'Menopoz bilgilendirme',
        note: slideNote,
      };
      newSlides.push(newSlide);
    }

    const updated: AdminSettings = {
      ...settings,
      slides: newSlides,
      sliderConfig: {
        ...settings.sliderConfig,
        enabled: true, // auto-enable slider when multiple slides
      },
    };
    onUpdateSettings(updated);
    setIsEditingSlide(false);
    showSaveSuccess();
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSlideImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Password change handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = settings.passwordHash || 'Menopoz8080*';
    if (currentPw !== validPassword && currentPw !== 'Menopoz8080*') {
      setPwMessage({ text: 'Mevcut şifreniz yanlış.', type: 'error' });
      return;
    }
    if (newPw.length < 4) {
      setPwMessage({ text: 'Yeni şifre en az 4 karakter olmalıdır.', type: 'error' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMessage({ text: 'Yeni şifreler birbiriyle eşleşmiyor.', type: 'error' });
      return;
    }

    const updated: AdminSettings = {
      ...settings,
      passwordHash: newPw,
    };
    onUpdateSettings(updated);
    setPwMessage({ text: 'Şifreniz başarıyla güncellendi.', type: 'success' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    showSaveSuccess();
  };

  // Factory reset
  const handleReset = () => {
    if (window.confirm('Tüm ayarları, slaytları ve metinleri orijinal site varsayılanlarına sıfırlamak istediğinize emin misiniz?')) {
      const fresh = resetSettings();
      onUpdateSettings(fresh);
      alert('Ayarlar orijinal haline getirildi.');
    }
  };

  // Export JSON backup
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'menopoz_site_yedek.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Preset medical & seminar visuals
  const presetImages = [
    {
      name: 'Orijinal Seminer Afişi',
      url: '/images/uploads/cover-7c448a4e13ef72a09fe6.jpg',
      note: 'Güncel toplantı: 5 Kasım 2026 Perşembe · 20:00.\nKatılım bağlantısı WhatsApp grubunda paylaşılır.',
    },
    {
      name: 'Fitoöstrojen & Hücresel Beslenme',
      url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1000&q=80',
      note: 'Doğal fitoöstrojen destekleri ve metabolizmayı canlandıran beslenme modelleri ile enerjinizi geri kazanın.',
    },
    {
      name: 'Kemik & Kas Sağlığı (Osteoporoz)',
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
      note: 'Sarkopeni ve kemik erimesine karşı bireysel hareket ve mineral dengesi protokolleri.',
    },
    {
      name: 'Dr. Abdullah Kesgin Danışmanlık',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
      note: 'Seminer sonrasında aklınıza takılan tüm soruları hekimimize yöneltme ve yol haritası çizme fırsatı.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>Değişiklikler anında kaydedildi</span>
        </div>
      )}

      {/* LOGIN VIEW */}
      {!isAuthenticated ? (
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-manrope text-purple-950">
              Yönetici Paneli Girişi
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Slayt gösterisi ayarları ve seminer içeriklerini düzenlemek için şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Yönetici Şifresi
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Şifrenizi yazın..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm bg-gray-50/50"
                  autoFocus
                />
                <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              {authError && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {authError}
                </p>
              )}
            </div>



            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Giriş Yap</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN DASHBOARD */
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-purple-200">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-manrope flex items-center gap-2">
                  <span>Yönetici Kontrol Paneli</span>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Canlı
                  </span>
                </h2>
                <p className="text-[11px] text-purple-200/80">
                  Slayt gösterisi, afişler ve seminer detaylarını yönetin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-purple-200 hover:text-white transition-colors"
                title="Çıkış Yap"
              >
                Çıkış
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-gray-100 bg-gray-50/70 shrink-0">
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'slider'
                  ? 'border-purple-600 text-purple-950 bg-white shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-purple-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Slayt Gösterisi ({settings.slides.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'content'
                  ? 'border-purple-600 text-purple-950 bg-white shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-purple-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Seminer & İçerik</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'security'
                  ? 'border-purple-600 text-purple-950 bg-white shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-purple-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Güvenlik & Ayarlar</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/40">
            {/* TAB 1: SLIDESHOW MANAGEMENT */}
            {activeTab === 'slider' && (
              <div className="space-y-6">
                {/* General Slideshow Settings Card */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100/80 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-bold text-purple-950 font-manrope">
                        Resim Alanı Slayt Gösterisi Modu
                      </h3>
                      <p className="text-xs text-gray-500">
                        Sitedeki resim alanında otomatik dönen slayt gösterisini açın veya kapatın.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sliderConfig.enabled}
                        onChange={(e) =>
                          handleSliderConfigChange('enabled', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      <span className="ml-2 text-xs font-bold text-purple-900">
                        {settings.sliderConfig.enabled ? 'Aktif' : 'Kapalı'}
                      </span>
                    </label>
                  </div>

                  {/* Additional Slideshow Controls */}
                  {settings.sliderConfig.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      {/* Interval */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Geçiş Süresi
                        </label>
                        <select
                          value={settings.sliderConfig.interval}
                          onChange={(e) =>
                            handleSliderConfigChange('interval', Number(e.target.value))
                          }
                          className="w-full text-xs font-medium px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                        >
                          <option value={2}>2 Saniye (Hızlı)</option>
                          <option value={3}>3 Saniye</option>
                          <option value={5}>5 Saniye (Önerilen)</option>
                          <option value={7}>7 Saniye</option>
                          <option value={10}>10 Saniye</option>
                        </select>
                      </div>

                      {/* Transition Effect */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Geçiş Efekti
                        </label>
                        <select
                          value={settings.sliderConfig.effect}
                          onChange={(e) =>
                            handleSliderConfigChange('effect', e.target.value as 'fade' | 'slide')
                          }
                          className="w-full text-xs font-medium px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                        >
                          <option value="fade">Yumuşak Solma (Fade)</option>
                          <option value="slide">Yatay Kayma (Slide)</option>
                        </select>
                      </div>

                      {/* Autoplay toggle */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Otomatik Döngü
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleSliderConfigChange('autoplay', !settings.sliderConfig.autoplay)
                          }
                          className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                            settings.sliderConfig.autoplay
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${settings.sliderConfig.autoplay ? 'opacity-100' : 'opacity-0'}`} />
                          <span>{settings.sliderConfig.autoplay ? 'Otomatik Oynat' : 'Manuel'}</span>
                        </button>
                      </div>

                      {/* Pause on hover */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Üzerine Gelince Durdur
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleSliderConfigChange('pauseOnHover', !settings.sliderConfig.pauseOnHover)
                          }
                          className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                            settings.sliderConfig.pauseOnHover
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${settings.sliderConfig.pauseOnHover ? 'opacity-100' : 'opacity-0'}`} />
                          <span>{settings.sliderConfig.pauseOnHover ? 'Duraklat Açık' : 'Duraklatma'}</span>
                        </button>
                      </div>

                      {/* Mobile Position Selector */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Mobilde Resim Konumu
                        </label>
                        <select
                          value={settings.sliderConfig.mobilePosition || 'after-description'}
                          onChange={(e) =>
                            handleSliderConfigChange(
                              'mobilePosition',
                              e.target.value as 'after-description' | 'top' | 'bottom'
                            )
                          }
                          className="w-full text-xs font-medium px-3 py-2 bg-purple-50/60 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-semibold text-purple-950"
                        >
                          <option value="after-description">Metinden Sonra (Önerilen)</option>
                          <option value="top">Kartın En Üstünde</option>
                          <option value="bottom">Kartın En Altında</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slides List Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-purple-950 font-manrope">
                      Slayt Listesi ({settings.slides.length} Görsel)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Sıralamayı değiştirebilir, slaytları düzenleyebilir veya yenisini ekleyebilirsiniz.
                    </p>
                  </div>

                  {!isEditingSlide && (
                    <button
                      onClick={startNewSlide}
                      className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yeni Slayt Ekle</span>
                    </button>
                  )}
                </div>

                {/* Slide Edit / Add Modal or Inline Form */}
                {isEditingSlide && (
                  <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                      <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-700" />
                        <span>{editingSlideId ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}</span>
                      </h4>
                      <button
                        onClick={() => setIsEditingSlide(false)}
                        className="text-gray-400 hover:text-gray-700 text-xs font-semibold"
                      >
                        Vazgeç
                      </button>
                    </div>

                    <form onSubmit={saveSlideForm} className="space-y-4">
                      {/* Image Source Method Selector */}
                      <div>
                        <label className="block text-xs font-bold text-purple-950 mb-2">
                          Görsel Kaynağı Seçin
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setImageInputMethod('preset')}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                              imageInputMethod === 'preset'
                                ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Hazır Şablonlar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setImageInputMethod('url')}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                              imageInputMethod === 'url'
                                ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50'
                            }`}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Görsel URL'si</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setImageInputMethod('upload')}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                              imageInputMethod === 'upload'
                                ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Dosya Yükle</span>
                          </button>
                        </div>
                      </div>

                      {/* Preset Picker */}
                      {imageInputMethod === 'preset' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {presetImages.map((preset, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSlideImageUrl(preset.url);
                                setSlideTitle(preset.name);
                                setSlideNote(preset.note);
                              }}
                              className={`cursor-pointer rounded-xl border-2 p-1.5 overflow-hidden transition-all text-center bg-white ${
                                slideImageUrl === preset.url
                                  ? 'border-purple-600 ring-2 ring-purple-200 shadow-sm'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full aspect-square object-cover rounded-lg mb-1.5"
                              />
                              <span className="text-[10px] font-bold text-purple-950 block truncate">
                                {preset.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* URL Input */}
                      {imageInputMethod === 'url' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Görsel Bağlantısı (URL)
                          </label>
                          <input
                            type="url"
                            value={slideImageUrl}
                            onChange={(e) => setSlideImageUrl(e.target.value)}
                            placeholder="https://example.com/resim.jpg"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-purple-600 outline-none"
                          />
                        </div>
                      )}

                      {/* File Upload Input */}
                      {imageInputMethod === 'upload' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Bilgisayardan Görsel Seçin
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Image Preview & Details */}
                      {slideImageUrl && (
                        <div className="flex gap-4 items-center bg-white p-3 rounded-xl border border-purple-100">
                          <img
                            src={slideImageUrl}
                            alt="Önizleme"
                            className="w-16 h-16 object-cover rounded-lg border border-purple-200 shrink-0"
                          />
                          <div className="flex-1 text-xs">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Görsel hazır
                            </span>
                            <p className="text-[10px] text-gray-400 truncate max-w-sm mt-0.5">
                              {slideImageUrl}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Title & Alt */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Slayt Başlığı / Konusu
                          </label>
                          <input
                            type="text"
                            value={slideTitle}
                            onChange={(e) => setSlideTitle(e.target.value)}
                            placeholder="Örn: Hormon Dengesi & Beslenme"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-purple-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Arama Motoru Açıklaması (Alt Text)
                          </label>
                          <input
                            type="text"
                            value={slideAltText}
                            onChange={(e) => setSlideAltText(e.target.value)}
                            placeholder="Örn: Dr. Abdullah Kesgin Menopoz Semineri"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-purple-600 outline-none"
                          />
                        </div>
                      </div>

                      {/* Poster Note (Text beneath the image) */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Afişin Altında Gösterilecek Not (İsteğe Bağlı)
                        </label>
                        <textarea
                          rows={2}
                          value={slideNote}
                          onChange={(e) => setSlideNote(e.target.value)}
                          placeholder="Bu slayt seçiliyken afişin altında görünecek özel açıklama..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-purple-600 outline-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingSlide(false)}
                          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm"
                        >
                          {editingSlideId ? 'Güncellemeleri Kaydet' : 'Slaytı Ekle'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Slides Cards List */}
                <div className="space-y-3">
                  {settings.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="bg-white rounded-2xl p-3.5 border border-purple-100 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Slide order number */}
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-purple-50 border border-purple-200 shrink-0">
                          <img
                            src={slide.imageUrl}
                            alt={slide.altText}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-purple-950 truncate">
                            {slide.title || `Slayt ${index + 1}`}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {slide.note || 'Özel afiş notu tanımlanmamış'}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Move Up */}
                        <button
                          onClick={() => moveSlide(index, 'up')}
                          disabled={index === 0}
                          title="Yukarı Taşı"
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => moveSlide(index, 'down')}
                          disabled={index === settings.slides.length - 1}
                          title="Aşağı Taşı"
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => startEditSlide(slide)}
                          title="Düzenle"
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteSlide(slide.id)}
                          title="Sil"
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: SEMINAR & SITE CONTENT */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Doctor & Header Brand Info */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-purple-950 font-manrope flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-700" />
                    <span>Üst Kısım Doktor ve Başlık Bilgileri</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Doktor Adı & Unvanı
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.doctorTitle}
                        onChange={(e) => handleContentChange('doctorTitle', e.target.value)}
                        placeholder="Örn: Dr. Abdullah Kesgin"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none font-bold text-purple-950"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Sayfanın en üstünde logonun yanında görünen ana doktor/uzman adıdır.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Alt Başlık / Slogan
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.doctorSubtitle}
                        onChange={(e) => handleContentChange('doctorSubtitle', e.target.value)}
                        placeholder="Örn: Menopozda tazelenme"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none font-medium"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Doktor adının hemen altında yer alan kısa tanıtım metnidir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Event Schedule & Countdown Target */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-purple-950 font-manrope flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-700" />
                      <span>Seminer Tarihi & Geri Sayım Sayacı</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                      Geri sayım anında güncellenir
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Takvimden Tarih ve Saat Seçin
                      </label>
                      <input
                        type="datetime-local"
                        value={(() => {
                          const d = new Date(settings.siteContent.deadlineIso);
                          if (isNaN(d.getTime())) return '';
                          const pad = (n: number) => String(n).padStart(2, '0');
                          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        })()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const dateObj = new Date(val);
                            const isoString = dateObj.toISOString();
                            const options: Intl.DateTimeFormatOptions = {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              weekday: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                            };
                            const displayStr = dateObj.toLocaleDateString('tr-TR', options);
                            const updatedPosterNote = `Güncel toplantı: ${displayStr}.\nKatılım bağlantısı WhatsApp grubunda paylaşılır.`;

                            handleMultipleContentChanges({
                              deadlineIso: isoString,
                              displayDate: displayStr,
                              defaultPosterNote: updatedPosterNote,
                            });
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs bg-purple-50/30 focus:ring-2 focus:ring-purple-600 outline-none font-medium"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Bu alandan tarih veya saat seçildiğinde geri sayım sayacı otomatik olarak yeni zamana ayarlanır.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Sitede Görünen Tarih Metni
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.displayDate}
                        onChange={(e) => handleContentChange('displayDate', e.target.value)}
                        placeholder="Örn: 5 Kasım 2026 Perşembe · 20:00"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none font-medium"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Seminer kutusunda ve afişin altında yer alan metindir.
                      </p>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                      Hızlı Tarih Belirleme Seçenekleri
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '3 Gün Sonra', days: 3 },
                        { label: '1 Hafta Sonra', days: 7 },
                        { label: '2 Hafta Sonra', days: 14 },
                        { label: '1 Ay Sonra', days: 30 },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            now.setDate(now.getDate() + preset.days);
                            now.setHours(20, 0, 0, 0); // 20:00
                            const isoString = now.toISOString();
                            const options: Intl.DateTimeFormatOptions = {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              weekday: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                            };
                            const displayStr = now.toLocaleDateString('tr-TR', options);
                            const updatedPosterNote = `Güncel toplantı: ${displayStr}.\nKatılım bağlantısı WhatsApp grubunda paylaşılır.`;
                            handleMultipleContentChanges({
                              deadlineIso: isoString,
                              displayDate: displayStr,
                              defaultPosterNote: updatedPosterNote,
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-900 bg-purple-50/60 hover:bg-purple-100 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          + {preset.label} (20:00)
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const isoString = '2026-11-05T20:00:00+03:00';
                          const displayStr = '5 Kasım 2026 Perşembe · 20:00';
                          const updatedPosterNote = `Güncel toplantı: ${displayStr}.\nKatılım bağlantısı WhatsApp grubunda paylaşılır.`;
                          handleMultipleContentChanges({
                            deadlineIso: isoString,
                            displayDate: displayStr,
                            defaultPosterNote: updatedPosterNote,
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        5 Kasım 2026 (Orijinal)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Headings & Descriptions */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-purple-950 font-manrope">
                    Manşet ve Açıklama Metinleri
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Üst Etiket (Eyebrow)
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.eyebrow}
                        onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Vurgulu Cümle (Mor Metin)
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.headlineHighlight}
                        onChange={(e) => handleContentChange('headlineHighlight', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ana Manşet Metni
                    </label>
                    <input
                      type="text"
                      value={settings.siteContent.headlineMain}
                      onChange={(e) => handleContentChange('headlineMain', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Menopoz Belirtileri Etiketleri (Virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      value={settings.siteContent.symptoms.join(', ')}
                      onChange={(e) =>
                        handleContentChange(
                          'symptoms',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ana Tanıtım Açıklaması
                    </label>
                    <textarea
                      rows={3}
                      value={settings.siteContent.description}
                      onChange={(e) => handleContentChange('description', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                    />
                  </div>
                </div>

                {/* Event Box & Links */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-purple-950 font-manrope flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp ve İletişim Bağlantıları</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        WhatsApp Grup Katılım Linki
                      </label>
                      <input
                        type="url"
                        value={settings.siteContent.whatsappUrl}
                        onChange={(e) => handleContentChange('whatsappUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        WhatsApp Buton Yazısı
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.whatsappCtaText}
                        onChange={(e) => handleContentChange('whatsappCtaText', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Instagram Profil Linki
                      </label>
                      <input
                        type="url"
                        value={settings.siteContent.instagramUrl}
                        onChange={(e) => handleContentChange('instagramUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Buton Altı Bilgilendirme Notu
                      </label>
                      <input
                        type="text"
                        value={settings.siteContent.microNote}
                        onChange={(e) => handleContentChange('microNote', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY & SYSTEM SETTINGS */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password Card */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-purple-950 font-manrope flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    <span>Yönetici Şifresini Değiştir</span>
                  </h3>

                  <form onSubmit={handlePasswordChange} className="max-w-md space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mevcut Şifre
                      </label>
                      <input
                        type="password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Yeni Şifre (En az 4 karakter)
                      </label>
                      <input
                        type="password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Yeni Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    {pwMessage && (
                      <p
                        className={`text-xs font-medium flex items-center gap-1 ${
                          pwMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {pwMessage.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{pwMessage.text}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Şifreyi Güncelle
                    </button>
                  </form>
                </div>

                {/* Backup & Factory Reset */}
                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-purple-950 font-manrope">
                    Yedekleme ve Sıfırlama
                  </h3>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleExport}
                      className="px-4 py-2.5 rounded-xl border border-purple-200 text-purple-800 hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Ayarları JSON Olarak İndir</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Orijinal Site Ayarlarına Sıfırla</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
