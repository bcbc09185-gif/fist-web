import React, { useState, useEffect } from 'react';
import { 
  X, 
  Monitor, 
  Smartphone, 
  Palette, 
  Code, 
  Send, 
  ShoppingBag, 
  User, 
  BookOpen, 
  Building, 
  Check, 
  Copy, 
  ExternalLink,
  MessageCircle,
  Plus,
  Trash2,
  Phone,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export interface DemoConfig {
  title: string;
  slogan: string;
  themeColor: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate';
  fontFamily: 'sans' | 'mono' | 'serif' | 'display';
  siteType: 'ecommerce' | 'portfolio' | 'educational' | 'corporate';
  contactWhatsapp: string;
  contactEmail: string;
  items: Array<{ id: string; name: string; priceOrDesc: string; image: string }>;
}

interface LiveDemoSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  presetType?: 'ecommerce' | 'portfolio' | 'educational' | 'corporate';
  presetTitle?: string;
}

export default function LiveDemoSandbox({ isOpen, onClose, presetType, presetTitle }: LiveDemoSandboxProps) {
  // Config state
  const [config, setConfig] = useState<DemoConfig>({
    title: presetTitle || 'My Online Store',
    slogan: 'The ultimate digital experience built in Kaptai, Bangladesh.',
    themeColor: 'blue',
    fontFamily: 'sans',
    siteType: presetType || 'ecommerce',
    contactWhatsapp: '01822963824',
    contactEmail: 'orjodas@gmail.com',
    items: []
  });

  // Responsive device view state
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  // Sandbox active section tab inside the preview site
  const [activePreviewTab, setActivePreviewTab] = useState<'home' | 'products' | 'contact'>('home');
  // Interactive mock States
  const [cartCount, setCartCount] = useState<number>(0);
  const [mockFeedbackSent, setMockFeedbackSent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);

  // Sync state if template preset from parent updates
  useEffect(() => {
    if (presetType) {
      let defaultTitle = 'Custom App Store';
      let defaultSlogan = 'Professional premium service, rapid delivery.';
      let defaultItems: any[] = [];

      if (presetType === 'ecommerce') {
        defaultTitle = presetTitle || 'Kaptai Super Mart';
        defaultSlogan = 'Buy direct from the finest collection of local items with premium delivery!';
        defaultItems = [
          { id: 'p1', name: 'Premium Responsive Web Layout', priceOrDesc: '৳1,500', image: 'https://images.unsplash.com/photo-1541462608141-27b297b15525?w=200' },
          { id: 'p2', name: 'Digital Service Agency Template', priceOrDesc: '৳1,200', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200' },
          { id: 'p3', name: 'Modern Travel & Resort Theme', priceOrDesc: '৳1,800', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
        ];
      } else if (presetType === 'portfolio') {
        defaultTitle = presetTitle || 'Sajib Roy | Personal Portfolio';
        defaultSlogan = 'Senior Developer creating state-of-the-art interactive user experiences.';
        defaultItems = [
          { id: 'pt1', name: 'Hotel Booking System (Fullstack)', priceOrDesc: 'React & Node', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200' },
          { id: 'pt2', name: 'Custom Inventory Ledger App', priceOrDesc: 'MongoDB Express', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200' },
        ];
      } else if (presetType === 'educational') {
        defaultTitle = presetTitle || 'Kaptai High School Portal';
        defaultSlogan = 'Spreading light, ethics, and modern technology education since 1980.';
        defaultItems = [
          { id: 'ed1', name: 'Latest Term Exam Schedules', priceOrDesc: 'Academic Board Board', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=200' },
          { id: 'ed2', name: 'Online Admission Portal Guide', priceOrDesc: 'For Class 1-10', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200' },
        ];
      } else if (presetType === 'corporate') {
        defaultTitle = presetTitle || 'Active Logistics Bangladesh';
        defaultSlogan = 'Reliable custom global transport and shipping handlers located nationwide.';
        defaultItems = [
          { id: 'cor1', name: 'Nationwide Cargo Moving', priceOrDesc: '24/7 Dispatch', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200' },
          { id: 'cor2', name: 'Cold-chain Frozen Goods Transport', priceOrDesc: 'Temperature Tracked', image: 'https://images.unsplash.com/photo-1519003722822-6d51cf37789a?w=200' },
        ];
      }

      setConfig({
        title: defaultTitle,
        slogan: defaultSlogan,
        themeColor: presetType === 'ecommerce' ? 'emerald' : presetType === 'portfolio' ? 'violet' : presetType === 'educational' ? 'amber' : 'blue',
        fontFamily: presetType === 'portfolio' ? 'display' : presetType === 'educational' ? 'serif' : 'sans',
        siteType: presetType,
        contactWhatsapp: '01822963824',
        contactEmail: 'orjodas@gmail.com',
        items: defaultItems
      });
      setActivePreviewTab('home');
      setCartCount(0);
      setMockFeedbackSent(false);
    }
  }, [presetType, presetTitle]);

  if (!isOpen) return null;

  // Custom theme mappings
  const themeColors = {
    blue: {
      bg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      accentText: 'text-blue-800',
      badgeBg: 'bg-blue-100 text-blue-800'
    },
    emerald: {
      bg: 'bg-emerald-600',
      hoverBg: 'hover:bg-emerald-700',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      accentText: 'text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    rose: {
      bg: 'bg-rose-600',
      hoverBg: 'hover:bg-rose-700',
      text: 'text-rose-600',
      lightBg: 'bg-rose-50',
      border: 'border-rose-200',
      accentText: 'text-rose-800',
      badgeBg: 'bg-rose-100 text-rose-800'
    },
    amber: {
      bg: 'bg-amber-500',
      hoverBg: 'hover:bg-amber-600',
      text: 'text-amber-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-200',
      accentText: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    violet: {
      bg: 'bg-violet-600',
      hoverBg: 'hover:bg-violet-700',
      text: 'text-violet-600',
      lightBg: 'bg-violet-50',
      border: 'border-violet-200',
      accentText: 'text-violet-800',
      badgeBg: 'bg-violet-100 text-violet-800'
    },
    slate: {
      bg: 'bg-slate-700',
      hoverBg: 'hover:bg-slate-800',
      text: 'text-slate-700',
      lightBg: 'bg-slate-50',
      border: 'border-slate-200',
      accentText: 'text-slate-800',
      badgeBg: 'bg-slate-100 text-slate-8050'
    }
  };

  const selectedTheme = themeColors[config.themeColor];

  // Font family mappings
  const fontFamilies = {
    sans: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
    display: 'font-sans tracking-tight'
  };

  const handleCopyCode = () => {
    const mockCode = `
<!-- =======================================================
  Website Bazer - Custom Client Template Export
  Title: ${config.title}
  Type: ${config.siteType.toUpperCase()}
  Color Theme: ${config.themeColor}
  Font Family: ${config.fontFamily}
======================================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} | ${config.slogan}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900">
  <!-- Nav Bar -->
  <nav class="bg-white border-b border-gray-150 px-6 py-4 shadow-sm">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <h1 class="text-xl font-extrabold text-${config.themeColor}-600">${config.title}</h1>
      <div class="space-x-4 text-sm font-medium">
        <a href="#" class="text-slate-600 hover:text-slate-900">Home</a>
        <a href="#" class="text-slate-600 hover:text-slate-900">${config.siteType === 'ecommerce' ? 'Products' : 'Services'}</a>
        <a href="#" class="text-slate-600 hover:text-slate-900">Contact</a>
      </div>
    </div>
  </nav>

  <!-- Hero Banner -->
  <header class="bg-white py-16 px-6 border-b border-gray-100">
    <div class="max-w-4xl mx-auto text-center space-y-4">
      <h2 class="text-4xl font-extrabold tracking-tight">${config.title}</h2>
      <p class="text-gray-650 max-w-xl mx-auto leading-relaxed">${config.slogan}</p>
      <div class="pt-2">
        <a href="https://wa.me/88${config.contactWhatsapp}" class="inline-flex items-center gap-2 bg-${config.themeColor}-600 text-white px-6 py-3 rounded-full font-bold hover:bg-${config.themeColor}-700 transition">
          Contact WhatsApp
        </a>
      </div>
    </div>
  </header>

  <!-- Dynamic Content -->
  <main class="max-w-7xl mx-auto px-6 py-12">
    <h3 class="text-2xl font-bold mb-6">Featured Items</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${config.items.map(item => `
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
        <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h4 class="font-extrabold text-slate-800 text-base mb-1">${item.name}</h4>
          <span class="text-${config.themeColor}-600 text-sm font-bold">${item.priceOrDesc}</span>
        </div>
      </div>`).join('')}
    </div>
  </main>

  <footer class="bg-slate-900 text-white py-12 text-center text-xs">
    <p>&copy; ${new Date().getFullYear()} ${config.title}. All rights reserved.</p>
  </footer>
</body>
</html>`;

    navigator.clipboard.writeText(mockCode);
    setIsCopied(true);
    toast.success('Custom Code Copied Successfully!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendRequestToTeam = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Saving your custom demo setup...',
        success: 'Design package sent! Our team will contact you about this exact mockup.',
        error: 'Network failure. Please try again.',
      }
    );
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:right-[430px] lg:bottom-6 z-50 flex items-stretch h-full lg:h-[580px] w-full lg:w-[650px] bg-slate-900 text-slate-100 rounded-none lg:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
      {/* Control Sidebar / Customizer Tab */}
      <div className="w-[200px] bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="space-y-4">
          {/* Headline */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Demo Sandbox</span>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 lg:hidden">
              <X size={14} />
            </button>
          </div>

          {/* Site Type Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Template Type</label>
            <select
              value={config.siteType}
              onChange={(e) => {
                const newType = e.target.value as any;
                setConfig(prev => ({ ...prev, siteType: newType }));
                // Trigger preset update immediately
              }}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ecommerce">🛍️ E-Commerce</option>
              <option value="portfolio">💼 Personal Portfolio</option>
              <option value="educational">🎓 Educational Portal</option>
              <option value="corporate">🏢 Modern Business</option>
            </select>
          </div>

          {/* Title Editor */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Website Title</label>
            <input 
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
              placeholder="Store Name"
            />
          </div>

          {/* Slogan */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Site Banner Slogan</label>
            <textarea 
              value={config.slogan}
              rows={2}
              onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 focus:outline-none min-h-[40px] leading-tight"
            />
          </div>

          {/* Theme Colors Palette */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Palette size={10} /> Brand Theme Accent
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {(Object.keys(themeColors) as Array<keyof typeof themeColors>).map((col) => (
                <button
                  key={col}
                  onClick={() => setConfig({ ...config, themeColor: col })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    col === 'blue' ? 'bg-blue-600' :
                    col === 'emerald' ? 'bg-emerald-600' :
                    col === 'rose' ? 'bg-rose-600' :
                    col === 'amber' ? 'bg-amber-500' :
                    col === 'violet' ? 'bg-violet-600' : 'bg-slate-600'
                  } ${config.themeColor === col ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  title={`${col} brand`}
                />
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Font pairing</label>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {(['sans', 'serif', 'mono', 'display'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => setConfig({ ...config, fontFamily: font })}
                  className={`p-1 border rounded text-center transition-colors font-semibold capitalize ${
                    config.fontFamily === font 
                      ? 'border-indigo-500 bg-indigo-550 bg-indigo-900 text-white' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black text-slate-300 uppercase flex items-center justify-center gap-1.5"
          >
            <Code size={11} /> {showCode ? 'Back to View' : 'Show Live HTML'}
          </button>

          <button
            onClick={handleCopyCode}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-black text-white uppercase flex items-center justify-center gap-1"
          >
            {isCopied ? <Check size={12} /> : <Copy size={11} />} {isCopied ? 'Copied!' : 'Copy Template'}
          </button>
          
          <button
            onClick={handleSendRequestToTeam}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-black text-white uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
          >
            Deploy This Demo 🚀
          </button>
        </div>
      </div>

      {/* Main Sandbox Interactive Display Stage */}
      <div className="flex-1 bg-slate-100 text-gray-900 overflow-hidden flex flex-col">
        {/* Device view responsive bar */}
        <div className="bg-white border-b border-gray-200 p-3 shrink-0 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-500">Live Custom Sandbox Preview</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${deviceView === 'desktop' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
              title="Desktop View Mode"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${deviceView === 'mobile' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
              title="Mobile View Mode"
            >
              <Smartphone size={14} />
            </button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
            <button 
              onClick={onClose}
              className="p-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-xs shrink-0 font-bold"
              title="Close Live Sandbox Frame"
            >
              Close
            </button>
          </div>
        </div>

        {/* Workspace responsive wrapper */}
        <div className="flex-1 p-3 overflow-hidden flex items-center justify-center bg-gray-200/60 pattern-grid">
          <AnimatePresence mode="wait">
            {showCode ? (
              <motion.div 
                key="code"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full bg-slate-950 p-3 rounded-2xl border border-slate-800 text-slate-300 font-mono text-[10px] overflow-auto select-all"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[9px] text-gray-500 font-sans">
                  <span>Custom Instant Component File Layout (index.html)</span>
                  <button onClick={handleCopyCode} className="text-blue-400 hover:underline">Copy Code</button>
                </div>
                <pre>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${config.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="${fontFamilies[config.fontFamily]}">
  <!-- Brand Header -->
  <header class="bg-white py-12 text-center p-6 border-b">
    <h1 class="text-3xl font-extrabold text-${config.themeColor}-600">${config.title}</h1>
    <p class="text-gray-500 max-w-md mx-auto mt-2">${config.slogan}</p>
  </header>

  <!-- Products/Items -->
  <main class="max-w-4xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    ${config.items.map(p => `
    <div class="p-4 bg-white border border-gray-150 rounded-xl">
      <h3 class="font-bold text-gray-900">${p.name}</h3>
      <p class="text-gray-500 text-xs">${p.priceOrDesc}</p>
    </div>`).join('\n    ')}
  </main>
</body>
</html>`}</pre>
              </motion.div>
            ) : (
              <motion.div
                key="preview-device"
                initial={{ width: deviceView === 'desktop' ? '100%' : '320px' }}
                animate={{ width: deviceView === 'desktop' ? '100%' : '320px' }}
                transition={{ type: 'spring', damping: 25 }}
                className={`h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-300 mx-auto max-w-full`}
              >
                {/* Simulated Web Header/Nav */}
                <header className={`shrink-0 text-white ${selectedTheme.bg} px-4 py-3 flex items-center justify-between select-none shadow-sm`}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm tracking-tight">{config.title}</span>
                  </div>
                  
                  {/* Dynamic Search item tracker (Ecomm specific or general) */}
                  <div className="flex items-center gap-3">
                    <nav className="text-[10px] font-semibold flex items-center gap-2 max-xs:hidden">
                      <button onClick={() => setActivePreviewTab('home')} className={`px-2 py-0.5 rounded ${activePreviewTab === 'home' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Home</button>
                      <button onClick={() => setActivePreviewTab('products')} className={`px-2 py-0.5 rounded ${activePreviewTab === 'products' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Items</button>
                      <button onClick={() => setActivePreviewTab('contact')} className={`px-2 py-0.5 rounded ${activePreviewTab === 'contact' ? 'bg-white/20' : 'hover:bg-white/10'}`}>About</button>
                    </nav>

                    {config.siteType === 'ecommerce' && (
                      <button className="relative p-1.5 hover:bg-white/10 rounded-full flex items-center justify-center cursor-pointer">
                        <ShoppingBag size={14} />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-amber-950 rounded-full text-[9px] font-black flex items-center justify-center animate-bounce-slow">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </header>

                {/* Simulated Web Body with Fonts */}
                <div className={`flex-1 overflow-y-auto ${fontFamilies[config.fontFamily]} bg-slate-50/70 p-4 space-y-4`}>
                  {activePreviewTab === 'home' && (
                    <>
                      {/* Hero Section Banner */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 text-center shadow-xs">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-2 ${selectedTheme.badgeBg}`}>LAUNCHED LIVE</span>
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-snug">{config.title}</h2>
                        <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">{config.slogan}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          <button 
                            onClick={() => setActivePreviewTab('products')} 
                            className={`px-3.5 py-1.5 ${selectedTheme.bg} ${selectedTheme.hoverBg} text-white font-bold text-xs rounded-xl shadow transition-colors`}
                          >
                            Explore Store
                          </button>
                          <a 
                            href={`https://wa.me/88${config.contactWhatsapp}`}
                            target="_blank"
                            rel="noopener"
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle size={12} className="fill-current" /> Live Chat
                          </a>
                        </div>
                      </div>

                      {/* Info Highlights Card */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-white p-3 rounded-xl border border-gray-150 shadow-xs">
                          <div className={`text-base font-bold text-gray-800 ${selectedTheme.text}`}>100% Secure</div>
                          <span className="text-[9px] text-gray-400">bKash/Nagad Protected</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150 shadow-xs">
                          <div className={`text-base font-bold text-gray-800 ${selectedTheme.text}`}>Fast Setup</div>
                          <span className="text-[9px] text-gray-400">Done in 24 Hours</span>
                        </div>
                      </div>

                      {/* Mini Featured List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Our Showcase Collections</span>
                          <button onClick={() => setActivePreviewTab('products')} className={`text-[10px] font-bold ${selectedTheme.text} hover:underline`}>View All &rarr;</button>
                        </div>

                        {config.items.length === 0 ? (
                          <div className="text-center p-6 bg-white border border-dashed border-gray-300 rounded-xl text-xs text-gray-600">
                             No items added. Click corporate or e-commerce types in sidebar to populate default catalog list!
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {config.items.slice(0, 2).map((item, id) => (
                              <div key={id} className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow transition-shadow">
                                <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                                <div className="p-2.5">
                                  <h4 className="font-extrabold text-[11px] text-gray-800 tracking-tight line-clamp-1">{item.name}</h4>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className={`text-[11px] font-black ${selectedTheme.text}`}>{item.priceOrDesc}</span>
                                    {config.siteType === 'ecommerce' ? (
                                      <button 
                                        onClick={() => {
                                          setCartCount(prev => prev + 1);
                                          toast.success(`Added ${item.name} to cart!`);
                                        }}
                                        className={`w-5 h-5 ${selectedTheme.bg} ${selectedTheme.hoverBg} text-white rounded flex items-center justify-center text-[11px] font-black`}
                                      >
                                        +
                                      </button>
                                    ) : (
                                      <button onClick={() => setActivePreviewTab('contact')} className={`px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-700 font-bold rounded`}>Hire</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activePreviewTab === 'products' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-gray-250">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">{config.siteType === 'ecommerce' ? 'Store Products' : 'Custom Services'}</h3>
                        <span className="text-[10px] font-bold text-gray-400">{config.items.length} total</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {config.items.map((item, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-150 flex gap-3 shadow-xs">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-extrabold text-xs text-gray-800">{item.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">Custom layout built in Bangladesh</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-black ${selectedTheme.text}`}>{item.priceOrDesc}</span>
                                {config.siteType === 'ecommerce' ? (
                                  <button
                                    onClick={() => {
                                      setCartCount(prev => prev + 1);
                                      toast.success(`Added to simulated cart!`);
                                    }}
                                    className={`px-3 py-1 ${selectedTheme.bg} ${selectedTheme.hoverBg} text-white font-bold text-[10px] rounded-lg shadow-sm`}
                                  >
                                    Add to Cart
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setActivePreviewTab('contact')}
                                    className={`px-3 py-1 ${selectedTheme.bg} hover:opacity-90 text-white font-black text-[10px] rounded-lg`}
                                  >
                                    Order Project
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'contact' && (
                    <div className="bg-white border border-gray-150 p-4 rounded-xl space-y-4">
                      <h3 className="text-sm font-bold border-b pb-1">Get in Touch Directly</h3>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Phone size={12} className={selectedTheme.text} />
                          <span className="font-medium text-gray-700">Telephone support: <strong>+88{config.contactWhatsapp}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Send size={12} className={selectedTheme.text} />
                          <span className="font-medium text-gray-700">Email inbox: <strong>{config.contactEmail}</strong></span>
                        </div>
                      </div>

                      {mockFeedbackSent ? (
                        <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-center">
                          <p className="text-xs text-emerald-800 font-bold">📩 Message received in demo simulation!</p>
                        </div>
                      ) : (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          setMockFeedbackSent(true);
                        }} className="space-y-2 text-xs">
                          <input required type="text" placeholder="Your Name" className="w-full p-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1" />
                          <input required type="text" placeholder="Whats-app number" className="w-full p-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1" />
                          <textarea required placeholder="Requirements details" className="w-full p-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 min-h-[50px]" />
                          <button type="submit" className={`w-full py-2 ${selectedTheme.bg} font-bold text-white rounded-lg`}>Send Message</button>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulated Footer */}
                <footer className="bg-slate-900 text-white p-3 shrink-0 text-center text-[9px] border-t border-slate-800">
                  <p>&copy; {new Date().getFullYear()} {config.title} Powered by Website Bazer</p>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
