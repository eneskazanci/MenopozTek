export interface Slide {
  id: string;
  imageUrl: string;
  altText: string;
  note?: string;
  title?: string;
  caption?: string;
}

export interface SliderConfig {
  enabled: boolean;
  autoplay: boolean;
  interval: number; // in seconds
  effect: 'fade' | 'slide';
  showArrows: boolean;
  showDots: boolean;
  pauseOnHover: boolean;
  mobilePosition?: 'after-description' | 'top' | 'bottom';
}

export interface SiteContent {
  doctorTitle: string;
  doctorSubtitle: string;
  instagramUrl: string;
  eyebrow: string;
  headlineMain: string;
  headlineHighlight: string;
  symptoms: string[];
  description: string;
  seminarBadge: string;
  seminarTitle: string;
  deadlineIso: string;
  displayDate: string;
  seminarDetails: string;
  whatsappUrl: string;
  whatsappCtaText: string;
  microNote: string;
  defaultPosterNote: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

export interface AdminSettings {
  passwordHash: string; // or plain for lightweight local admin
  sliderConfig: SliderConfig;
  slides: Slide[];
  siteContent: SiteContent;
  updatedAt?: string;
}
