import React, { useState, useEffect } from 'react'
import { Palette, Save, RotateCcw, Eye, Code, Sliders, Moon, Sun, Monitor, Check, Copy } from 'lucide-react'
import { toast } from 'react-hot-toast'

// ─── Default theme tokens ──────────────────────────────────────────────────────
const DEFAULT_THEME = {
  // Brand colors
  colorPurple: '#7c3aed',
  colorCyan: '#00d4ff',
  colorEmerald: '#10b981',
  colorAmber: '#f59e0b',
  colorRed: '#ef4444',
  colorBlue: '#0080ff',

  // Backgrounds
  bgBase: '#08090f',
  bgLayer2: '#0d0e1a',
  bgLayer3: '#12131f',
  bgCard: '#0f1020',

  // Text
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  textFaint: '#334155',

  // Border
  borderColor: 'rgba(255,255,255,0.07)',

  // Gradient
  gradFrom: '#7c3aed',
  gradTo: '#00d4ff',

  // Layout
  borderRadius: '12',
  sidebarWidth: '260',
  fontFamily: 'Outfit',
}

const PRESET_THEMES = [
  {
    name: 'Midnight Purple', key: 'purple',
    colors: { bgBase: '#08090f', bgLayer2: '#0d0e1a', colorPurple: '#7c3aed', colorCyan: '#00d4ff', gradFrom: '#7c3aed', gradTo: '#00d4ff' }
  },
  {
    name: 'Ocean Blue', key: 'blue',
    colors: { bgBase: '#050c1a', bgLayer2: '#081020', colorPurple: '#0080ff', colorCyan: '#00cfff', gradFrom: '#0080ff', gradTo: '#00cfff' }
  },
  {
    name: 'Emerald Dark', key: 'emerald',
    colors: { bgBase: '#030f0b', bgLayer2: '#071410', colorPurple: '#10b981', colorCyan: '#34d399', gradFrom: '#059669', gradTo: '#34d399' }
  },
  {
    name: 'Saffron India', key: 'saffron',
    colors: { bgBase: '#0f0900', bgLayer2: '#1a0f00', colorPurple: '#f59e0b', colorCyan: '#fb923c', gradFrom: '#f59e0b', gradTo: '#fb923c' }
  },
  {
    name: 'Rose Red', key: 'rose',
    colors: { bgBase: '#0f060a', bgLayer2: '#180a10', colorPurple: '#f43f5e', colorCyan: '#fb7185', gradFrom: '#e11d48', gradTo: '#fb7185' }
  },
]

const FONT_OPTIONS = ['Outfit', 'Inter', 'Roboto', 'Poppins', 'Nunito', 'Raleway', 'Space Grotesk']

function ColorPicker({ label, value, onChange, description }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block' }}>{label}</label>
          {description && <div style={{ fontSize: '0.68rem', color: 'var(--text-4)' }}>{description}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: 90, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-2)', fontFamily: 'monospace', outline: 'none' }}
          />
          <div style={{ position: 'relative' }}>
            <input
              type="color"
              value={value.startsWith('rgba') ? '#7c3aed' : value}
              onChange={e => onChange(e.target.value)}
              style={{ width: 32, height: 32, borderRadius: 8, border: '2px solid var(--border)', cursor: 'pointer', overflow: 'hidden', padding: 2, background: 'var(--bg-3)' }}
            />
          </div>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: `linear-gradient(90deg,${value},${value}88)` }} />
    </div>
  )
}

