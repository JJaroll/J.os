/**
 * Icon Mapper Utility
 *
 * Maps a Strapi `iconName` string (e.g. "Folder", "Terminal") to the
 * corresponding lucide-react component. Falls back to <HelpCircle> for
 * unknown names.
 *
 * Usage:
 *   import { getIcon } from '@/utils/iconMapper';
 *   const icon = getIcon('Folder', { size: 32, className: 'text-blue-500' });
 */

import React from 'react';
import {
  HelpCircle,
  Folder,
  FolderOpen,
  FolderPlus,
  File,
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  Settings,
  Settings2,
  Image,
  ImageIcon,
  Terminal,
  Code,
  Code2,
  Archive,
  Trash,
  Trash2,
  Mail,
  MailOpen,
  Music,
  Music2,
  Video,
  Play,
  Pause,
  Globe,
  Globe2,
  Link,
  ExternalLink,
  Gamepad,
  Gamepad2,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  Cpu,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Download,
  Upload,
  Search,
  Star,
  StarOff,
  Heart,
  HeartOff,
  Bookmark,
  BookmarkMinus,
  Tag,
  Tags,
  Calendar,
  Clock,
  AlarmClock,
  Timer,
  Bell,
  BellOff,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  BatteryCharging,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  User,
  Users,
  UserPlus,
  LogIn,
  LogOut,
  Home,
  Map,
  Navigation,
  Compass,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Headphones,
  Printer,
  Clipboard,
  Copy,
  Scissors,
  PenTool,
  Pen,
  Pencil,
  Edit,
  Edit2,
  Edit3,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  RefreshCw,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Square,
  Circle,
  Triangle,
  Layers,
  Layout,
  LayoutGrid,
  List,
  Grid,
  Table,
  Columns,
  Rows,
  Sidebar,
  PanelLeft,
  PanelRight,
  Activity,
  BarChart,
  BarChart2,
  PieChart,
  TrendingUp,
  TrendingDown,
  LineChart,
  Zap,
  FlaskConical,
  Microscope,
  Atom,
  Brain,
  Bot,
  MessageSquare,
  MessageCircle,
  Send,
  Share,
  Share2,
  Package,
  Box,
  Gift,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  DollarSign,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Loader2,
  Github,
  AppWindowMac,
  SquareCheckBig,
  AppWindow,
  Bird,
  Bug,
  Cat,
  Egg,
  Fish,
  Origami,
  Rabbit,
  Rat,
  Shell,
  Shrimp,
  Snail,
  Squirrel,
  Turtle,
  Worm,
  Birdhouse,
  type LucideProps,
} from 'lucide-react';

// Map from string name → Lucide component
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // Files & Folders
  Folder, FolderOpen, FolderPlus,
  File, FileText, FileCode, FileImage, FileArchive,

  //Animals
  Bird, Bug, Cat, Egg, Fish, Origami, Rabbit, Rat, Shell, Shrimp, Snail, Squirrel, Turtle, Worm, Birdhouse,

  // System
  Settings, Settings2, Terminal, Monitor, Laptop, Smartphone, Tablet,
  Cpu, Database, Server, Cloud, CloudUpload, CloudDownload, AppWindow,

  // Media
  Music, Music2, Video, Play, Pause, Image, ImageIcon,
  Camera, CameraOff, Mic, MicOff, Headphones,
  Volume, Volume1, Volume2, VolumeX,

  // Network & Connectivity
  Globe, Globe2, Link, ExternalLink, Wifi, WifiOff, Github,

  // Actions
  Download, Upload, Search, Copy, Scissors, RefreshCw, RefreshCcw,
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize, Minimize,
  Plus, Minus, X, Check, Edit, Edit2, Edit3,

  // Navigation
  Home, Map, Navigation, Compass,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, SquareCheckBig,

  // Communication
  Mail, MailOpen, MessageSquare, MessageCircle, Send, Share, Share2, Bell, BellOff,

  // Security
  Lock, Unlock, Key, Shield, ShieldCheck,

  // Users
  User, Users, UserPlus, LogIn, LogOut,

  // Layout / UI
  Layout, LayoutGrid, Layers, List, Grid, Table, Columns, Rows, Sidebar,
  PanelLeft, PanelRight, Square, Circle, Triangle, AppWindowMac,

  // Data & Analytics
  Activity, BarChart, BarChart2, PieChart, TrendingUp, TrendingDown, LineChart,

  // Apps & Games
  Gamepad, Gamepad2, Archive, Trash, Trash2, Bookmark, BookmarkMinus,

  // Misc & Creativity
  Star, StarOff, Heart, HeartOff, Tag, Tags,
  Calendar, Clock, AlarmClock, Timer,
  Battery, BatteryLow, BatteryCharging,
  Printer, Clipboard, PenTool, Pen, Pencil,
  Code, Code2, Zap, FlaskConical, Microscope, Atom, Brain, Bot,

  // E-commerce
  Package, Box, Gift, ShoppingCart, ShoppingBag, CreditCard, DollarSign,

  // Status
  Info, AlertCircle, AlertTriangle, CheckCircle, XCircle, HelpCircle,
  Loader, Loader2,
};

/**
 * Returns a Lucide React element for the given icon name string.
 *
 * @param name - The PascalCase name of the Lucide icon (e.g. "Folder", "Terminal")
 * @param props - Optional LucideProps (size, className, strokeWidth, etc.)
 * @returns A React element or <HelpCircle /> as fallback
 */
export function getIcon(name: string, props?: LucideProps): React.ReactNode {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    console.warn(`[iconMapper] Unknown icon name: "${name}". Falling back to HelpCircle.`);
    return <HelpCircle {...props} />;
  }
  return <IconComponent {...props} />;
}

/**
 * Returns the Lucide component class for the given icon name.
 * Useful when you need the component reference (not a rendered element).
 */
export function getIconComponent(name: string): React.ComponentType<LucideProps> {
  return ICON_MAP[name] ?? HelpCircle;
}
