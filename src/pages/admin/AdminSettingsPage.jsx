import { useEffect, useState, useCallback } from 'react';
import { Save, RotateCcw, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import { HEX_COLOR_RE, applyTheme } from '../../context/StoreContext.jsx';

const TABS = [
  { id: 'store', label: 'Store' },
  { id: 'branding', label: 'Branding' },
  { id: 'theme', label: 'Theme' },
  { id: 'hero', label: 'Hero Slides' },
  { id: 'seo', label: 'SEO & Social' },
  { id: 'password', label: 'Security' },
];

const THEME_GROUPS = [
  {
    title: 'Brand',
    keys: [
      { key: 'primary', label: 'Primary' },
      { key: 'primaryDark', label: 'Primary (dark)' },
      { key: 'primaryDeep', label: 'Primary (deep)' },
      { key: 'primarySoft', label: 'Primary (soft)' },
      { key: 'accent', label: 'Accent' },
      { key: 'accentDark', label: 'Accent (dark)' },
      { key: 'accentSoft', label: 'Accent (soft)' },
    ],
  },
  {
    title: 'Background & Surfaces',
    keys: [
      { key: 'bg', label: 'Page background' },
      { key: 'bgDeep', label: 'Page background (deep)' },
      { key: 'surface', label: 'Card / surface' },
      { key: 'surface2', label: 'Surface (alt)' },
    ],
  },
  {
    title: 'Text',
    keys: [
      { key: 'ink', label: 'Primary text' },
      { key: 'inkSoft', label: 'Secondary text' },
      { key: 'inkMuted', label: 'Muted text' },
    ],
  },
  {
    title: 'Borders',
    keys: [
      { key: 'line', label: 'Border' },
      { key: 'lineStrong', label: 'Border (strong)' },
    ],
  },
  {
    title: 'Status colors',
    keys: [
      { key: 'wa', label: 'WhatsApp button' },
      { key: 'waDark', label: 'WhatsApp (dark)' },
      { key: 'waSoft', label: 'WhatsApp (soft)' },
      { key: 'success', label: 'Success / in stock' },
      { key: 'successSoft', label: 'Success (soft)' },
      { key: 'warning', label: 'Warning / low stock' },
      { key: 'warningSoft', label: 'Warning (soft)' },
      { key: 'danger', label: 'Danger / out of stock' },
      { key: 'dangerSoft', label: 'Danger (soft)' },
    ],
  },
];

function ThemeField({ label, value, onChange }) {
  const safeValue = HEX_COLOR_RE.test(value || '') ? value : '#000000';
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <div className="theme-field">
        <input
          type="color"
          className="theme-field__swatch"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          className="input"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#rrggbb"
          maxLength={7}
        />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('store');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [resetDialog, setResetDialog] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdBusy, setPwdBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/settings')
      .then((res) => {
        setSettings(res.data);
        applyTheme(res.data?.theme);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }));
  const setNested = (objKey, key, val) =>
    setSettings((s) => ({ ...s, [objKey]: { ...(s[objKey] || {}), [key]: val } }));

  const setThemeColor = (key, val) => {
    setNested('theme', key, val);
    applyTheme({ [key]: val });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      setSettings(res.data);
      applyTheme(res.data?.theme);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = async () => {
    setResetDialog(false);
    try {
      const res = await api.post('/admin/settings/reset', {});
      setSettings(res.data);
      applyTheme(res.data?.theme);
      toast.success('Restored defaults');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      toast.error('New password and confirm do not match');
      return;
    }
    if (pwd.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwdBusy(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPwdBusy(false);
    }
  };

  const setHero = (i, key, val) =>
    setSettings((s) => {
      const slides = (s.heroSlides || []).map((slide, idx) => (idx === i ? { ...slide, [key]: val } : slide));
      return { ...s, heroSlides: slides };
    });

  const addSlide = () =>
    setSettings((s) => ({
      ...s,
      heroSlides: [
        ...(s.heroSlides || []),
        { title: 'New Slide', subtitle: 'Subtitle goes here', ctaText: 'Shop Now', ctaLink: '/shop', image: '' },
      ],
    }));

  const removeSlide = (i) =>
    setSettings((s) => ({
      ...s,
      heroSlides: (s.heroSlides || []).filter((_, idx) => idx !== i),
    }));

  if (loading) return <div className="page-state"><div className="spinner" /></div>;
  if (error)
    return (
      <div className="page-state">
        <p className="page-state__text">{error}</p>
        <button type="button" className="btn btn--outline" onClick={load}>Retry</button>
      </div>
    );

  return (
    <form onSubmit={onSave}>
      <div className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Settings</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setResetDialog(true)}>
              <RotateCcw size={14} /> Defaults
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`tabs__tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'store' && (
          <div className="settings-grid">
            <div className="field">
              <label className="field__label">Store name</label>
              <input className="input" value={settings.storeName ?? ''} onChange={(e) => set('storeName', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Tagline</label>
              <input className="input" value={settings.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">WhatsApp number (country code + digits, no spaces or +)</label>
              <input className="input" value={settings.whatsappNumber ?? ''} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="e.g. 923001234567" />
            </div>
            <div className="field">
              <label className="field__label">Phone (display)</label>
              <input className="input" value={settings.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="e.g. +92 300 1234567" />
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input className="input" value={settings.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Address</label>
              <input className="input" value={settings.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Currency</label>
              <select className="select" value={settings.currency || 'PKR'} onChange={(e) => set('currency', e.target.value)}>
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label">About text</label>
              <textarea className="input" rows={5} value={settings.about ?? ''} onChange={(e) => set('about', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Announcement (leave empty to hide)</label>
              <input className="input" value={settings.announcement ?? ''} onChange={(e) => set('announcement', e.target.value)} placeholder="e.g. Free delivery on orders over 5000 PKR" />
            </div>
          </div>
        )}

        {tab === 'branding' && (
          <div className="settings-grid" style={{ marginTop: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }} className="section-label">Store logo</div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label">
                Logo <span className="field__req">*</span> (shown in the site header, footer and admin panel)
              </label>
              <ImageUploader
                images={settings.logo ? [settings.logo] : []}
                onChange={(imgs) => set('logo', imgs[0] || '')}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }} className="section-label">Favicon</div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label">
                Favicon <span className="field__req">*</span> (browser tab icon) — square PNG or SVG, ideally 64×64 or larger
              </label>
              <ImageUploader
                images={settings.favicon ? [settings.favicon] : []}
                onChange={(imgs) => set('favicon', imgs[0] || '')}
              />
              <p className="field__hint">Leave empty to use the default AMS icon. Remove an image using its × button to clear it.</p>
            </div>
          </div>
        )}

        {tab === 'theme' && (
          <div style={{ marginTop: '1rem' }}>
            <p className="field__hint" style={{ marginBottom: '1.2rem' }}>
              Colors preview live across the site as you pick them. Click Save Changes to make them permanent, or use Defaults above to restore the original palette.
            </p>
            {THEME_GROUPS.map((group) => (
              <div key={group.title} style={{ marginBottom: '1.6rem' }}>
                <div className="section-label" style={{ marginBottom: '0.8rem' }}>{group.title}</div>
                <div className="settings-grid">
                  {group.keys.map(({ key, label }) => (
                    <ThemeField
                      key={key}
                      label={label}
                      value={settings.theme?.[key]}
                      onChange={(val) => setThemeColor(key, val)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
            {settings.heroSlides?.map((slide, i) => (
              <div key={i} className="hero-slide-editor">
                <div className="panel__head">
                  <h3>Slide {i + 1}</h3>
                  <button type="button" className="mini-btn mini-btn--danger" aria-label="Remove slide" onClick={() => removeSlide(i)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="settings-grid">
                  <div className="field">
                    <label className="field__label">Title</label>
                    <input className="input" value={slide.title ?? ''} onChange={(e) => setHero(i, 'title', e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label">Subtitle</label>
                    <input className="input" value={slide.subtitle ?? ''} onChange={(e) => setHero(i, 'subtitle', e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label">CTA text</label>
                    <input className="input" value={slide.ctaText ?? ''} onChange={(e) => setHero(i, 'ctaText', e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label">CTA link (e.g. /shop, /summer-collection)</label>
                    <input className="input" value={slide.ctaLink ?? ''} onChange={(e) => setHero(i, 'ctaLink', e.target.value)} />
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label className="field__label">Background image</label>
                    <ImageUploader
                      images={slide.image ? [slide.image] : []}
                      onChange={(imgs) => setHero(i, 'image', imgs[0] || '')}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div>
              <button type="button" className="btn btn--outline btn--sm" onClick={addSlide}>
                <Plus size={15} /> Add Slide
              </button>
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="settings-grid" style={{ marginTop: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }} className="section-label">SEO</div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label">SEO title (default page title)</label>
              <input className="input" value={settings.seo?.title ?? ''} onChange={(e) => setNested('seo', 'title', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label">SEO description (meta description)</label>
              <textarea className="input" rows={3} value={settings.seo?.description ?? ''} onChange={(e) => setNested('seo', 'description', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label">SEO keywords (comma separated)</label>
              <input className="input" value={settings.seo?.keywords ?? ''} onChange={(e) => setNested('seo', 'keywords', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }} className="section-label">Social links</div>
            <div className="field">
              <label className="field__label">Instagram</label>
              <input className="input" value={settings.social?.instagram ?? ''} onChange={(e) => setNested('social', 'instagram', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Facebook</label>
              <input className="input" value={settings.social?.facebook ?? ''} onChange={(e) => setNested('social', 'facebook', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">TikTok</label>
              <input className="input" value={settings.social?.tiktok ?? ''} onChange={(e) => setNested('social', 'tiktok', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">YouTube</label>
              <input className="input" value={settings.social?.youtube ?? ''} onChange={(e) => setNested('social', 'youtube', e.target.value)} />
            </div>
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} style={{ maxWidth: 460, marginTop: '1rem' }}>
            <div className="field">
              <label className="field__label" htmlFor="cur">Current password</label>
              <input id="cur" className="input" type="password" autoComplete="current-password" value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="newpw">New password</label>
              <div style={{ position: 'relative' }}>
                <input id="newpw" className="input" type={showPwd ? 'text' : 'password'} autoComplete="new-password" value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} required style={{ paddingRight: '2.6rem' }} />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPwd((s) => !s)} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="confpw">Confirm new password</label>
              <input id="confpw" className="input" type="password" autoComplete="new-password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn--primary" disabled={pwdBusy}>
              {pwdBusy ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        )}
      </div>

      <ConfirmDialog
        open={resetDialog}
        title="Restore defaults?"
        text="All store settings, theme colors, hero slides and social links will be replaced with defaults."
        confirmLabel="Restore"
        onConfirm={resetDefaults}
        onCancel={() => setResetDialog(false)}
      />
    </form>
  );
}