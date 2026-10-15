import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  ShoppingCart,
  Package,
  Calculator,
  BarChart3,
  Receipt,
  User,
  ShieldCheck,
  Printer,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Share2,
  Copy,
  Volume2,
  VolumeX,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Sparkles,
  X,
  History,
  Send,
  Maximize,
  Minimize,
  Smartphone,
  Tablet,
  ArrowRight,
  ArrowLeft,
  Columns2,
  LayoutList,
  Edit3,
  RotateCcw,
  UtensilsCrossed
} from 'lucide-react';

// ==================== TYPES & INTERFACES ====================
export type Role = 'owner' | 'kasir';
export type Channel = 'Offline' | 'GoFood' | 'ShopeeFood' | 'GrabFood';
export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer' | 'Saldo Merchant';

export interface PackagingItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  unitCost: number;
  category: 'container' | 'cutlery' | 'condiment' | 'label';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  baseOfflinePrice: number;
  image: string;
  category: 'Rujak' | 'Extra' | 'Pelengkap';
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  spicinessLevel: string;
  notes?: string;
  channelPrice: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  channel: Channel;
  cashierName: string;
  customerName?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    spiciness: string;
  }[];
  subtotal: number;
  discount: number;
  platformFeePercent: number;
  platformFeeNominal: number;
  finalGrossAmount: number;
  netReceived: number;
  totalFreshHpp: number;
  totalPackagingCost: number;
  netProfit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
}

// ==================== INITIAL DATA ====================
export const INITIAL_PACKAGING: PackagingItem[] = [
  { id: 'pkg-1', name: 'Thinwall 650ml (Mangkok Rujak)', unit: 'pcs', stock: 120, minStock: 30, unitCost: 1200, category: 'container' },
  { id: 'pkg-2', name: 'Sendok & Garpu Plastik (1 Set)', unit: 'set', stock: 150, minStock: 40, unitCost: 450, category: 'cutlery' },
  { id: 'pkg-3', name: 'Tempat Sambal Cup 50ml + Tutup', unit: 'pcs', stock: 95, minStock: 30, unitCost: 350, category: 'condiment' },
  { id: 'pkg-4', name: 'Label Stiker Thinwall Mba Uus', unit: 'pcs', stock: 210, minStock: 50, unitCost: 300, category: 'label' },
  { id: 'pkg-5', name: 'Stiker Segel Cup Sambal', unit: 'pcs', stock: 180, minStock: 50, unitCost: 150, category: 'label' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Rujak Buah Segar Uleg',
    description: 'Mangga, bengkuang, nanas, kedondong, timun, jambu air + sambal gula aren uleg',
    baseOfflinePrice: 18000,
    image: '🍍',
    category: 'Rujak',
  },
  {
    id: 'm-2',
    name: 'Rujak Buah Potong Sambal Pisah',
    description: 'Aneka buah potong dingin segar dengan cup sambal terasi aren pedas mantap',
    baseOfflinePrice: 18000,
    image: '🥭',
    category: 'Rujak',
  },
  {
    id: 'm-3',
    name: 'Rujak Cingur Khas Jawa Timur',
    description: 'Irisan cingur kenyal, sayuran segar, lontong, tahu tempe + bumbu petis istimewa',
    baseOfflinePrice: 25000,
    image: '🥒',
    category: 'Rujak',
  },
  {
    id: 'm-4',
    name: 'Rujak Serut Es Manis Pedas',
    description: 'Serutan buah segar berpadu kuah asam manis pedas dingin menyegarkan',
    baseOfflinePrice: 16000,
    image: '🍧',
    category: 'Rujak',
  },
  {
    id: 'm-5',
    name: 'Extra Sambal Aren Spesial (Cup)',
    description: 'Tambahan 1 cup sambal gula aren pedas khas racikan Mba Uus',
    baseOfflinePrice: 5000,
    image: '🌶️',
    category: 'Extra',
  },
  {
    id: 'm-6',
    name: 'Kerupuk Putih Kaleng (1 Pcs)',
    description: 'Pelengkap renyah gurih cocok untuk teman makan rujak',
    baseOfflinePrice: 2000,
    image: '🍘',
    category: 'Pelengkap',
  },
  {
    id: 'm-7',
    name: 'Es Teh Manis Melati',
    description: 'Es teh wangi melati pelepas dahaga setelah makan rujak pedas',
    baseOfflinePrice: 5000,
    image: '🥤',
    category: 'Pelengkap',
  },
];

export const CHANNEL_COMMISSIONS: Record<Channel, number> = {
  Offline: 0,
  GoFood: 20,
  ShopeeFood: 20,
  GrabFood: 20,
};

// ==================== AUDIO SYNTHESIZER ====================
class SoundHelper {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.enabled) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // ignore audio error
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // ignore audio error
    }
  }

  playPrintSound() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140 + i * 20, now + i * 0.08);
        gain.gain.setValueAtTime(0.05, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + (i + 1) * 0.08);
      }
    } catch {
      // ignore audio error
    }
  }
}

const audioPlayer = new SoundHelper();

