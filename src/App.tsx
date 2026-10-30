/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminSettings } from './types';
import { loadSettings, saveSettings } from './data/defaults';
import { CountdownTimer } from './components/CountdownTimer';
import { ImageSlider } from './components/ImageSlider';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadSettings());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 860;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keep settings synchronized
  const handleUpdateSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const { siteContent, sliderConfig, slides } = settings;

  // Split headline lines gracefully
  const headlineParts = siteContent.headlineMain.split('\n');

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-purple-200 selection:text-purple-900">
      <main className="page">
        {/* EXACT HEADER */}
        <header className="header">
          <div className="brand">
            <span className="mark" aria-hidden="true">
              ✳
            </span>
            <div>
              <strong>{siteContent.doctorTitle}</strong>
              <small>{siteContent.doctorSubtitle}</small>
            </div>
          </div>

          <a
            className="instagram"
            href={siteContent.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${siteContent.doctorTitle} Instagram`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
            </svg>
            <span>Instagram</span>
          </a>
        </header>

        {/* EXACT CARD */}
        <section className="card">
          {/* CONTENT SECTION */}
          <div className="content">
            {/* MOBILE ART SECTION (IF TOP) */}
            {isMobile && sliderConfig.mobilePosition === 'top' && (
              <div className="mobile-art-wrapper">
                <ImageSlider
                  slides={slides}
                  config={sliderConfig}
                  defaultNote={siteContent.defaultPosterNote}
                />
              </div>
            )}

            <p className="eyebrow">{siteContent.eyebrow}</p>

            <h1>
              {headlineParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index < headlineParts.length - 1 && <br />}
                </React.Fragment>
              ))}
              <br />
              <span>{siteContent.headlineHighlight}</span>
            </h1>

            {/* SYMPTOMS PILLS */}
            <div className="symptoms" aria-label="Menopozda yaşanabilen zorluklar">
              {siteContent.symptoms.map((symptom, idx) => (
                <span key={idx}>{symptom}</span>
              ))}
            </div>

            <p className="description">{siteContent.description}</p>

            {/* MOBILE ART SECTION (DEFAULT / RECOMMENDED: AFTER DESCRIPTION & SYMPTOMS) */}
            {isMobile && (!sliderConfig.mobilePosition || sliderConfig.mobilePosition === 'after-description') && (
              <div className="mobile-art-wrapper">
                <ImageSlider
                  slides={slides}
                  config={sliderConfig}
                  defaultNote={siteContent.defaultPosterNote}
                />
              </div>
            )}

            {/* EVENT BOX */}
            <div className="event">
              <small>{siteContent.seminarBadge}</small>
              <h2>{siteContent.seminarTitle}</h2>
              <time
                className="meeting-date"
                dateTime={siteContent.deadlineIso}
              >
                {siteContent.displayDate}
              </time>
              <p className="whitespace-pre-line">{siteContent.seminarDetails}</p>
            </div>

            {/* COUNTDOWN TIMER - Keyed by deadlineIso for instantaneous update */}
            <CountdownTimer
              key={siteContent.deadlineIso}
              deadlineIso={siteContent.deadlineIso}
            />

            {/* CTA BUTTON */}
            <a
              className="cta"
              href={siteContent.whatsappUrl}
              data-track="whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp grubuna katıl"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.8A8.5 8.5 0 1 1 20.5 11.5Z" />
                <path d="M8.5 7.5c-.6 2.6 2 5.6 5.1 6.6l1.8-1.6-2-1.2-.9.7-2-2 .6-.9-1.1-1.9Z" />
              </svg>
              <span className="cta-label">{siteContent.whatsappCtaText}</span>
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <p className="micro">{siteContent.microNote}</p>

            {/* MOBILE ART SECTION (IF BOTTOM) */}
            {isMobile && sliderConfig.mobilePosition === 'bottom' && (
              <div className="mobile-art-wrapper">
                <ImageSlider
                  slides={slides}
                  config={sliderConfig}
                  defaultNote={siteContent.defaultPosterNote}
                />
              </div>
            )}
          </div>

          {/* DESKTOP ART & SLIDER SECTION */}
          {!isMobile && (
            <div className="desktop-art-wrapper">
              <ImageSlider
                slides={slides}
                config={sliderConfig}
                defaultNote={siteContent.defaultPosterNote}
              />
            </div>
          )}
        </section>

        {/* EXACT FOOTER */}
        <footer className="bottom">
          {siteContent.footerLeft} <span></span> {siteContent.footerCenter} <span></span> {siteContent.footerRight}
        </footer>

        {/* ADMIN TRIGGER: ONLY GEAR ICON */}
        <div className="admin-bar-wrap">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-purple-900/40 hover:text-purple-900 bg-purple-100/40 hover:bg-purple-100 border border-purple-200/40 hover:border-purple-300 transition-all duration-300 hover:rotate-90 shadow-2xs cursor-pointer"
            title="Yönetici Paneli"
            aria-label="Yönetici Paneli"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ADMIN MODAL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
