import { AlertTriangle, Bell, Clock, Cloud, Download, Laptop, Moon, Settings, Sparkles, Sun, Type, Upload, X } from 'lucide-react';
import { FONT_SIZE_OPTIONS } from '../../data/constants';
import { savePushApiUrl } from '../../pushNotifications';
import { getAppDayString } from '../../utils/date';
import { useI18n } from '../../i18n-context';

export default function SettingsModal({
  isOpen, onClose, currentFontConfig, tStyle, categories,
  theme, setTheme, fontSizeLevel, setFontSizeLevel,
  resetTime, setResetTime, todayStr, setTodayStr, setSelectedDate,
  notificationStatus, testNotification,
  pushApiUrl, setPushApiUrl, pushStatus, pushMessage, enableFullPush, disableFullPush,
  isGoogleAuthorized, handleAuthClick, handleSignoutClick,
  autoBackupEnabled, setAutoBackupEnabled, backupToGoogleDrive, restoreFromGoogleDrive, googleBackupStatus,
  exportDataToJson, importFileRef, importDataFromJson, setShowResetConfirmModal, onStartOnboarding,
}) {
  const { language, setLanguage, t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border space-y-6 ' + tStyle.modalBg}>
        <div className="flex justify-between items-center pb-3 border-b border-slate-500/20">
          <div className="flex items-center gap-2"><Settings className="w-5 h-5 text-emerald-500" /><h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{t('Ustawienia aplikacji')}</h3></div>
          <button onClick={onClose} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg} title={t('Zamknij')}><X className="w-5 h-5" /></button>
        </div>

        <div>
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>{t('Język aplikacji')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setLanguage('pl')} className={'rounded-2xl border p-3 font-bold transition-all ' + currentFontConfig.smallClass + ' ' + (language === 'pl' ? tStyle.optSelected : tStyle.optUnselected)}>🇵🇱 {t('Polski')}</button>
            <button type="button" onClick={() => setLanguage('en')} className={'rounded-2xl border p-3 font-bold transition-all ' + currentFontConfig.smallClass + ' ' + (language === 'en' ? tStyle.optSelected : tStyle.optUnselected)}>🇬🇧 {t('Angielski')}</button>
          </div>
        </div>

        <button onClick={onStartOnboarding} className={'w-full p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center gap-2 ' + currentFontConfig.smallClass}>
          <Sparkles className="w-5 h-5" /> {t('Uruchom przewodnik powitalny')}
        </button>

        <div>
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>{t('Kategorie (Zablokowane z Kreatorem)')}</label>
          <div className="space-y-2 mb-3">
            {categories.map(category => (
              <div key={category.id} className={'flex items-center justify-between p-3 rounded-2xl border ' + tStyle.cardBg}>
                <span className={currentFontConfig.smallClass + ' px-3 py-1 rounded-full border font-bold ' + category.color}>{t(category.label)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>{t('Wygląd aplikacji')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setTheme('light')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'light' ? tStyle.optSelected : tStyle.optUnselected)}><Sun className="w-4 h-4" /><span>{t('Jasny')}</span></button>
            <button onClick={() => setTheme('dark')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'dark' ? tStyle.optSelected : tStyle.optUnselected)}><Moon className="w-4 h-4" /><span>{t('Ciemny')}</span></button>
            <button onClick={() => setTheme('system')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'system' ? tStyle.optSelectedInfo : tStyle.optUnselected)}><Laptop className="w-4 h-4" /><span>{t('Systemowy')}</span></button>
            <button onClick={() => setTheme('gold')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'gold' ? tStyle.optSelectedWarning : tStyle.optUnselected)}><Sparkles className="w-4 h-4" /><span>{t('Prestiż')}</span></button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-500/20">
          <div className="flex justify-between items-center mb-2">
            <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 ' + tStyle.subText}><Type className="w-4 h-4 text-emerald-500" /> {t('Rozmiar tekstu')}</label>
            <span className={currentFontConfig.smallClass + ' md:text-sm font-bold text-emerald-500'}>{t(FONT_SIZE_OPTIONS.find(option => option.level === fontSizeLevel)?.name)}</span>
          </div>
          <input type="range" min="1" max="6" step="1" value={fontSizeLevel} onChange={event => setFontSizeLevel(parseInt(event.target.value, 10))} className="w-full accent-emerald-500 cursor-pointer h-2.5 bg-slate-500/20 rounded-lg" />
        </div>

        <div className="pt-2 border-t border-slate-500/20">
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 mb-2 ' + tStyle.subText}><Clock className="w-4 h-4 text-emerald-500" /> {t('Godzina restartu dnia')}</label>
          <input type="time" value={resetTime} onChange={event => {
            const newTime = event.target.value;
            setResetTime(newTime);
            localStorage.setItem('discipline_reset_time', newTime);
            const newToday = getAppDayString(newTime);
            if (newToday !== todayStr) {
              setTodayStr(newToday);
              setSelectedDate(newToday);
            }
          }} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
        </div>

        <div className="pt-4 border-t border-slate-500/20">
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 mb-2 ' + tStyle.subText}><Bell className="w-4 h-4 text-emerald-500" /> {t('Powiadomienia')}</label>
          <p className={currentFontConfig.smallClass + ' mb-3 ' + tStyle.subText}>
            {notificationStatus === 'granted' && t('Powiadomienia są włączone.')}
            {notificationStatus === 'default' && t('Powiadomienia nie zostały jeszcze włączone.')}
            {notificationStatus === 'denied' && t('Powiadomienia są zablokowane. Włącz je w Ustawieniach iPhone’a dla aplikacji SamoDyscyplina.')}
            {notificationStatus === 'ios-browser' && t('Na iPhonie uruchom aplikację z ikony dodanej do ekranu początkowego.')}
            {notificationStatus === 'unsupported' && t('To urządzenie lub przeglądarka nie obsługuje powiadomień PWA.')}
          </p>
          {notificationStatus !== 'denied' && notificationStatus !== 'ios-browser' && notificationStatus !== 'unsupported' && (
            <button onClick={testNotification} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 py-3 rounded-2xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" /> {notificationStatus === 'granted' ? t('Wyślij powiadomienie testowe') : t('Włącz i przetestuj powiadomienia')}
            </button>
          )}
          <div className="mt-4 pt-4 border-t border-slate-500/20 space-y-3">
            <label className={currentFontConfig.smallClass + ' font-medium block ' + tStyle.subText}>{t('Adres usługi push (Cloudflare Worker)')}</label>
            <input type="url" value={pushApiUrl} onChange={event => setPushApiUrl(event.target.value)} onBlur={() => savePushApiUrl(pushApiUrl)} placeholder="https://samodyscyplina-push...workers.dev" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.smallClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
            {pushStatus === 'enabled'
              ? <button onClick={disableFullPush} className="w-full bg-red-500/10 text-red-500 border border-red-500/30 py-3 rounded-2xl font-bold">{t('Wyłącz powiadomienia w tle')}</button>
              : <button onClick={enableFullPush} disabled={!pushApiUrl.trim()} className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><Cloud className="w-5 h-5" /> {t('Włącz powiadomienia w tle')}</button>}
            {pushMessage && <p className={currentFontConfig.smallClass + ' ' + (pushMessage.startsWith('❌') ? 'text-red-500' : 'text-emerald-500')}>{pushMessage}</p>}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-500/20">
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 mb-3 ' + tStyle.subText}><Laptop className="w-4 h-4 text-emerald-500" /> {t('Kopia zapasowa Google Drive')}</label>
          {!isGoogleAuthorized ? (
            <button onClick={handleAuthClick} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-2xl border border-slate-300 dark:border-slate-600 font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm">{t('Połącz z Google')}</button>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-500/20">
                <span className={currentFontConfig.smallClass + ' ' + tStyle.titleText}>{t('Automatyczna kopia zapasowa')}</span>
                <input type="checkbox" checked={autoBackupEnabled} onChange={event => { setAutoBackupEnabled(event.target.checked); localStorage.setItem('discipline_auto_backup', String(event.target.checked)); }} className="w-5 h-5 accent-emerald-500" />
              </label>
              <div className="flex gap-2">
                <button onClick={() => backupToGoogleDrive()} className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-900 py-3 rounded-2xl font-bold transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 shadow-md">{t('Zrób Kopię')}</button>
                <button onClick={restoreFromGoogleDrive} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-2xl font-bold transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 shadow-md">{t('Przywróć')}</button>
              </div>
              <button onClick={handleSignoutClick} className="w-full text-xs font-bold text-red-500 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">{t('Rozłącz Google')}</button>
            </div>
          )}
          {googleBackupStatus && <div className="mt-3 text-center font-bold text-sm text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">{googleBackupStatus}</div>}
        </div>

        <div className="pt-4 border-t border-slate-500/20">
          <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 mb-3 ' + tStyle.subText}><Download className="w-4 h-4 text-emerald-500" /> {t('Eksport i import danych')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={exportDataToJson} className="py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold flex items-center justify-center gap-2"><Download className="w-4 h-4" /> {t('Eksportuj dane')}</button>
            <button onClick={() => importFileRef.current?.click()} className="py-3 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-500 font-bold flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> {t('Importuj dane')}</button>
          </div>
          <input ref={importFileRef} type="file" accept="application/json,.json" onChange={importDataFromJson} className="hidden" />
        </div>

        <div className="pt-4 border-t border-slate-500/20">
          <button onClick={() => setShowResetConfirmModal(true)} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-3 rounded-2xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> {t('Wyczyść wszystkie dane (Reset)')}</button>
        </div>

        <button onClick={onClose} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 mt-2">{t('Zamknij')}</button>
      </div>
    </div>
  );
}