function SliderInput({ label, value, onChange, min = 4, max = 24, unit = 'px' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' }}>{label}</label>
        <span style={{ fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', accentColor: 'var(--purple)' }}
      />
    </div>
  )
}

export default function AdminTheme() {
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [activeTab, setActiveTab] = useState('colors')
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cssOutput, setCssOutput] = useState('')

  // Load saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('prepbridge_admin_theme')
    if (saved) setTheme(JSON.parse(saved))
  }, [])

  // Build CSS vars string and inject into page root
  useEffect(() => {
    if (!preview) return
    const root = document.documentElement
    root.style.setProperty('--purple', theme.colorPurple)
    root.style.setProperty('--cyan', theme.colorCyan)
    root.style.setProperty('--emerald', theme.colorEmerald)
    root.style.setProperty('--amber', theme.colorAmber)
    root.style.setProperty('--red', theme.colorRed)
    root.style.setProperty('--bg', theme.bgBase)
    root.style.setProperty('--bg-2', theme.bgLayer2)
    root.style.setProperty('--bg-3', theme.bgLayer3)
    root.style.setProperty('--text-1', theme.textPrimary)
    root.style.setProperty('--text-2', theme.textSecondary)
    root.style.setProperty('--text-3', theme.textMuted)
    root.style.setProperty('--r-md', `${theme.borderRadius}px`)
    root.style.setProperty('--grad', `linear-gradient(135deg,${theme.gradFrom},${theme.gradTo})`)
  }, [theme, preview])

  const generateCSS = () => {
    const css = `:root {\n  --purple: ${theme.colorPurple};\n  --cyan: ${theme.colorCyan};\n  --emerald: ${theme.colorEmerald};\n  --amber: ${theme.colorAmber};\n  --red: ${theme.colorRed};\n  --blue: ${theme.colorBlue};\n  --bg: ${theme.bgBase};\n  --bg-2: ${theme.bgLayer2};\n  --bg-3: ${theme.bgLayer3};\n  --text-1: ${theme.textPrimary};\n  --text-2: ${theme.textSecondary};\n  --text-3: ${theme.textMuted};\n  --text-4: ${theme.textFaint};\n  --border: ${theme.borderColor};\n  --grad: linear-gradient(135deg, ${theme.gradFrom}, ${theme.gradTo});\n  --r-md: ${theme.borderRadius}px;\n  --r-xl: ${parseInt(theme.borderRadius) + 8}px;\n  --r-full: 9999px;\n  --sidebar-w: ${theme.sidebarWidth}px;\n}`
    setCssOutput(css)
    setActiveTab('css')
  }

  const handleSave = () => {
    localStorage.setItem('prepbridge_admin_theme', JSON.stringify(theme))
    setSaved(true)
    toast.success('Theme saved! Changes apply to all users immediately.')
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setTheme(DEFAULT_THEME)
    localStorage.removeItem('prepbridge_admin_theme')
    toast('Theme reset to defaults')
  }

  const applyPreset = (preset) => {
    setTheme(t => ({ ...t, ...preset.colors }))
    toast.success(`Applied "${preset.name}" theme!`)
  }

  const update = (key) => (val) => setTheme(t => ({ ...t, [key]: val }))

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Palette size={24} color="var(--purple)" /> Theme & CSS Manager
          </h1>
          <p className="page-subtitle">Customize PrepBridge's entire look — colors, fonts, radius, gradients. Changes apply site-wide.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPreview(p => !p)} className={`btn btn-sm ${preview ? 'btn-primary' : 'btn-outline'}`} style={{ gap: 6 }}>
            <Eye size={14} /> {preview ? 'Preview ON' : 'Preview'}
          </button>
          <button onClick={generateCSS} className="btn btn-outline btn-sm" style={{ gap: 6 }}>
            <Code size={14} /> Export CSS
          </button>
          <button onClick={handleReset} className="btn btn-outline btn-sm" style={{ gap: 6 }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Theme</>}
          </button>
        </div>
      </div>

      {/* Preset Themes */}
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 12, color: 'var(--text-2)' }}>🎨 Quick Preset Themes</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PRESET_THEMES.map(preset => (
            <button key={preset.key} onClick={() => applyPreset(preset)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = preset.colors.colorPurple; e.currentTarget.style.background = `${preset.colors.colorPurple}15` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)' }}
            >
              <div style={{ display: 'flex', gap: 3 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.colorPurple }} />
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.colorCyan || preset.colors.gradTo }} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left sidebar — Tabs */}
        <div>
          <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 80 }}>
            {[
              ['colors', '🎨 Brand Colors'],
              ['background', '🌑 Backgrounds'],
              ['text', '📝 Typography'],
              ['layout', '📐 Layout & Shape'],
              ['gradient', '✨ Gradient'],
              ['css', '💻 CSS Output'],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setActiveTab(k)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', background: activeTab === k ? 'rgba(124,58,237,0.12)' : 'transparent', borderLeft: activeTab === k ? '3px solid var(--purple)' : '3px solid transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', color: activeTab === k ? 'var(--purple)' : 'var(--text-2)', fontWeight: activeTab === k ? 700 : 400, fontSize: '0.88rem', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Controls */}
        <div>
          {activeTab === 'colors' && (
            <div className="card card-p">
              <h4 style={{ marginBottom: 20 }}>🎨 Brand Colors</h4>
              <ColorPicker label="Primary Purple" value={theme.colorPurple} onChange={update('colorPurple')} description="Buttons, highlights, primary actions" />
              <ColorPicker label="Cyan Accent" value={theme.colorCyan} onChange={update('colorCyan')} description="Links, live badges, secondary accents" />
              <ColorPicker label="Emerald / Success" value={theme.colorEmerald} onChange={update('colorEmerald')} description="Success states, checkmarks, growth indicators" />
              <ColorPicker label="Amber / Warning" value={theme.colorAmber} onChange={update('colorAmber')} description="Streak badges, stars, warnings" />
              <ColorPicker label="Red / Danger" value={theme.colorRed} onChange={update('colorRed')} description="Errors, delete, urgent alerts" />
              <ColorPicker label="Blue" value={theme.colorBlue} onChange={update('colorBlue')} description="Info states, some chart elements" />
            </div>
          )}

          {activeTab === 'background' && (
            <div className="card card-p">
              <h4 style={{ marginBottom: 20 }}>🌑 Background Layers</h4>
              <ColorPicker label="Base Background" value={theme.bgBase} onChange={update('bgBase')} description="Main page background (#08090f)" />
              <ColorPicker label="Layer 2 — Sections" value={theme.bgLayer2} onChange={update('bgLayer2')} description="Secondary sections, sidebar" />
              <ColorPicker label="Layer 3 — Cards" value={theme.bgLayer3} onChange={update('bgLayer3')} description="Card backgrounds, input fields" />
              <ColorPicker label="Card Background" value={theme.bgCard} onChange={update('bgCard')} description="Elevated card / modal background" />
              <div style={{ marginTop: 16, padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 10 }}>Preview stacking:</div>
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {[['Base', theme.bgBase], ['Layer 2', theme.bgLayer2], ['Layer 3', theme.bgLayer3]].map(([l, c]) => (
                    <div key={l} style={{ background: c, padding: '10px 14px', fontSize: '0.75rem', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{l}</span><span style={{ fontFamily: 'monospace', opacity: 0.5 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="card card-p">
              <h4 style={{ marginBottom: 20 }}>📝 Typography</h4>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Font Family</label>
                <select className="form-select" value={theme.fontFamily} onChange={e => update('fontFamily')(e.target.value)}>
                  {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div style={{ marginTop: 10, padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 'var(--r-md)', fontFamily: theme.fontFamily }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>The Quick Brown Fox</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>UPSC • SSC • Banking • Railways • State PSC</div>
                </div>
              </div>
              <ColorPicker label="Primary Text" value={theme.textPrimary} onChange={update('textPrimary')} description="Headings and main content" />
              <ColorPicker label="Secondary Text" value={theme.textSecondary} onChange={update('textSecondary')} description="Body text, descriptions" />
              <ColorPicker label="Muted Text" value={theme.textMuted} onChange={update('textMuted')} description="Labels, hints, captions" />
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="card card-p">
              <h4 style={{ marginBottom: 20 }}>📐 Layout & Shape</h4>
              <SliderInput label="Border Radius" value={theme.borderRadius} onChange={update('borderRadius')} min={0} max={24} unit="px" />
              <SliderInput label="Sidebar Width" value={theme.sidebarWidth} onChange={update('sidebarWidth')} min={200} max={320} unit="px" />
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 10 }}>Radius preview:</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['Button', 'Card', 'Input', 'Badge'].map((l, i) => (
                    <div key={l} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: `${theme.borderRadius}px`, padding: '10px 16px', fontSize: '0.8rem', color: 'var(--text-2)' }}>{l}</div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <ColorPicker label="Border Color" value={theme.borderColor} onChange={update('borderColor')} description="Card and element borders" />
              </div>
            </div>
          )}

          {activeTab === 'gradient' && (
            <div className="card card-p">
              <h4 style={{ marginBottom: 20 }}>✨ Gradient Settings</h4>
              <ColorPicker label="Gradient From" value={theme.gradFrom} onChange={update('gradFrom')} description="Left side of brand gradient" />
              <ColorPicker label="Gradient To" value={theme.gradTo} onChange={update('gradTo')} description="Right side of brand gradient" />
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 10 }}>Live preview:</div>
                <div style={{ height: 60, borderRadius: `${theme.borderRadius}px`, background: `linear-gradient(135deg,${theme.gradFrom},${theme.gradTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1rem', boxShadow: `0 0 30px ${theme.gradFrom}55` }}>
                  ⚡ PrepBridge Button
                </div>
                <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: `linear-gradient(90deg,${theme.gradFrom},${theme.gradTo})` }} />
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, height: 40, borderRadius: `${theme.borderRadius}px`, background: `${theme.gradFrom}20`, border: `1px solid ${theme.gradFrom}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: theme.gradFrom, fontWeight: 700 }}>Badge Primary</div>
                  <div style={{ flex: 1, height: 40, borderRadius: `${theme.borderRadius}px`, background: `${theme.gradTo}20`, border: `1px solid ${theme.gradTo}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: theme.gradTo, fontWeight: 700 }}>Badge Cyan</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'css' && (
            <div className="card card-p">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>💻 Generated CSS</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={generateCSS} className="btn btn-outline btn-sm" style={{ gap: 6 }}><Code size={13} /> Generate</button>
                  <button onClick={() => { navigator.clipboard.writeText(cssOutput); toast.success('CSS copied!') }} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Copy size={13} /> Copy</button>
                </div>
              </div>
              {cssOutput ? (
                <pre style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 20, fontSize: '0.78rem', color: '#a78bfa', overflow: 'auto', maxHeight: 400, fontFamily: '"Fira Code",monospace', lineHeight: 1.7 }}>
                  {cssOutput}
                </pre>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)', border: '2px dashed var(--border)', borderRadius: 'var(--r-md)' }}>
                  <Code size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div>Click "Generate" to export current theme as CSS variables</div>
                </div>
              )}
              <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-4)', background: 'var(--bg-3)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                💡 Paste this CSS into <code>src/index.css</code> :root section to permanently apply the theme.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
