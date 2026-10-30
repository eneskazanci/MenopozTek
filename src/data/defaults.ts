import { AdminSettings, SiteContent, Slide, SliderConfig } from '../types';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  doctorTitle: 'Dr. Abdullah Kesgin',
  doctorSubtitle: 'Menopozda tazelenme',
  instagramUrl: 'https://www.instagram.com/dr.abdullahkesgin/',
  eyebrow: 'Kendinize iyi gelecek bir adım',
  headlineMain: '“Eskisi gibi\nhissetmiyorum…”',
  headlineHighlight: 'Yalnız değilsiniz.',
  symptoms: ['Sıcak basmaları', 'Uykusuz geceler', 'Yorgunluk'],
  description: 'Bedeniniz değişirken aklınızdaki sorular çoğalabilir. Menopozu birlikte konuşalım, merak ettiklerinizi uzmanlara sorun.',
  seminarBadge: 'ÜCRETSİZ TANITIM SEMİNERİ',
  seminarTitle: 'Kadın sağlığı & menopoz',
  deadlineIso: '2026-11-05T20:00:00+03:00',
  displayDate: '5 Kasım 2026 Perşembe · 20:00',
  seminarDetails: 'Grup toplantısı, soru-cevap ve sonrasında\nbire bir sorularınız için takip süreci.',
  whatsappUrl: 'https://chat.whatsapp.com/KEKwdXR5c1PAIrmCiB77f5',
  whatsappCtaText: 'WhatsApp grubuna katıl',
  microNote: 'Ücretsiz katılım · Güncel toplantı duyuruları grupta',
  defaultPosterNote: 'Güncel toplantı: 5 Kasım 2026 Perşembe · 20:00.\nKatılım bağlantısı WhatsApp grubunda paylaşılır.',
  footerLeft: 'Sorularınızı paylaşın',
  footerCenter: 'Bilgi edinin',
  footerRight: 'Birlikte ilerleyin',
};

export const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    imageUrl: '/images/uploads/cover-7c448a4e13ef72a09fe6.jpg',
    altText: 'Kadın sağlığı ve menopoz tanıtım semineri afişi - Dr. Abdullah Kesgin',
    title: 'Kadın Sağlığı & Menopoz Semineri',
    note: 'Güncel toplantı: 5 Kasım 2026 Perşembe · 20:00.\nKatılım bağlantısı WhatsApp grubunda paylaşılır.',
  },
  {
    id: 'slide-2',
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1000&q=80',
    altText: 'Bütünsel beslenme ve hormonal denge - Menopoz rehberi',
    title: 'Hormonal Denge & Fitoöstrojenler',
    note: 'Doğal fitoöstrojen destekleri ve metabolizmayı canlandıran beslenme modelleri ile enerjinizi geri kazanın.',
  },
  {
    id: 'slide-3',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    altText: 'Kas ve kemik sağlığı, sarkopeni ve osteoporoz önleme',
    title: 'Kemik & Kas Sağlığı (Osteoporoz Koruması)',
    note: 'Sarkopeni ve kemik erimesine karşı bireysel hareket ve mineral dengesi protokolleri.',
  },
  {
    id: 'slide-4',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
    altText: 'Dr. Abdullah Kesgin ile canlı soru cevap ve takip',
    title: 'Bire Bir Takip & Canlı Soru-Cevap',
    note: 'Seminer sonrasında aklınıza takılan tüm soruları hekimimize yöneltme ve yol haritası çizme fırsatı.',
  },
];

export const DEFAULT_SLIDER_CONFIG: SliderConfig = {
  enabled: true,
  autoplay: true,
  interval: 5,
  effect: 'fade',
  showArrows: true,
  showDots: true,
  pauseOnHover: true,
  mobilePosition: 'after-description',
};

export const DEFAULT_ADMIN_PASSWORD = 'Menopoz8080*';

const STORAGE_KEY = 'menopoz_drabdullahkesgin_settings_v1';

export function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        passwordHash: DEFAULT_ADMIN_PASSWORD,
        sliderConfig: DEFAULT_SLIDER_CONFIG,
        slides: DEFAULT_SLIDES,
        siteContent: DEFAULT_SITE_CONTENT,
      };
    }
    const parsed = JSON.parse(raw);
    const resolvedPassword =
      !parsed.passwordHash || parsed.passwordHash === 'admin'
        ? DEFAULT_ADMIN_PASSWORD
        : parsed.passwordHash;

    const loadedSettings: AdminSettings = {
      passwordHash: resolvedPassword,
      sliderConfig: { ...DEFAULT_SLIDER_CONFIG, ...(parsed.sliderConfig || {}) },
      slides: parsed.slides && parsed.slides.length > 0 ? parsed.slides : DEFAULT_SLIDES,
      siteContent: { ...DEFAULT_SITE_CONTENT, ...(parsed.siteContent || {}) },
    };

    // If migrating from legacy default password, persist the new password
    if (parsed.passwordHash === 'admin') {
      saveSettings(loadedSettings);
    }

    return loadedSettings;
  } catch (e) {
    console.error('Failed to load settings from storage', e);
    return {
      passwordHash: DEFAULT_ADMIN_PASSWORD,
      sliderConfig: DEFAULT_SLIDER_CONFIG,
      slides: DEFAULT_SLIDES,
      siteContent: DEFAULT_SITE_CONTENT,
    };
  }
}

export function saveSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage', e);
  }
}

export function resetSettings(): AdminSettings {
  const fresh: AdminSettings = {
    passwordHash: DEFAULT_ADMIN_PASSWORD,
    sliderConfig: DEFAULT_SLIDER_CONFIG,
    slides: DEFAULT_SLIDES,
    siteContent: DEFAULT_SITE_CONTENT,
  };
  saveSettings(fresh);
  return fresh;
}