export default function App() {
  // Navigation & Role
  const [role, setRole] = useState<Role>('kasir');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'menu' | 'packaging' | 'margin' | 'report' | 'receipts'>('pos');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Audio mute
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dynamic Viewport Measurement
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  const isLandscape = viewport.width > viewport.height;
  // Mobile landscape: when held horizontally on smartphone (< 960px width or < 560px height)
  const isMobileLandscape = isLandscape && (viewport.height < 560 || viewport.width < 960);

  // In mobile landscape POS: user can toggle between 'menu' (full catalog) and 'cart' (full checkout)
  const [mobileLandscapeTab, setMobileLandscapeTab] = useState<'menu' | 'cart'>('menu');

  // Landscape layout mode: 'tab' (focused single screen, optimal for phone) vs 'split' (2-column side-by-side)
  const [landscapeLayoutMode, setLandscapeLayoutMode] = useState<'tab' | 'split'>('tab');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Search filter
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'Semua' | 'Rujak' | 'Extra' | 'Pelengkap'>('Semua');

  // Persistent State: Daftar Menu Jualan (CRUD)
  const [menuList, setMenuList] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('rujak_menu_items');
      if (!saved) return MENU_ITEMS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return MENU_ITEMS;
      return parsed;
    } catch {
      return MENU_ITEMS;
    }
  });

  // Persistent State: Stock Kemasan with robust migration and fallback
  const [packagingList, setPackagingList] = useState<PackagingItem[]>(() => {
    try {
      const saved = localStorage.getItem('rujak_packaging_stock');
      if (!saved) return INITIAL_PACKAGING;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_PACKAGING;

      // Merge with INITIAL_PACKAGING to guarantee all fields (especially unitCost & minStock) exist and are valid numbers
      return INITIAL_PACKAGING.map((initItem, idx) => {
        const found = parsed.find((p: Partial<PackagingItem>) => p && (p.id === initItem.id || p.name === initItem.name)) || parsed[idx] || {};
        return {
          id: initItem.id,
          name: initItem.name,
          unit: initItem.unit,
          stock: typeof found.stock === 'number' && !isNaN(found.stock) ? found.stock : initItem.stock,
          minStock: typeof found.minStock === 'number' && !isNaN(found.minStock) ? found.minStock : initItem.minStock,
          unitCost: typeof found.unitCost === 'number' && !isNaN(found.unitCost) ? found.unitCost : initItem.unitCost,
          category: initItem.category,
        };
      });
    } catch {
      return INITIAL_PACKAGING;
    }
  });

  // Base Fresh Ingredients HPP
  const [baseFreshHpp, setBaseFreshHpp] = useState<number>(() => {
    const saved = localStorage.getItem('rujak_base_fresh_hpp');
    return saved ? Number(saved) : 10000;
  });

  // Multi-Channel Custom Commission Override
  const [commissions, setCommissions] = useState<Record<Channel, number>>(() => {
    const saved = localStorage.getItem('rujak_commissions');
    return saved ? JSON.parse(saved) : CHANNEL_COMMISSIONS;
  });

  // Custom Selling Price Override for Calculator (Owner only)
  const [calcOfflinePrice, setCalcOfflinePrice] = useState<number>(18000);
  const [calcOnlinePrice, setCalcOnlinePrice] = useState<number>(23000);

  // Transactions History
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rujak_transactions');
    if (saved) return JSON.parse(saved);
    const now = new Date();
    const dStr = now.toISOString().split('T')[0];
    return [
      {
        id: 'trx-101',
        receiptNumber: `RUJAK-${dStr.replace(/-/g, '')}-0001`,
        timestamp: `${dStr} 10:15`,
        channel: 'Offline',
        cashierName: 'Mba Uus',
        customerName: 'Bpk. Hendra (Dine-in)',
        items: [
          { name: 'Rujak Buah Segar Uleg', quantity: 2, price: 18000, subtotal: 36000, spiciness: 'Pedas' },
          { name: 'Es Teh Manis Melati', quantity: 2, price: 5000, subtotal: 10000, spiciness: '-' }
        ],
        subtotal: 46000,
        discount: 0,
        platformFeePercent: 0,
        platformFeeNominal: 0,
        finalGrossAmount: 46000,
        netReceived: 46000,
        totalFreshHpp: 20000,
        totalPackagingCost: 4900,
        netProfit: 21100,
        paymentMethod: 'Tunai',
        amountPaid: 50000,
        change: 4000
      },
      {
        id: 'trx-102',
        receiptNumber: `RUJAK-${dStr.replace(/-/g, '')}-0002`,
        timestamp: `${dStr} 11:40`,
        channel: 'GoFood',
        cashierName: 'Kasir',
        customerName: 'GF-9082 Siti Rahma',
        items: [
          { name: 'Rujak Cingur Khas Jawa Timur', quantity: 1, price: 31000, subtotal: 31000, spiciness: 'Sedang' }
        ],
        subtotal: 31000,
        discount: 0,
        platformFeePercent: 20,
        platformFeeNominal: 6200,
        finalGrossAmount: 31000,
        netReceived: 24800,
        totalFreshHpp: 12000,
        totalPackagingCost: 2450,
        netProfit: 10350,
        paymentMethod: 'Saldo Merchant',
        amountPaid: 31000,
        change: 0
      },
      {
        id: 'trx-103',
        receiptNumber: `RUJAK-${dStr.replace(/-/g, '')}-0003`,
        timestamp: `${dStr} 12:20`,
        channel: 'ShopeeFood',
        cashierName: 'Kasir',
        customerName: 'SF-4412 Dimas Prayoga',
        items: [
          { name: 'Rujak Buah Potong Sambal Pisah', quantity: 2, price: 23000, subtotal: 46000, spiciness: 'Extra Pedas' },
          { name: 'Extra Sambal Aren Spesial (Cup)', quantity: 1, price: 6000, subtotal: 6000, spiciness: 'Extra Pedas' }
        ],
        subtotal: 52000,
        discount: 2000,
        platformFeePercent: 20,
        platformFeeNominal: 10000,
        finalGrossAmount: 50000,
        netReceived: 40000,
        totalFreshHpp: 20000,
        totalPackagingCost: 3100,
        netProfit: 16900,
        paymentMethod: 'Saldo Merchant',
        amountPaid: 50000,
        change: 0
      }
    ];
  });

  // POS State
  const [selectedChannel, setSelectedChannel] = useState<Channel>('Offline');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedSpiciness, setSelectedSpiciness] = useState('Sedang');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Tunai');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [includeCutlery, setIncludeCutlery] = useState<boolean>(true);

  // Struk Modal & Printing
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Packaging Modal State
  const [selectedPkgForRestock, setSelectedPkgForRestock] = useState<PackagingItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);
  const [selectedPkgForEdit, setSelectedPkgForEdit] = useState<PackagingItem | null>(null);
  const [editUnitCost, setEditUnitCost] = useState<number>(0);
  const [editMinStock, setEditMinStock] = useState<number>(0);

  // Menu Management Modal State (Add / Edit)
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuFormName, setMenuFormName] = useState('');
  const [menuFormDesc, setMenuFormDesc] = useState('');
  const [menuFormCategory, setMenuFormCategory] = useState<'Rujak' | 'Extra' | 'Pelengkap'>('Rujak');
  const [menuFormPrice, setMenuFormPrice] = useState<number>(18000);
  const [menuFormImage, setMenuFormImage] = useState('🍍');

  // Window resize & orientation change listener
  useEffect(() => {
    const updateSize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // Synchronize tabs when role changes
  useEffect(() => {
    if (role === 'kasir' && (activeTab === 'dashboard' || activeTab === 'margin' || activeTab === 'report' || activeTab === 'menu')) {
      setActiveTab('pos');
    }
  }, [role, activeTab]);

  // Save menuList to localStorage
  useEffect(() => {
    localStorage.setItem('rujak_menu_items', JSON.stringify(menuList));
  }, [menuList]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('rujak_packaging_stock', JSON.stringify(packagingList));
  }, [packagingList]);

  useEffect(() => {
    localStorage.setItem('rujak_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('rujak_commissions', JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem('rujak_base_fresh_hpp', baseFreshHpp.toString());
  }, [baseFreshHpp]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioPlayer.enabled = next;
    showToast(next ? 'Audio POS Diaktifkan' : 'Audio POS Dimatikan');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Switch role handler
  const handleSwitchRoleClick = () => {
    if (role === 'kasir') {
      setPinInput('');
      setPinError('');
      setShowRoleModal(true);
    } else {
      setRole('kasir');
      setActiveTab('pos');
      audioPlayer.playBeep();
      showToast('Beralih ke Mode Kasir');
    }
  };

  const handleVerifyOwnerPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setRole('owner');
      setShowRoleModal(false);
      audioPlayer.playSuccess();
      showToast('Akses Owner Terbuka (PIN Valid)');
    } else {
      setPinError('PIN salah! Coba default: 1234');
      audioPlayer.playBeep();
    }
  };

  // Packaging calculations (100% crash-proof against undefined or NaN)
  const standardPackagingCost = useMemo(() => {
    if (!Array.isArray(packagingList)) return 0;
    return packagingList.reduce((acc, item) => acc + (Number(item?.unitCost) || 0), 0);
  }, [packagingList]);

  const lowStockItems = useMemo(() => {
    if (!Array.isArray(packagingList)) return [];
    return packagingList.filter(item => (Number(item?.stock) || 0) <= (Number(item?.minStock) || 0));
  }, [packagingList]);

  // Price calculations based on channel
  const getItemPrice = (item: MenuItem, channel: Channel) => {
    if (channel === 'Offline') {
      return item.baseOfflinePrice;
    }
    const commission = commissions[channel] || 20;
    const markupFactor = 1 / (1 - commission / 100);
    const rawOnline = item.baseOfflinePrice * markupFactor;
    return Math.ceil(rawOnline / 1000) * 1000;
  };

  // Filtered menu items (reactive with menuList)
  const filteredMenuItems = useMemo(() => {
    return menuList.filter(item => {
      const matchCat = selectedCategoryFilter === 'Semua' || item.category === selectedCategoryFilter;
      const matchSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(menuSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuList, selectedCategoryFilter, menuSearchQuery]);

  // Add item to cart
  const addToCart = (menuItem: MenuItem) => {
    audioPlayer.playBeep();
    const price = getItemPrice(menuItem, selectedChannel);
    setCart(prev => {
      const existingIdx = prev.findIndex(
        ci => ci.menuItem.id === menuItem.id && ci.spicinessLevel === (menuItem.category === 'Rujak' ? selectedSpiciness : '-')
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          menuItem,
          quantity: 1,
          spicinessLevel: menuItem.category === 'Rujak' ? selectedSpiciness : '-',
          notes: notes.trim() || undefined,
          channelPrice: price,
        }
      ];
    });
    setNotes('');
  };

  const updateCartQty = (index: number, delta: number) => {
    audioPlayer.playBeep();
    setCart(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQty;
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCashGiven('');
  };

  // Cart Totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.channelPrice * item.quantity, 0);
  }, [cart]);

  const currentPlatformFeePercent = commissions[selectedChannel] || 0;
  const cartFinalGross = Math.max(0, cartSubtotal - discountAmount);
  const cartPlatformFeeNominal = Math.round((cartFinalGross * currentPlatformFeePercent) / 100);
  const cartNetReceived = cartFinalGross - cartPlatformFeeNominal;

  const cartPortionCount = useMemo(() => {
    return cart.reduce((acc, ci) => {
      if (ci.menuItem.category === 'Rujak') return acc + ci.quantity;
      return acc;
    }, 0);
  }, [cart]);

  const cartFreshHpp = cartPortionCount * baseFreshHpp;
  const cartPackagingCost = cartPortionCount * standardPackagingCost;
  const cartEstimatedProfit = cartNetReceived - (cartFreshHpp + cartPackagingCost);

  // Cash change
  const numericCashGiven = Number(cashGiven) || 0;
  const changeAmount = selectedPayment === 'Tunai' ? Math.max(0, numericCashGiven - cartFinalGross) : 0;
  const isCashInsufficient = selectedPayment === 'Tunai' && numericCashGiven > 0 && numericCashGiven < cartFinalGross;

  // Checkout and Auto-Deduct Packaging Stock
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Keranjang masih kosong!');
      return;
    }
    if (selectedPayment === 'Tunai' && numericCashGiven < cartFinalGross) {
      showToast('Uang pembayaran masih kurang!');
      return;
    }

    const portions = cartPortionCount;
    if (portions > 0) {
      const thinwall = packagingList.find(p => p.category === 'container');
      if (thinwall && thinwall.stock < portions) {
        const proceed = confirm(`Perhatian: Stok ${thinwall.name} tersisa ${thinwall.stock}, kurang dari pesanan (${portions}). Tetap lanjutkan?`);
        if (!proceed) return;
      }
    }

    const now = new Date();
    const dStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const receiptNum = `RUJAK-${dStr.replace(/-/g, '')}-${String(transactions.length + 1).padStart(4, '0')}`;

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: `${dStr} ${timeStr}`,
      channel: selectedChannel,
      cashierName: role === 'owner' ? 'Mba Uus (Owner)' : 'Kasir',
      customerName: customerName.trim() || (selectedChannel === 'Offline' ? 'Pelanggan Walk-in' : `Order ${selectedChannel}`),
      items: cart.map(c => ({
        name: c.menuItem.name,
        quantity: c.quantity,
        price: c.channelPrice,
        subtotal: c.channelPrice * c.quantity,
        spiciness: c.spicinessLevel
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      platformFeePercent: currentPlatformFeePercent,
      platformFeeNominal: cartPlatformFeeNominal,
      finalGrossAmount: cartFinalGross,
      netReceived: cartNetReceived,
      totalFreshHpp: cartFreshHpp,
      totalPackagingCost: cartPackagingCost,
      netProfit: cartEstimatedProfit,
      paymentMethod: selectedPayment,
      amountPaid: selectedPayment === 'Tunai' ? numericCashGiven : cartFinalGross,
      change: changeAmount
    };

    // Auto-deduct packaging stock
    if (portions > 0) {
      setPackagingList(prev => prev.map(item => {
        let deductCount = portions;
        if (item.category === 'cutlery' && !includeCutlery) {
          deductCount = 0;
        }
        return {
          ...item,
          stock: Math.max(0, item.stock - deductCount)
        };
      }));
    }

    setTransactions(prev => [newTrx, ...prev]);
    audioPlayer.playSuccess();
    showToast('Pesanan Berhasil Dicatat & Stok Terpotong!');

    setActiveReceipt(newTrx);
    setShowReceiptModal(true);

    clearCart();
    setCustomerName('');
    if (isMobileLandscape) {
      setMobileLandscapeTab('menu');
    }
  };

  const handleOpenRestock = (item: PackagingItem) => {
    setSelectedPkgForRestock(item);
    setRestockAmount(50);
  };

  const handleSaveRestock = () => {
    if (!selectedPkgForRestock || restockAmount <= 0) return;
    setPackagingList(prev => prev.map(item => {
      if (item.id === selectedPkgForRestock.id) {
        return {
          ...item,
          stock: item.stock + restockAmount
        };
      }
      return item;
    }));
    audioPlayer.playSuccess();
    showToast(`Stok ${selectedPkgForRestock.name} bertambah +${restockAmount} ${selectedPkgForRestock.unit}!`);
    setSelectedPkgForRestock(null);
  };

  const handleOpenEditCost = (item: PackagingItem) => {
    setSelectedPkgForEdit(item);
    setEditUnitCost(item.unitCost ?? 0);
    setEditMinStock(item.minStock ?? 0);
  };

  const handleSaveEditCost = () => {
    if (!selectedPkgForEdit) return;
    setPackagingList(prev => prev.map(p => {
      if (p.id === selectedPkgForEdit.id) {
        return {
          ...p,
          unitCost: Math.max(0, Number(editUnitCost) || 0),
          minStock: Math.max(1, Number(editMinStock) || 1)
        };
      }
      return p;
    }));
    audioPlayer.playSuccess();
    showToast(`Biaya kemasan ${selectedPkgForEdit.name} berhasil diperbarui!`);
    setSelectedPkgForEdit(null);
  };

  const handleResetPackagingDefault = () => {
    if (confirm('Reset seluruh data stok & biaya kemasan ke standar awal?')) {
      setPackagingList(INITIAL_PACKAGING);
      localStorage.setItem('rujak_packaging_stock', JSON.stringify(INITIAL_PACKAGING));
      audioPlayer.playSuccess();
      showToast('Stok & HPP kemasan berhasil direset ke standar!');
    }
  };

  // Menu Management Handlers (Tambah, Edit, Hapus Menu)
  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    setMenuFormName('');
    setMenuFormDesc('');
    setMenuFormCategory('Rujak');
    setMenuFormPrice(18000);
    setMenuFormImage('🍍');
    setShowMenuModal(true);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuFormName(item.name);
    setMenuFormDesc(item.description);
    setMenuFormCategory(item.category);
    setMenuFormPrice(item.baseOfflinePrice);
    setMenuFormImage(item.image || '🍍');
    setShowMenuModal(true);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormName.trim()) {
      showToast('Nama menu jualan wajib diisi!');
      return;
    }
    if (menuFormPrice <= 0) {
      showToast('Harga dasar offline harus lebih dari Rp 0!');
      return;
    }

    if (editingMenuItem) {
      // Edit existing menu
      setMenuList(prev => prev.map(m => {
        if (m.id === editingMenuItem.id) {
          return {
            ...m,
            name: menuFormName.trim(),
            description: menuFormDesc.trim(),
            category: menuFormCategory,
            baseOfflinePrice: Number(menuFormPrice),
            image: menuFormImage.trim() || '🍍'
          };
        }
        return m;
      }));
      showToast(`Menu "${menuFormName.trim()}" berhasil diperbarui!`);
    } else {
      // Create new menu
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: menuFormName.trim(),
        description: menuFormDesc.trim(),
        category: menuFormCategory,
        baseOfflinePrice: Number(menuFormPrice),
        image: menuFormImage.trim() || '🍍'
      };
      setMenuList(prev => [newItem, ...prev]);
      showToast(`Menu baru "${newItem.name}" berhasil ditambahkan!`);
    }

    audioPlayer.playSuccess();
    setShowMenuModal(false);
  };

  const handleDeleteMenu = (item: MenuItem) => {
    if (confirm(`Yakin ingin menghapus menu "${item.name}" dari daftar jualan? Menu ini tidak akan muncul lagi di kasir POS.`)) {
      setMenuList(prev => prev.filter(m => m.id !== item.id));
      setCart(prev => prev.filter(c => c.menuItem.id !== item.id));
      audioPlayer.playBeep();
      showToast(`Menu "${item.name}" berhasil dihapus!`);
    }
  };

  const handleResetMenuDefault = () => {
    if (confirm('Reset seluruh daftar menu kembali ke menu standar bawaan Rujak Mba Uus?')) {
      setMenuList(MENU_ITEMS);
      localStorage.setItem('rujak_menu_items', JSON.stringify(MENU_ITEMS));
      audioPlayer.playSuccess();
      showToast('Daftar menu jualan berhasil direset ke standar!');
    }
  };

  const handleBluetoothPrint = async () => {
    audioPlayer.playPrintSound();
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const device = await (navigator as unknown as { bluetooth: { requestDevice: (opt: unknown) => Promise<{ name?: string }> } }).bluetooth.requestDevice({
          filters: [{ namePrefix: 'MPT' }, { namePrefix: 'RPP' }, { namePrefix: 'POS' }, { namePrefix: 'Thermal' }],
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        });
        showToast(`Terhubung ke printer Bluetooth: ${device.name || 'Thermal POS'}!`);
      } catch {
        showToast('Bluetooth dialihkan ke Print Preview thermal...');
        setTimeout(() => window.print(), 500);
      }
    } else {
      showToast('Membuka dialog cetak thermal 58mm...');
      setTimeout(() => window.print(), 400);
    }
  };

  const handleShareWhatsApp = (trx: Transaction) => {
    const textLines = [
      `*RUJAK MBA UUS - STRUK RESMI*`,
      `Alamat: Jl. Mangga Manis No. 18`,
      `WhatsApp: 0812-9876-5432`,
      `--------------------------------`,
      `No: ${trx.receiptNumber}`,
      `Waktu: ${trx.timestamp}`,
      `Kasir: ${trx.cashierName}`,
      `Channel: ${trx.channel}`,
      `Pelanggan: ${trx.customerName || '-'}`,
      `--------------------------------`,
      ...trx.items.map(it => `${it.name} x${it.quantity} (${it.spiciness})\n   Rp ${it.subtotal.toLocaleString('id-ID')}`),
      `--------------------------------`,
      `Subtotal: Rp ${trx.subtotal.toLocaleString('id-ID')}`,
      trx.discount > 0 ? `Diskon: -Rp ${trx.discount.toLocaleString('id-ID')}` : '',
      `*TOTAL: Rp ${trx.finalGrossAmount.toLocaleString('id-ID')}*`,
      `Bayar (${trx.paymentMethod}): Rp ${trx.amountPaid.toLocaleString('id-ID')}`,
      trx.paymentMethod === 'Tunai' ? `Kembalian: Rp ${trx.change.toLocaleString('id-ID')}` : '',
      `--------------------------------`,
      `Matur Nuwun Atas Kunjungannya! 🙏`,
      `Follow IG: @rujakmbauus`
    ].filter(Boolean);

    const fullMsg = encodeURIComponent(textLines.join('\n'));
    window.open(`https://wa.me/?text=${fullMsg}`, '_blank');
  };

  const copyReceiptText = (trx: Transaction) => {
    const summary = `STRUK RUJAK MBA UUS #${trx.receiptNumber}\nTotal: Rp ${trx.finalGrossAmount.toLocaleString('id-ID')} (${trx.paymentMethod})\nWaktu: ${trx.timestamp}`;
    navigator.clipboard.writeText(summary);
    showToast('Teks struk berhasil disalin!');
  };

  // Dashboard Stats (Owner only)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayTransactions = useMemo(() => {
    return transactions.filter(t => t.timestamp.startsWith(todayStr));
  }, [transactions, todayStr]);

  const todayGrossSales = useMemo(() => {
    return todayTransactions.reduce((acc, t) => acc + t.finalGrossAmount, 0);
  }, [todayTransactions]);

  const todayNetProfit = useMemo(() => {
    return todayTransactions.reduce((acc, t) => acc + t.netProfit, 0);
  }, [todayTransactions]);

  const todayPortionsCount = useMemo(() => {
    return todayTransactions.reduce((acc, t) => {
      return acc + t.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  }, [todayTransactions]);

  // Full Financial Report Calculations (Owner only)
  const reportSummary = useMemo(() => {
    const grossTotal = transactions.reduce((acc, t) => acc + t.finalGrossAmount, 0);
    const platformTotal = transactions.reduce((acc, t) => acc + t.platformFeeNominal, 0);
    const netReceivedTotal = transactions.reduce((acc, t) => acc + t.netReceived, 0);
    const freshHppTotal = transactions.reduce((acc, t) => acc + t.totalFreshHpp, 0);
    const packagingCostTotal = transactions.reduce((acc, t) => acc + t.totalPackagingCost, 0);
    const netProfitTotal = transactions.reduce((acc, t) => acc + t.netProfit, 0);
    const totalTransactions = transactions.length;

    const channelMap: Record<Channel, { count: number; gross: number; profit: number }> = {
      Offline: { count: 0, gross: 0, profit: 0 },
      GoFood: { count: 0, gross: 0, profit: 0 },
      ShopeeFood: { count: 0, gross: 0, profit: 0 },
      GrabFood: { count: 0, gross: 0, profit: 0 },
    };

    transactions.forEach(t => {
      if (channelMap[t.channel]) {
        channelMap[t.channel].count += 1;
        channelMap[t.channel].gross += t.finalGrossAmount;
        channelMap[t.channel].profit += t.netProfit;
      }
    });

    return {
      grossTotal,
      platformTotal,
      netReceivedTotal,
      freshHppTotal,
      packagingCostTotal,
      netProfitTotal,
      totalTransactions,
      channelMap
    };
  }, [transactions]);

  const filteredReceipts = useMemo(() => {
    if (!receiptSearchQuery.trim()) return transactions;
    const q = receiptSearchQuery.toLowerCase();
    return transactions.filter(t => 
      t.receiptNumber.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      t.channel.toLowerCase().includes(q)
    );
  }, [transactions, receiptSearchQuery]);

  // =========================================================================
  // RENDER CART & CHECKOUT: CLEAN, SELF-CONTAINED, ZERO OVERLAPPING TEXT
  // =========================================================================
  const renderCartAndCheckout = (isCompactLayout = false) => (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden ${
      isCompactLayout ? 'p-3' : 'p-4 sm:p-5'
    }`}>
      {/* Cart Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">Pesanan Aktif</h3>
            <span className="text-[10px] text-slate-400 font-medium block truncate">
              {cart.length} item dipilih ({cartPortionCount} porsi)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* If on mobile landscape tab mode, show button to back to menu */}
          {isLandscape && landscapeLayoutMode === 'tab' && (
            <button
              onClick={() => {
                setMobileLandscapeTab('menu');
                audioPlayer.playBeep();
              }}
              className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tambah Menu</span>
            </button>
          )}

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 flex-1">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-700">Keranjang Masih Kosong</p>
          <span className="text-[10px] text-slate-400 max-w-[220px]">
            Pilih varian rujak dari katalog menu untuk memulai pesanan kasir
          </span>
          {isLandscape && landscapeLayoutMode === 'tab' && (
            <button
              onClick={() => setMobileLandscapeTab('menu')}
              className="mt-2 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buka Menu Rujak</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Items List & Order Inputs */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            
            {/* List of Cart Items */}
            <div className="divide-y divide-slate-100 space-y-1.5">
              {cart.map((cItem, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pt-1.5 first:pt-0 gap-2">
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-bold text-slate-900 truncate text-[11px] sm:text-xs leading-snug">
                      {cItem.menuItem.name}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-orange-600 font-semibold truncate">
                      {cItem.spicinessLevel !== '-' && `Pedas: ${cItem.spicinessLevel}`}
                      {cItem.notes && ` • ${cItem.notes}`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Rp {cItem.channelPrice.toLocaleString('id-ID')} / porsi
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQty(idx, -1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 font-bold text-[11px] text-slate-900 min-w-[18px] text-center">
                        {cItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(idx, 1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-extrabold text-slate-900 w-16 text-right text-[11px] sm:text-xs">
                      Rp {(cItem.channelPrice * cItem.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs & options inside scroll area */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {/* Cutlery Toggle */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
                <span className="font-medium truncate pr-1">🥄 Sendok & Garpu Kemasan</span>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={includeCutlery}
                    onChange={(e) => setIncludeCutlery(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-3.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Customer & Discount Inputs */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="min-w-0">
                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Nama Pelanggan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk Budi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-[11px] p-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Potongan / Diskon:</label>
                  <input
                    type="number"
                    placeholder="Rp 0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full text-[11px] p-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Metode Pembayaran:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {(['Tunai', 'QRIS', 'Transfer', 'Saldo Merchant'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      onClick={() => {
                        setSelectedPayment(pm);
                        audioPlayer.playBeep();
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors truncate ${
                        selectedPayment === pm
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{pm}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tunai quick inputs */}
              {selectedPayment === 'Tunai' && (
                <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-1">
                    <span className="font-bold text-orange-950 text-[10px] shrink-0">Uang Diterima:</span>
                    <input
                      type="number"
                      placeholder="Nominal"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="w-28 text-right p-1 bg-white font-bold text-xs rounded-lg border border-orange-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <button
                      onClick={() => setCashGiven(cartFinalGross.toString())}
                      className="px-2 py-0.5 bg-white text-[9px] font-bold text-orange-700 rounded-md border border-orange-200 hover:bg-orange-100"
                    >
                      Uang Pas
                    </button>
                    {[20000, 50000, 100000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setCashGiven(amt.toString())}
                        className="px-1.5 py-0.5 bg-white text-[9px] font-bold text-slate-700 rounded-md border border-slate-200 hover:bg-slate-100"
                      >
                        {(amt/1000)}k
                      </button>
                    ))}
                  </div>

                  {numericCashGiven > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-orange-200/60 text-[10px]">
                      <span className="font-semibold text-slate-700">Kembalian:</span>
                      <span className={`font-black ${isCashInsufficient ? 'text-red-600' : 'text-emerald-700'}`}>
                        {isCashInsufficient
                          ? `Kurang Rp ${(cartFinalGross - numericCashGiven).toLocaleString('id-ID')}`
                          : `Rp ${changeAmount.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pinned Bottom Checkout Bar (ALWAYS Visible, NEVER covered!) */}
          <div className="pt-2 border-t border-slate-100 shrink-0 mt-2 space-y-1.5">
            <div className="flex justify-between items-baseline text-slate-900">
              <span className="text-[11px] font-bold">Total Tagihan:</span>
              <span className="text-sm sm:text-base font-black text-orange-600">
                Rp {cartFinalGross.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCashInsufficient}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] ${
                isCashInsufficient
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Selesaikan & Cetak Struk</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-2.5 z-50 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900/95 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= COMPACT TOP HEADER ================= */}
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 ${
        isLandscape ? 'py-1.5 px-3 sm:px-5' : 'py-2 px-3 sm:px-6'
      }`}>
        {/* Brand identity */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs font-black text-sm sm:text-base shrink-0">
            🍍
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 truncate">
                Rujak Mba Uus
              </h1>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-700'
              }`}>
                {role === 'owner' ? 'Owner' : 'Kasir'}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium truncate hidden sm:block">
              Buah Segar & Sambal Aren
            </p>
          </div>
        </div>

        {/* Landscape Tab Switcher in Header (when bottom nav is absent) */}
        {isLandscape && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl shrink-0">
            {role === 'kasir' ? (
              <>
                <button
                  onClick={() => { setActiveTab('pos'); audioPlayer.playBeep(); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'pos' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Kasir POS</span>
                  {cart.length > 0 && (
                    <span className="w-3.5 h-3.5 bg-white text-orange-600 rounded-full text-[8px] flex items-center justify-center font-black">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('receipts'); audioPlayer.playBeep(); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'receipts' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <History className="w-3 h-3" />
                  <span>Riwayat Struk</span>
                </button>
                <button
                  onClick={() => { setActiveTab('packaging'); audioPlayer.playBeep(); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'packaging' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  <span>Kemasan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('dashboard'); audioPlayer.playBeep(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={() => { setActiveTab('pos'); audioPlayer.playBeep(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    activeTab === 'pos' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  POS ({cart.length})
                </button>
                <button
                  onClick={() => { setActiveTab('menu'); audioPlayer.playBeep(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    activeTab === 'menu' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Menu ({menuList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('packaging'); audioPlayer.playBeep(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    activeTab === 'packaging' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Kemasan
                </button>
                <button
                  onClick={() => { setActiveTab('margin'); audioPlayer.playBeep(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    activeTab === 'margin' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  HPP
                </button>
                <button
                  onClick={() => { setActiveTab('report'); audioPlayer.playBeep(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    activeTab === 'report' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Laporan
                </button>
              </>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={toggleSound}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title={soundEnabled ? 'Mute' : 'Aktifkan Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 ${isFullscreen ? 'text-orange-600 bg-orange-50' : ''}`}
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSwitchRoleClick}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border transition-all ${
              role === 'owner'
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {role === 'owner' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Owner</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Masuk Owner</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className={`flex-1 w-full ${isLandscape ? 'p-2 sm:p-2.5 overflow-hidden' : 'p-3.5 pb-28 overflow-y-auto'}`}>
        
        {/* ================= TAB: DASHBOARD (OWNER ONLY) ================= */}
        {role === 'owner' && activeTab === 'dashboard' && (
          <div className="space-y-3.5 max-w-6xl mx-auto overflow-y-auto max-h-[calc(100dvh-4rem)] pr-1">
            {lowStockItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <p className="text-[11px] text-amber-800 font-semibold truncate">
                    {lowStockItems.length} Kemasan Menipis: {lowStockItems.map(i => `${i.name} (${i.stock})`).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('packaging')}
                  className="text-xs font-bold text-orange-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shrink-0"
                >
                  Lihat Stok
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-3 text-white shadow-xs">
                <span className="text-[11px] opacity-90 block">Omset Hari Ini</span>
                <div className="text-base sm:text-lg font-extrabold mt-1 truncate">
                  Rp {todayGrossSales.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] opacity-80 mt-0.5 block truncate">
                  {todayTransactions.length} Pesanan ({todayPortionsCount} Porsi)
                </span>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-3 text-white shadow-xs">
                <span className="text-[11px] opacity-90 block">Laba Bersih Hari Ini</span>
                <div className="text-base sm:text-lg font-extrabold mt-1 truncate">
                  Rp {todayNetProfit.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] opacity-80 mt-0.5 block truncate">
                  Margin: {todayGrossSales > 0 ? ((todayNetProfit / todayGrossSales) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Total Modal HPP</span>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 truncate">
                  Rp {todayTransactions.reduce((acc, t) => acc + t.totalFreshHpp + t.totalPackagingCost, 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Bahan Segar + Kemasan</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Fee Komisi Online</span>
                <div className="text-base sm:text-lg font-extrabold text-red-600 mt-1 truncate">
                  -Rp {todayTransactions.reduce((acc, t) => acc + t.platformFeeNominal, 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Potongan Platform</span>
              </div>
            </div>

            {/* ================= MONITORING STOK YANG AKAN HABIS ================= */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl shrink-0 ${lowStockItems.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      Informasi Stok Kemasan Akan Habis
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Pantauan real-time ketersediaan packaging rujak operasional toko
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    lowStockItems.length > 0
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}>
                    {lowStockItems.length > 0 ? `⚠️ ${lowStockItems.length} Kemasan Perlu Restock` : '✅ Semua Kemasan Aman'}
                  </span>
                  <button
                    onClick={() => setActiveTab('packaging')}
                    className="text-[10px] sm:text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Kelola Stok</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* JIKA ADA STOK MENIPIS / KRITIS */}
              {lowStockItems.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {lowStockItems.map(item => {
                      const stock = Number(item.stock) || 0;
                      const min = Number(item.minStock) || 10;
                      const isCrit = stock <= 10;
                      const safeDivisor = Math.max(1, min * 2.5);
                      const pct = Math.min(100, Math.max(0, (stock / safeDivisor) * 100));

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isCrit
                              ? 'bg-red-50/80 border-red-200'
                              : 'bg-amber-50/70 border-amber-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full inline-block mb-1 ${
                                isCrit ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isCrit ? 'Kritis Segera Habis' : 'Stok Menipis'}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                            </div>
                            <button
                              onClick={() => handleOpenRestock(item)}
                              className="px-2 py-1 rounded-lg bg-white shadow-xs text-orange-600 hover:bg-orange-50 border border-orange-200 text-[10px] font-bold flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Restock</span>
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold">
                              <span className="text-slate-500">Sisa Fisik:</span>
                              <span className={`font-black ${isCrit ? 'text-red-700' : 'text-amber-800'}`}>
                                {stock} {item.unit} <span className="text-slate-400 font-normal">(Min: {min})</span>
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isCrit ? 'bg-red-500' : 'bg-amber-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 pt-0.5">
                              Cukup untuk melayani ±{stock} porsi lagi
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* JIKA SEMUA STOK AMAN */
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-emerald-950 block">Seluruh Stok Kemasan Operasional Aman</span>
                      <span className="text-[10px] text-emerald-700">Thinwall, sendok garpu, cup sambal, dan label stiker dalam jumlah cukup.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {packagingList.map(item => (
                      <span key={item.id} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-slate-700">
                        {item.name.split(' ')[0]}: {item.stock} {item.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottleneck Info Banner */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-2">
                <span className="flex items-center gap-1 font-medium">
                  <span>💡</span>
                  <span>Kapasitas porsi siap saji: <strong>Maks. {packagingList.find(p => p.category === 'container')?.stock || 0} porsi rujak</strong> (berdasarkan sisa Thinwall mangkok).</span>
                </span>
                <span className="text-orange-600 font-bold">Terpotong otomatis tiap transaksi</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-xs font-bold text-slate-800">Distribusi Saluran Penjualan</h3>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['Offline', 'GoFood', 'ShopeeFood', 'GrabFood'] as Channel[]).map(ch => {
                    const chCount = todayTransactions.filter(t => t.channel === ch).length;
                    const chGross = todayTransactions.filter(t => t.channel === ch).reduce((s, t) => s + t.finalGrossAmount, 0);
                    return (
                      <div key={ch} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-700 block truncate">{ch}</span>
                        <span className="text-sm font-extrabold text-slate-900 block my-0.5">{chCount}</span>
                        <span className="text-[9px] text-slate-500 font-medium block truncate">
                          {chGross > 0 ? `Rp ${(chGross/1000).toFixed(0)}k` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">Transaksi Kasir Terbaru</h3>
                  <button onClick={() => setActiveTab('report')} className="text-[11px] font-bold text-orange-600">
                    Laporan Lengkap
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1 text-xs">
                  {transactions.slice(0, 4).map(trx => (
                    <div key={trx.id} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{trx.customerName || 'Pelanggan'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{trx.receiptNumber} • {trx.channel}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-slate-900">Rp {trx.finalGrossAmount.toLocaleString('id-ID')}</div>
                        <span className="text-[9px] text-slate-400">{trx.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: KASIR POS ================= */}
        {activeTab === 'pos' && (
          <div className="w-full h-full max-w-7xl mx-auto">
            {isLandscape ? (
              /* =========================================================
                 LANDSCAPE MODE: TAILORED FOR MOBILE & TABLETS
                 Zero overlapping text! Seamless Tab or Split 2-Column mode!
                 ========================================================= */
              <div className="w-full h-[calc(100dvh-3.2rem)] flex flex-col overflow-hidden">
                
                {/* Mobile Landscape Sub-Navigation: Toggle between Menu & Pesanan Aktif, plus Split option */}
                <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs mb-2 flex items-center justify-between gap-2 shrink-0">
                  {/* Left: View Switcher */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setLandscapeLayoutMode('tab');
                        setMobileLandscapeTab('menu');
                        audioPlayer.playBeep();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        landscapeLayoutMode === 'tab' && mobileLandscapeTab === 'menu'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>🍍 Katalog Menu</span>
                      <span className="text-[10px] opacity-80">({filteredMenuItems.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setLandscapeLayoutMode('tab');
                        setMobileLandscapeTab('cart');
                        audioPlayer.playBeep();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        landscapeLayoutMode === 'tab' && mobileLandscapeTab === 'cart'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Pesanan Aktif</span>
                      {cart.length > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                          landscapeLayoutMode === 'tab' && mobileLandscapeTab === 'cart'
                            ? 'bg-white text-orange-600'
                            : 'bg-orange-600 text-white'
                        }`}>
                          {cart.length}
                        </span>
                      )}
                      {cartFinalGross > 0 && (
                        <span className="text-[10px] font-semibold opacity-90 hidden sm:inline">
                          • Rp {cartFinalGross.toLocaleString('id-ID')}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Right: Layout Toggle (Tab vs 2-Column Split) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setLandscapeLayoutMode(prev => prev === 'tab' ? 'split' : 'tab');
                        audioPlayer.playBeep();
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1"
                      title={landscapeLayoutMode === 'tab' ? 'Ubah ke Tampilan Split 2-Kolom' : 'Ubah ke Tampilan Tab Fokus'}
                    >
                      {landscapeLayoutMode === 'tab' ? (
                        <>
                          <Columns2 className="w-3 h-3 text-orange-600" />
                          <span className="hidden sm:inline">Split 2 Kolom</span>
                        </>
                      ) : (
                        <>
                          <LayoutList className="w-3 h-3 text-orange-600" />
                          <span className="hidden sm:inline">Tab Fokus</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* --- LAYOUT MODE 1: FOCUSED TAB (DEFAULT FOR MOBILE LANDSCAPE) --- */}
                {landscapeLayoutMode === 'tab' ? (
                  <div className="flex-1 overflow-hidden relative">
                    {mobileLandscapeTab === 'menu' ? (
                      /* MENU VIEW: FULL WIDTH, CLEAN, SPACIOUS */
                      <div className="h-full flex flex-col space-y-2 overflow-hidden">
                        
                        {/* 1. Baris Terpisah: Jenis / Saluran Pesanan & Pencarian */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-slate-500 shrink-0 hidden sm:inline">
                              Saluran:
                            </span>
                            <div className="grid grid-cols-4 gap-1 flex-1 min-w-0">
                              {(['Offline', 'GoFood', 'ShopeeFood', 'GrabFood'] as Channel[]).map(ch => {
                                const isSelected = selectedChannel === ch;
                                return (
                                  <button
                                    key={ch}
                                    onClick={() => {
                                      setSelectedChannel(ch);
                                      audioPlayer.playBeep();
                                    }}
                                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all truncate text-center ${
                                      isSelected
                                        ? ch === 'Offline'
                                          ? 'bg-slate-900 text-white shadow-xs'
                                          : ch === 'GoFood'
                                          ? 'bg-red-600 text-white shadow-xs'
                                          : ch === 'ShopeeFood'
                                          ? 'bg-orange-600 text-white shadow-xs'
                                          : 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                                    }`}
                                  >
                                    <span className="truncate">{ch}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Search */}
                          <div className="relative w-28 sm:w-36 shrink-0">
                            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Cari menu..."
                              value={menuSearchQuery}
                              onChange={(e) => setMenuSearchQuery(e.target.value)}
                              className="w-full pl-6 pr-2 py-1 bg-slate-50 rounded-lg text-[10px] border border-slate-200 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>

                        {/* 2. Baris Terpisah: Pilihan Level Pedas Rujak & Kategori */}
                        <div className="bg-white px-2 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0 flex items-center gap-1">
                              <span>🌶️</span>
                              <span>Level Pedas:</span>
                            </span>
                            <div className="flex items-center gap-1">
                              {['Tidak Pedas', 'Sedang', 'Pedas', 'Extra Pedas'].map(lvl => (
                                <button
                                  key={lvl}
                                  onClick={() => {
                                    setSelectedSpiciness(lvl);
                                    audioPlayer.playBeep();
                                  }}
                                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-colors ${
                                    selectedSpiciness === lvl
                                      ? 'bg-orange-500 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Filter Kategori Menu */}
                          <div className="flex items-center gap-1 shrink-0">
                            {(['Semua', 'Rujak', 'Extra', 'Pelengkap'] as const).map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setSelectedCategoryFilter(cat);
                                  audioPlayer.playBeep();
                                }}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap transition-colors ${
                                  selectedCategoryFilter === cat
                                    ? 'bg-slate-800 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Menu Catalog Grid: Spacious, Multi-column, NEVER CRAMPED */}
                        <div className="flex-1 overflow-y-auto pr-1 pb-16">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {filteredMenuItems.map(item => {
                              const price = getItemPrice(item, selectedChannel);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => addToCart(item)}
                                  className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-orange-300 shadow-xs flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] transition-all"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-2xl p-1 bg-orange-50 rounded-lg shrink-0">
                                      {item.image}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xs font-bold text-slate-900 truncate">
                                        {item.name}
                                      </h4>
                                      <p className="text-[9px] text-slate-400 truncate">
                                        {item.description}
                                      </p>
                                      <span className="text-xs font-black text-orange-600 block mt-0.5">
                                        Rp {price.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(item);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center gap-1 font-bold text-[11px] transition-colors shrink-0"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Floating Active Order Action Bar at Bottom (Padded so it never covers items) */}
                        {cart.length > 0 && (
                          <div className="absolute bottom-1 left-2 right-2 bg-slate-900/95 text-white p-2 sm:p-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-xs shrink-0">
                                {cart.length}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-300 block truncate">
                                  {cartPortionCount} Porsi Terpilih
                                </span>
                                <span className="text-xs sm:text-sm font-black text-orange-400 block truncate">
                                  Rp {cartFinalGross.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setMobileLandscapeTab('cart');
                                audioPlayer.playBeep();
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                            >
                              <span>Lihat Pesanan & Bayar</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                      </div>
                    ) : (
                      /* ACTIVE ORDER & CHECKOUT: FULL WIDTH WORKSPACE */
                      <div className="h-full overflow-hidden">
                        {renderCartAndCheckout(false)}
                      </div>
                    )}
                  </div>
                ) : (
                  /* --- LAYOUT MODE 2: SPLIT 2-COLUMN (SIDE-BY-SIDE) --- */
                  <div className="flex-1 flex gap-2.5 overflow-hidden items-stretch">
                    {/* Left: Menu (55%) */}
                    <div className="w-[55%] h-full flex flex-col space-y-1.5 overflow-hidden">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-1.5 shrink-0">
                        {/* Channel Selector */}
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          {(['Offline', 'GoFood', 'ShopeeFood', 'GrabFood'] as Channel[]).map(ch => {
                            const isSelected = selectedChannel === ch;
                            return (
                              <button
                                key={ch}
                                onClick={() => {
                                  setSelectedChannel(ch);
                                  audioPlayer.playBeep();
                                }}
                                className={`flex-1 py-1 px-1 rounded-lg text-[9px] font-bold transition-all truncate ${
                                  isSelected
                                    ? ch === 'Offline'
                                      ? 'bg-slate-900 text-white'
                                      : ch === 'GoFood'
                                      ? 'bg-red-600 text-white'
                                      : ch === 'ShopeeFood'
                                      ? 'bg-orange-600 text-white'
                                      : 'bg-emerald-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                                }`}
                              >
                                <span className="truncate">{ch}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Search menu */}
                        <div className="relative w-24 shrink-0">
                          <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari..."
                            value={menuSearchQuery}
                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                            className="w-full pl-6 pr-2 py-1 bg-slate-50 rounded-lg text-[10px] border border-slate-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Level Pedas */}
                      <div className="flex items-center justify-between gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0 text-[10px]">
                        <span className="font-bold text-slate-500 shrink-0">🌶️ Pedas:</span>
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {['Tidak Pedas', 'Sedang', 'Pedas', 'Extra Pedas'].map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => {
                                setSelectedSpiciness(lvl);
                                audioPlayer.playBeep();
                              }}
                              className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-colors ${
                                selectedSpiciness === lvl ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Menu List */}
                      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                        {filteredMenuItems.map(item => {
                          const price = getItemPrice(item, selectedChannel);
                          return (
                            <div
                              key={item.id}
                              onClick={() => addToCart(item)}
                              className="bg-white p-2 rounded-xl border border-slate-200 hover:border-orange-300 shadow-xs flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-xl p-1 bg-orange-50 rounded-lg shrink-0">
                                  {item.image}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {item.name}
                                  </h4>
                                  <span className="text-xs font-black text-orange-600 block">
                                    Rp {price.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>

                              <button
                                className="px-2 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center gap-1 font-bold text-[10px] transition-colors shrink-0"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Tambah</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Pesanan Aktif (45%) */}
                    <div className="w-[45%] h-full shrink-0">
                      {renderCartAndCheckout(true)}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* =========================================================
                 PORTRAIT VIEW (Smartphones held vertically)
                 ========================================================= */
              <div className="space-y-3.5 max-w-xl mx-auto">
                {/* Channel Selector */}
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 px-1 block">Saluran Pesanan:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['Offline', 'GoFood', 'ShopeeFood', 'GrabFood'] as Channel[]).map(ch => {
                      const isSelected = selectedChannel === ch;
                      return (
                        <button
                          key={ch}
                          onClick={() => {
                            setSelectedChannel(ch);
                            audioPlayer.playBeep();
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                            isSelected
                              ? ch === 'Offline'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : ch === 'GoFood'
                                ? 'bg-red-600 text-white shadow-xs'
                                : ch === 'ShopeeFood'
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                          }`}
                        >
                          <span className="truncate">{ch}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level Pedas */}
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="text-[11px] font-bold text-slate-600 shrink-0">🌶️ Level Pedas:</span>
                  <div className="flex items-center gap-1">
                    {['Tidak Pedas', 'Sedang', 'Pedas', 'Extra Pedas'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setSelectedSpiciness(lvl);
                          audioPlayer.playBeep();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                          selectedSpiciness === lvl ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Catalog */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-800">Daftar Menu Rujak Segar</h3>
                    <span className="text-[10px] text-slate-400">Harga: {selectedChannel}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredMenuItems.map(item => {
                      const price = getItemPrice(item, selectedChannel);
                      return (
                        <div
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-orange-300 shadow-xs cursor-pointer flex items-center justify-between gap-2 active:scale-[0.98]"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className="text-2xl p-1 bg-orange-50 rounded-xl shrink-0">
                              {item.image}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                              <span className="text-xs font-extrabold text-orange-600 mt-1 block">
                                Rp {price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                          <button className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center justify-center font-bold text-sm shrink-0">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cart & Checkout in Portrait */}
                {renderCartAndCheckout(false)}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: RIWAYAT STRUK KASIR ================= */}
        {role === 'kasir' && activeTab === 'receipts' && (
          <div className="space-y-3 max-w-6xl mx-auto overflow-y-auto max-h-[calc(100dvh-4rem)] pr-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-3 rounded-2xl text-white shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold tracking-tight">Riwayat Struk Penjualan</h2>
                <p className="text-[10px] opacity-80">Cari nota transaksi kasir & cetak ulang struk thermal Bluetooth / PDF.</p>
              </div>
              <Receipt className="w-5 h-5 text-orange-400" />
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor struk atau nama pelanggan..."
                value={receiptSearchQuery}
                onChange={(e) => setReceiptSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredReceipts.map(trx => (
                <div key={trx.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{trx.channel}</span>
                      <span className="text-[10px] text-slate-400">{trx.timestamp}</span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1.5 truncate">{trx.customerName || 'Pelanggan'}</div>
                    <div className="text-[10px] text-slate-400 truncate">{trx.receiptNumber} • {trx.paymentMethod}</div>
                    <div className="mt-1 text-xs font-black text-orange-600">Rp {trx.finalGrossAmount.toLocaleString('id-ID')}</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveReceipt(trx);
                      setShowReceiptModal(true);
                      audioPlayer.playBeep();
                    }}
                    className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-orange-400" />
                    <span>Cetak Struk</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: KELOLA DAFTAR MENU (OWNER ONLY) ================= */}
        {role === 'owner' && activeTab === 'menu' && (
          <div className="space-y-3.5 max-w-6xl mx-auto overflow-y-auto max-h-[calc(100dvh-4rem)] pr-1">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-3.5 rounded-2xl text-white shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-extrabold tracking-tight">Kelola Daftar Menu Jualan</h2>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 font-bold">Akses Owner</span>
                </div>
                <p className="text-[10px] opacity-90 mt-0.5">
                  Tambah menu baru, perbarui harga jual offline & online, atau hapus menu. Data langsung sinkron ke Kasir POS.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/10 shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Quick Stats & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900">Total Menu:</span>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-extrabold text-xs">
                  {menuList.length} Item
                </span>
                <span className="text-[10px] text-slate-400">|</span>
                <span className="text-[10px] font-semibold text-slate-600">
                  Rujak: {menuList.filter(m => m.category === 'Rujak').length}
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] font-semibold text-slate-600">
                  Extra: {menuList.filter(m => m.category === 'Extra').length}
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] font-semibold text-slate-600">
                  Pelengkap: {menuList.filter(m => m.category === 'Pelengkap').length}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetMenuDefault}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Kembalikan menu ke standar bawaan"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Standar</span>
                </button>
                <button
                  onClick={handleOpenAddMenu}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu</span>
                </button>
              </div>
            </div>

            {/* Filter Kategori & Pencarian */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
                {(['Semua', 'Rujak', 'Extra', 'Pelengkap'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategoryFilter(cat);
                      audioPlayer.playBeep();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategoryFilter === cat
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama menu atau bahan..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500 shadow-xs"
                />
              </div>
            </div>

            {/* Grid List Menu Cards */}
            {filteredMenuItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-2xl">
                  🍍
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Tidak ada menu yang sesuai</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Coba sesuaikan kata kunci pencarian atau tambahkan menu baru.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddMenu}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Menu Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredMenuItems.map(item => {
                  const onlinePrice = getItemPrice(item, 'GoFood');
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-orange-200 shadow-xs flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl p-2 bg-orange-50 rounded-xl shrink-0 border border-orange-100">
                              {item.image || '🍍'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {item.name}
                              </h4>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                item.category === 'Rujak'
                                  ? 'bg-orange-100 text-orange-800'
                                  : item.category === 'Extra'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {item.description || 'Tidak ada deskripsi'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-medium">Harga Offline:</span>
                            <span className="font-black text-slate-900">
                              Rp {item.baseOfflinePrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-orange-500 block font-medium">Online Food (20%):</span>
                            <span className="font-extrabold text-orange-600">
                              Rp {onlinePrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => handleOpenEditMenu(item)}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>Edit Menu</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(item)}
                            className="py-1.5 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center transition-colors"
                            title={`Hapus ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: MANAJEMEN STOK KEMASAN ================= */}
        {activeTab === 'packaging' && (
          <div className="space-y-3 max-w-6xl mx-auto overflow-y-auto max-h-[calc(100dvh-4rem)] pr-1">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-2xl text-white shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold tracking-tight">Ketersediaan Stok Kemasan & Packaging</h2>
                <p className="text-[10px] opacity-90">Terpotong otomatis setiap transaksi kasir tersimpan.</p>
              </div>
              <Package className="w-5 h-5 text-white" />
            </div>

            {role === 'owner' && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Total Biaya Kemasan / Porsi</span>
                  <span className="text-sm font-black text-slate-900">Rp {(standardPackagingCost || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetPackagingDefault}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center gap-1 transition-colors"
                    title="Reset stok dan biaya ke pengaturan awal"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Reset Standar</span>
                  </button>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Akses Owner</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {packagingList.map(item => {
                const currentStock = typeof item.stock === 'number' && !isNaN(item.stock) ? item.stock : 0;
                const minStock = typeof item.minStock === 'number' && !isNaN(item.minStock) ? item.minStock : 10;
                const unitCost = typeof item.unitCost === 'number' && !isNaN(item.unitCost) ? item.unitCost : 0;
                const isLow = currentStock <= minStock;
                const isCritical = currentStock <= 10;
                const safeDivisor = Math.max(1, minStock * 2.5);
                const percent = Math.min(100, Math.max(0, (currentStock / safeDivisor) * 100));

                return (
                  <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                            isCritical ? 'bg-red-100 text-red-700 animate-pulse' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isCritical ? 'Kritis' : isLow ? 'Menipis' : 'Aman'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">Min operasional: {minStock} {item.unit}</p>
                      </div>
                      <button
                        onClick={() => handleOpenRestock(item)}
                        className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3 h-3" /> Tambah
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5 font-semibold">
                        <span className="text-slate-500">Sisa Fisik:</span>
                        <span className={`font-black ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {currentStock} {item.unit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {role === 'owner' && (
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Harga Beli / unit:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">Rp {unitCost.toLocaleString('id-ID')}</span>
                          <button
                            onClick={() => handleOpenEditCost(item)}
                            className="p-1 hover:bg-orange-50 text-orange-600 rounded-md transition-colors"
                            title="Ubah harga modal kemasan"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB: KALKULATOR HPP & MARGIN (OWNER ONLY) ================= */}
        {role === 'owner' && activeTab === 'margin' && (
          <div className="space-y-4 max-w-5xl mx-auto overflow-y-auto max-h-[calc(100dvh-4rem)] pr-1">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-3.5 rounded-2xl text-white shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Kalkulator Margin & Simulasi HPP Multi-Channel</h2>
                <p className="text-[10px] opacity-80">Hitung otomatis laba bersih setelah potongan komisi GoFood, Shopee, Grab (20%).</p>
              </div>
              <Calculator className="w-6 h-6 text-orange-400" />
            </div>

            {/* Input Parameter Dasar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">1. HPP Bahan Buah Segar:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={baseFreshHpp}
                    onChange={(e) => setBaseFreshHpp(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[9px] text-slate-400">Rata-rata buah mangga, nanas, jambu, gula aren, kacang, cabai per porsi.</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">2. Total Biaya Kemasan:</span>
                <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-extrabold text-orange-900">
                  Rp {standardPackagingCost.toLocaleString('id-ID')} / porsi
                </div>
                <p className="text-[9px] text-slate-400">Thinwall + Sendok Garpu + Cup Sambal + Stiker Kemasan.</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">3. Total HPP Pokok Produksi:</span>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
                  Rp {(baseFreshHpp + standardPackagingCost).toLocaleString('id-ID')} / porsi
                </div>
                <p className="text-[9px] text-slate-400">Bahan segar (Rp {baseFreshHpp.toLocaleString()}) + Kemasan (Rp {standardPackagingCost.toLocaleString()}).</p>
              </div>
            </div>

            {/* Matrix Simulasi Perbandingan Channel */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Tabel Komparasi Laba Bersih Per Channel</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(['Offline', 'GoFood', 'ShopeeFood', 'GrabFood'] as Channel[]).map(ch => {
                  const isOff = ch === 'Offline';
                  const sellPrice = isOff ? calcOfflinePrice : calcOnlinePrice;
                  const feePct = commissions[ch] || 0;
                  const feeNominal = Math.round((sellPrice * feePct) / 100);
                  const netReceive = sellPrice - feeNominal;
                  const totalHpp = baseFreshHpp + standardPackagingCost;
                  const profit = netReceive - totalHpp;
                  const marginPct = sellPrice > 0 ? ((profit / sellPrice) * 100).toFixed(1) : '0';

                  return (
                    <div key={ch} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{ch}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                          Fee {feePct}%
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] pt-1 border-t border-slate-200">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Harga Jual:</span>
                          <span className="font-bold">Rp {sellPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Potongan Fee:</span>
                          <span>-Rp {feeNominal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Diterima Toko:</span>
                          <span className="font-bold">Rp {netReceive.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Total Modal HPP:</span>
                          <span>Rp {totalHpp.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 text-xs font-black">
                          <span className="text-emerald-800">Laba Bersih:</span>
                          <span className="text-emerald-700">Rp {profit.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Margin Profit:</span>
                          <span className="font-bold text-orange-600">{marginPct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: LAPORAN KEUANGAN (OWNER ONLY) ================= */}
        {role === 'owner' && activeTab === 'report' && (
          <div className="space-y-4 max-w-6xl mx-auto overflow-y-auto max-h-[calc(100dvh-4rem)] pr-1">
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-3.5 rounded-2xl text-white shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Laporan Rekapitulasi Laba Rugi Toko</h2>
                <p className="text-[10px] opacity-80">Ringkasan akuntansi omset kotor, potongan komisi, modal bahan & kemasan, serta laba bersih riil.</p>
              </div>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>

            {/* Financial Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Omset Kotor</span>
                <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5 truncate">
                  Rp {reportSummary.grossTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-500">{reportSummary.totalTransactions} Total Transaksi</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold block">Komisi Online Food</span>
                <span className="text-sm sm:text-base font-black text-red-600 block mt-0.5 truncate">
                  -Rp {reportSummary.platformTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-500">GoFood, Shopee, Grab</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Biaya Kemasan</span>
                <span className="text-sm sm:text-base font-black text-amber-700 block mt-0.5 truncate">
                  Rp {reportSummary.packagingCostTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-500">Thinwall + Cup + Sendok</span>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-3 rounded-2xl text-white shadow-xs">
                <span className="text-[10px] opacity-80 font-semibold block">Total Laba Bersih</span>
                <span className="text-sm sm:text-base font-black block mt-0.5 truncate">
                  Rp {reportSummary.netProfitTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] opacity-80">
                  Margin: {reportSummary.grossTotal > 0 ? ((reportSummary.netProfitTotal / reportSummary.grossTotal) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {/* Detail Transaksi Table */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">Semua Riwayat Transaksi</h3>
                <span className="text-[10px] text-slate-400">{transactions.length} Transaksi Tercatat</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1 text-xs">
                {transactions.map(trx => (
                  <div key={trx.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 truncate">{trx.customerName || 'Pelanggan'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 text-slate-700">{trx.channel}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{trx.receiptNumber} • {trx.timestamp}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900">Rp {trx.finalGrossAmount.toLocaleString('id-ID')}</div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Laba: Rp {trx.netProfit.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= BOTTOM MOBILE NAVIGATION BAR (PORTRAIT ONLY!) ================= */}
      {/* Exclusively rendered when NOT in landscape, so it NEVER covers text or buttons in landscape! */}
      {!isLandscape && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-center shadow-lg">
          <div className={`w-full max-w-lg ${
            role === 'kasir' ? 'grid grid-cols-3' : 'grid grid-cols-6'
          } py-2 px-1 text-[10px] font-bold text-slate-400`}>
            
            {role === 'kasir' ? (
              <>
                <button
                  onClick={() => { setActiveTab('pos'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'pos' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-orange-600 text-white rounded-full text-[9px] flex items-center justify-center font-black shadow-xs">
                        {cart.length}
                      </span>
                    )}
                  </div>
                  <span>Kasir POS</span>
                </button>

                <button
                  onClick={() => { setActiveTab('receipts'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'receipts' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>Riwayat Struk</span>
                </button>

                <button
                  onClick={() => { setActiveTab('packaging'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'packaging' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <div className="relative">
                    <Package className="w-5 h-5" />
                    {lowStockItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <span>Stok Kemasan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('dashboard'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'dashboard' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span>Beranda</span>
                </button>

                <button
                  onClick={() => { setActiveTab('pos'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'pos' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-orange-600 text-white rounded-full text-[9px] flex items-center justify-center font-black shadow-xs">
                        {cart.length}
                      </span>
                    )}
                  </div>
                  <span>Kasir POS</span>
                </button>

                <button
                  onClick={() => { setActiveTab('menu'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'menu' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <UtensilsCrossed className="w-5 h-5" />
                  <span>Menu</span>
                </button>

                <button
                  onClick={() => { setActiveTab('packaging'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'packaging' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <div className="relative">
                    <Package className="w-5 h-5" />
                    {lowStockItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <span>Kemasan</span>
                </button>

                <button
                  onClick={() => { setActiveTab('margin'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'margin' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                  <span>Margin HPP</span>
                </button>

                <button
                  onClick={() => { setActiveTab('report'); audioPlayer.playBeep(); }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    activeTab === 'report' ? 'text-orange-600' : 'hover:text-slate-600'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Laporan</span>
                </button>
              </>
            )}

          </div>
        </nav>
      )}

      {/* ================= MODAL: RESTOCK KEMASAN ================= */}
      {selectedPkgForRestock && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-xs rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Restock {selectedPkgForRestock.name}</h3>
              </div>
              <button onClick={() => setSelectedPkgForRestock(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Stok saat ini:</span>
                <span className="font-bold text-slate-900">{selectedPkgForRestock.stock} {selectedPkgForRestock.unit}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Jumlah Tambah Stok:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                    className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-400">{selectedPkgForRestock.unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1">
                {[25, 50, 100].map(qty => (
                  <button
                    key={qty}
                    onClick={() => setRestockAmount(qty)}
                    className="py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSelectedPkgForRestock(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRestock}
                className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow-xs"
              >
                Simpan Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BIAYA & BATAS KEMASAN (OWNER ONLY) ================= */}
      {selectedPkgForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-xs rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">Atur Biaya {selectedPkgForEdit.name}</h3>
              </div>
              <button onClick={() => setSelectedPkgForEdit(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Harga Beli / Unit (Rp):</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={0}
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-extrabold text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Biaya modal ini akan otomatis masuk ke perhitungan HPP margin rujak.</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Batas Minimum Peringatan Stok:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Math.max(1, Number(e.target.value)))}
                    className="flex-1 p-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-400">{selectedPkgForEdit.unit}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSelectedPkgForEdit(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditCost}
                className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT MENU JUALAN (OWNER ONLY) ================= */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[94dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-orange-100 text-orange-700">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingMenuItem ? 'Edit Menu Jualan' : 'Tambah Menu Jualan Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {editingMenuItem ? 'Perbarui informasi & harga menu' : 'Menu akan langsung tersedia di kasir POS'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-3 text-xs">
              {/* Nama Menu */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Menu Rujak / Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rujak Cingur Komplit"
                  value={menuFormName}
                  onChange={(e) => setMenuFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* Kategori & Ikon Emoji */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={menuFormCategory}
                    onChange={(e) => setMenuFormCategory(e.target.value as 'Rujak' | 'Extra' | 'Pelengkap')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="Rujak">🍍 Rujak</option>
                    <option value="Extra">🌶️ Extra / Topping</option>
                    <option value="Pelengkap">🥤 Pelengkap / Minuman</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Ikon / Emoji</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 bg-orange-50 rounded-xl border border-orange-200 shrink-0">
                      {menuFormImage || '🍍'}
                    </span>
                    <input
                      type="text"
                      maxLength={4}
                      value={menuFormImage}
                      onChange={(e) => setMenuFormImage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-orange-500 text-center"
                      placeholder="🍍"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Emoji Picker */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Pilih cepat emoji:</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['🍍', '🥭', '🥒', '🍧', '🌶️', '🍘', '🥤', '🥗', '🍉', '🍎', '🍌', '🥥'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setMenuFormImage(emoji)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        menuFormImage === emoji ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harga Dasar Offline */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Harga Jual Offline (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    required
                    value={menuFormPrice}
                    onChange={(e) => setMenuFormPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-xs focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                
                {/* Auto Calculated Online Price Preview */}
                <div className="mt-1.5 p-2 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-[10px]">
                  <span className="text-orange-900">Estimasi Online (GoFood 20%):</span>
                  <span className="font-extrabold text-orange-700">
                    Rp {(Math.ceil((menuFormPrice / 0.8) / 1000) * 1000).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Deskripsi Menu */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Deskripsi Menu (Komposisi Buah / Keterangan)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Mangga muda, nanas madu, jambu air, bumbu sambal aren pedas gurih..."
                  value={menuFormDesc}
                  onChange={(e) => setMenuFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMenuModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow-xs"
                >
                  {editingMenuItem ? 'Simpan Perubahan' : 'Tambah ke Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PIN OWNER ================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Verifikasi PIN Owner</h3>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyOwnerPin} className="space-y-3">
              <p className="text-xs text-slate-500">
                Masukkan PIN Owner untuk mengakses laporan margin HPP dan laba:
              </p>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="PIN: 1234"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                className="w-full text-center text-xl tracking-widest p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />

              {pinError && (
                <p className="text-[11px] text-red-600 font-bold text-center">{pinError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-xs"
                >
                  Buka Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CETAK STRUK THERMAL ================= */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96dvh] animate-in zoom-in-95 duration-150">
            
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold">Struk Pembayaran Thermal</span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Thermal Receipt Area */}
            <div className="p-3 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
              <div
                id="thermal-print-area"
                className="w-[280px] bg-white p-4 text-[11px] font-mono-receipt shadow-xs border border-slate-200 text-slate-900 leading-tight space-y-2 select-text"
              >
                {/* Shop Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                  <div className="font-extrabold text-sm tracking-wider">RUJAK MBA UUS</div>
                  <div className="text-[10px]">Jl. Mangga Manis No. 18</div>
                  <div className="text-[10px]">WA: 0812-9876-5432</div>
                  <div className="text-[9px] text-slate-500 font-sans mt-0.5">Spesialis Rujak Uleg Gula Aren</div>
                </div>

                {/* Metadata */}
                <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-1.5 pt-1">
                  <div className="flex justify-between">
                    <span>No:</span>
                    <span className="font-bold">{activeReceipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{activeReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{activeReceipt.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Channel:</span>
                    <span className="font-bold uppercase">{activeReceipt.channel}</span>
                  </div>
                  {activeReceipt.customerName && (
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="truncate max-w-[150px] text-right">{activeReceipt.customerName}</span>
                    </div>
                  )}
                </div>

                {/* Items list */}
                <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2 pt-1">
                  {activeReceipt.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-bold text-[11px] truncate">{it.name}</div>
                      <div className="flex justify-between text-[10px] text-slate-600 gap-1">
                        <span className="truncate">
                          {it.quantity} x Rp {it.price.toLocaleString('id-ID')}
                          {it.spiciness !== '-' && ` (${it.spiciness})`}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          Rp {it.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {activeReceipt.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {activeReceipt.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Diskon:</span>
                      <span>-Rp {activeReceipt.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-200">
                    <span>TOTAL:</span>
                    <span>Rp {activeReceipt.finalGrossAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] pt-0.5">
                    <span>Metode:</span>
                    <span className="font-bold">{activeReceipt.paymentMethod}</span>
                  </div>
                  {activeReceipt.paymentMethod === 'Tunai' && (
                    <>
                      <div className="flex justify-between text-[10px]">
                        <span>Bayar:</span>
                        <span>Rp {activeReceipt.amountPaid.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Kembali:</span>
                        <span>Rp {activeReceipt.change.toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer & Barcode Simulation */}
                <div className="text-center pt-2 space-y-1.5">
                  <div className="flex justify-center py-1 opacity-85">
                    <svg className="w-40 h-8" viewBox="0 0 160 32">
                      <rect x="0" y="0" width="160" height="32" fill="#fff" />
                      <g fill="#000">
                        {[0, 4, 8, 14, 18, 22, 28, 34, 38, 44, 48, 56, 62, 68, 74, 80, 86, 92, 98, 106, 112, 118, 126, 132, 140, 146, 154].map((x, i) => (
                          <rect key={i} x={x} y="2" width={i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1} height="26" />
                        ))}
                      </g>
                    </svg>
                  </div>

                  <div className="text-[10px] font-sans font-semibold text-slate-700">
                    Matur Nuwun Atas Kunjungannya!
                  </div>
                  <div className="text-[9px] text-slate-500 font-sans">
                    Rujak Segar Bikin Melek & Nagih • Follow IG @rujakmbauus
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-2.5 bg-white border-t border-slate-100 space-y-1.5 shrink-0">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleBluetoothPrint}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span className="truncate">Cetak Bluetooth</span>
                </button>

                <button
                  onClick={() => {
                    audioPlayer.playPrintSound();
                    window.print();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span className="truncate">Print 58mm</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleShareWhatsApp(activeReceipt)}
                  className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Kirim ke WA</span>
                </button>

                <button
                  onClick={() => copyReceiptText(activeReceipt)}
                  className="py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Salin Struk</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
