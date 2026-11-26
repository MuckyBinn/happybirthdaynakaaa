import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Lock,
  Sparkles,
  Award,
  Mail,
  Flame,
  Stars,
  RotateCcw,
  ShieldCheck,
  Download,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Camera
} from 'lucide-react';

// ==========================================
// 🎯 ตั้งค่าข้อมูลส่วนตัว วันเกิด และรูปโพลารอยด์ตรงนี้
// ==========================================
const CONFIG = {
  partnerName: 'บีบี้ของเค้า', // เปลี่ยนเป็นชื่อเล่นแฟน
  senderName: 'สุดที่รักเองงายย', // เปลี่ยนเป็นชื่อเล่นของคุณ
  // วันที่ 27 พฤศจิกายน 2569 (ค.ศ. 2026) เวลา 00:00:00 น. ตามเวลาไทย (+07:00)
  targetDate: new Date('2026-11-27T00:00:00+07:00').getTime(),
  polaroids: [
    {
      src: '/1.jpg',
      caption: 'น่ารักที่สุดไปเยยย 💕',
      rotateClass: '-rotate-2',
    },
    {
      src: '/2.jpg',
      caption: 'รูปคู่ที่ชอบที่สุดเยยยย ✨',
      rotateClass: 'rotate-2',
    },
    {
      src: '/3.jpg',
      caption: 'คิดถึงเสมอนะคะที่ร้ากก 🤍',
      rotateClass: '-rotate-1',
    },
    {
      src: '/4.jpg',
      caption: 'อยากไปเท่วกะที่ร้ากกอีกจุงง 🎂',
      rotateClass: 'rotate-2',
    },
  ],
  loveLetter: {
    title: 'สุขสันต์วันเกิดนะคนเก่งของเค้า 🎂💖',
    paragraphs: [
      'ขอบคุณที่เกิดมาให้เค้ารักและอยู่ข้างๆกันมาตลอดนะค้าา แม้เราอยู่ไกลกัน แต่ไม่เคยทำให้ความรักลดลงเลย',
      'ปีนี้ขอให้เป็นปีที่ใจดีกับที่รักมากๆ ยิ้มเยอะๆ มีความสุขกับทุกเรื่องที่ทำ สุขภาพแข็งแรง ไม่ปวดหลังไม่ปวดตัว',
      'ไม่ว่าจะเจอเรื่องอะไร งานที่ฝึกจะหนักแค่ไหน เค้าจะคอยเป็นกำลังใจและอยู่ตรงนี้ข้างๆเสมอ รักที่สุดในโลกเลยน้าาาาาา!'
    ],
    signOff: 'จาก... เค้าเองที่รักที่รักมากๆ 💕'
  },
  certificate: {
    headerEn: 'OFFICIAL CERTIFICATE OF LOVE',
    title: 'ใบประกาศนียบัตรแฟนดีเด่น',
    subtitle: 'ประจำวันปี พุทธศักราช 2569',
    lines: [
      'ขอมอบเกียรติบัตรฉบับนี้เพื่อรับรองว่า เป็นแฟนที่น่ารักที่สุดในโลก',
      'ขยันที่สุด และเป็นแฟนที่เค้ารักที่สุด แม้ระยะทางจะห่างไกลกันก็ตาม'
    ],
    dateText: 'ให้ไว้ ณ วันที่ 27 พฤศจิกายน พ.ศ. 2569'
  }
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface PolaroidCardProps {
  src: string;
  caption: string;
  onClick: () => void;
  className?: string;
}

function PolaroidCard({ src, caption, onClick, className = '' }: PolaroidCardProps) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title="แตะเพื่อดูรูปใหญ่"
      className={`group bg-white p-2 pb-3.5 rounded-xl shadow-[0_8px_20px_rgba(15,23,42,0.1)] border border-rose-100 cursor-pointer select-none hover:scale-[1.03] active:scale-95 transition-all duration-300 text-left w-full ${className}`}
    >
      <div className="w-full aspect-square overflow-hidden rounded-lg bg-rose-50">
        <img
          src={src}
          alt={caption}
          onError={() => setHidden(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="mt-2 text-center text-xs font-semibold text-slate-700 truncate px-1">
        {caption}
      </div>
    </button>
  );
}

const pageBgStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '100dvh',
  background: 'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 48%, #fef3c7 100%)',
  position: 'relative',
  overflowX: 'hidden',
  paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
  paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
};

export default function App() {
  const [now, setNow] = useState<number>(Date.now());
  const [devBypass] = useState<boolean>(false);

  const [candleLit, setCandleLit] = useState<boolean>(true);
  const [letterOpen, setLetterOpen] = useState<boolean>(false);
  const [certIssued, setCertIssued] = useState<boolean>(false);

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isUnlocked = now >= CONFIG.targetDate || devBypass;

  const step1Done = !candleLit;
  const step2Done = letterOpen;
  const canUnlockStep3 = step1Done && step2Done;
  const step3Done = certIssued;

  const completedCount = [step1Done, step2Done, step3Done].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  const calculateTimeLeft = (): TimeLeft => {
    const difference = Math.max(0, CONFIG.targetDate - now);
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const timeLeft = calculateTimeLeft();

  const triggerConfetti = () => {
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#ff4d6d', '#ff8fa3', '#ffb3c1', '#ffd166', '#c77dff']
    });
  };

  const drawCertificateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 850;
    canvas.width = W;
    canvas.height = H;

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#fffdf9');
    bgGrad.addColorStop(0.5, '#fff9f5');
    bgGrad.addColorStop(1, '#fff1f5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2 + 20);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.04)';
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.bezierCurveTo(-180, -70, -260, 110, 0, 230);
    ctx.bezierCurveTo(260, 110, 180, -70, 0, 60);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(240, 0);
    ctx.lineTo(0, 240);
    ctx.closePath();
    const cornerGrad1 = ctx.createLinearGradient(0, 0, 200, 200);
    cornerGrad1.addColorStop(0, '#f43f5e');
    cornerGrad1.addColorStop(1, '#fb7185');
    ctx.fillStyle = cornerGrad1;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(210, 0);
    ctx.lineTo(235, 0);
    ctx.lineTo(0, 235);
    ctx.lineTo(0, 210);
    ctx.closePath();
    ctx.fillStyle = '#d97706';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W - 240, H);
    ctx.lineTo(W, H - 240);
    ctx.closePath();
    ctx.fillStyle = cornerGrad1;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W - 210, H);
    ctx.lineTo(W - 235, H);
    ctx.lineTo(W, H - 235);
    ctx.lineTo(W, H - 210);
    ctx.closePath();
    ctx.fillStyle = '#d97706';
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(42, 42, W - 84, H - 84);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(58, 58, W - 116, H - 116);

    const corners = [
      [58, 58, 1, 1],
      [W - 58, 58, -1, 1],
      [58, H - 58, 1, -1],
      [W - 58, H - 58, -1, -1],
    ];
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(dx, dy);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, 28, 28);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(4, 4, 20, 20);
      ctx.restore();
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 20px "Prompt", sans-serif';
    ctx.fillText(`★   ${CONFIG.certificate.headerEn}   ★`, W / 2, 138);

    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 54px "Prompt", sans-serif';
    ctx.fillText(CONFIG.certificate.title, W / 2, 215);

    ctx.fillStyle = '#b45309';
    ctx.font = '600 26px "Prompt", sans-serif';
    ctx.fillText(CONFIG.certificate.subtitle, W / 2, 265);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 260, 295);
    ctx.lineTo(W / 2 - 20, 295);
    ctx.moveTo(W / 2 + 20, 295);
    ctx.lineTo(W / 2 + 260, 295);
    ctx.stroke();

    ctx.fillStyle = '#e11d48';
    ctx.font = '22px "Prompt", sans-serif';
    ctx.fillText('♥', W / 2, 303);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 62px "Prompt", sans-serif';
    ctx.fillText(`คุณ ${CONFIG.partnerName}`, W / 2, 395);

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(W / 2 - 280, 422);
    ctx.lineTo(W / 2 + 280, 422);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#475569';
    ctx.font = '400 25px "Prompt", sans-serif';
    CONFIG.certificate.lines.forEach((line, idx) => {
      ctx.fillText(line, W / 2, 485 + idx * 42);
    });

    ctx.fillStyle = '#e11d48';
    ctx.font = '600 22px "Prompt", sans-serif';
    ctx.fillText(CONFIG.certificate.dateText, W / 2, 605);

    const sealX = 330;
    const sealY = 705;
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(sealX - 24, sealY + 25);
    ctx.lineTo(sealX - 38, sealY + 95);
    ctx.lineTo(sealX - 15, sealY + 80);
    ctx.lineTo(sealX - 2, sealY + 95);
    ctx.lineTo(sealX - 4, sealY + 25);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(sealX + 4, sealY + 25);
    ctx.lineTo(sealX + 2, sealY + 95);
    ctx.lineTo(sealX + 15, sealY + 80);
    ctx.lineTo(sealX + 38, sealY + 95);
    ctx.lineTo(sealX + 24, sealY + 25);
    ctx.fill();

    ctx.beginPath();
    const spikes = 24;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? 52 : 46;
      const angle = (i * Math.PI) / spikes;
      const x = sealX + Math.cos(angle) * r;
      const y = sealY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const sealGrad = ctx.createRadialGradient(sealX - 15, sealY - 15, 5, sealX, sealY, 55);
    sealGrad.addColorStop(0, '#fde68a');
    sealGrad.addColorStop(0.6, '#f59e0b');
    sealGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = sealGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fffbeb';
    ctx.font = 'bold 13px "Prompt", sans-serif';
    ctx.fillText('BEST PARTNER', sealX, sealY - 5);
    ctx.font = 'bold 16px "Prompt", sans-serif';
    ctx.fillText('100% ♥', sealX, sealY + 16);
    ctx.restore();

    const signX = 830;
    const signY = 710;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'italic bold 30px "Prompt", sans-serif';
    ctx.fillText(CONFIG.senderName, signX, signY - 12);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(signX - 150, signY + 5);
    ctx.lineTo(signX + 150, signY + 5);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '400 18px "Prompt", sans-serif';
    ctx.fillText(`(${CONFIG.senderName})`, signX, signY + 34);
    ctx.fillStyle = '#e11d48';
    ctx.font = '600 17px "Prompt", sans-serif';
    ctx.fillText('ผู้มอบรางวัลอย่างเป็นทางการ', signX, signY + 62);
  }, []);

  useEffect(() => {
    if (showCertModal) {
      drawCertificateCanvas();
      document.fonts?.ready.then(() => {
        drawCertificateCanvas();
      });
    }
  }, [showCertModal, drawCertificateCanvas]);

  const handleBlowCandle = () => {
    if (!candleLit) return;
    setCandleLit(false);
    triggerConfetti();
  };

  const handleOpenLetter = () => {
    setLetterOpen(true);
    triggerConfetti();
  };

  const handleIssueCertificate = () => {
    if (!canUnlockStep3) return;
    setCertIssued(true);
    setShowCertModal(true);
    triggerConfetti();
  };

  const handleDownloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = image;
    link.download = `Certificate-${CONFIG.partnerName}-2569.png`;
    link.click();
  };

  const activePhoto = activePhotoIndex !== null ? CONFIG.polaroids[activePhotoIndex] : null;

  // ==========================================
  // 🔒 หน้าจอที่ 1: Countdown (ยังไม่ถึงวันเกิด)
  // ==========================================
  if (!isUnlocked) {
    return (
      <div style={pageBgStyle} className="px-4 sm:px-6 flex flex-col items-center justify-center">
        <Stars className="fixed top-12 right-8 text-amber-400/40 w-8 h-8 animate-spin pointer-events-none" style={{ animationDuration: '14s' }} />

        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-center relative z-10">
          <div className="xl:col-span-7 w-full max-w-md mx-auto bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(244,63,94,0.16)] border border-white text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-3xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
              <Lock className="w-8 h-8 sm:w-9 sm:h-9 -rotate-3 animate-bounce" />
            </div>

            <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3.5 py-1 rounded-full mb-2.5">
              Special Surprise ✨
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              ความลับของ <span className="text-rose-500">{CONFIG.partnerName}</span> 🤫
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              ยังไม่ถึงเวลาเปิดนะคนเก่ง! อดใจรอตอนเที่ยงคืนอีกนิดนึงน้าาา<br />
              เที่ยงคืนวันที่ <span className="font-semibold text-rose-500">27 พ.ย. 69</span> เจอกัน 💕
            </p>

            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 mb-6">
              {[
                { label: 'วัน', value: timeLeft.days },
                { label: 'ชั่วโมง', value: timeLeft.hours },
                { label: 'นาที', value: timeLeft.minutes },
                { label: 'วินาที', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-gradient-to-b from-rose-500 to-pink-500 text-white rounded-2xl p-2.5 sm:p-3 shadow-md shadow-rose-200">
                  <div className="text-xl sm:text-2xl font-bold tabular-nums">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] text-rose-100 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>ตั้งใจทำให้เธอคนเดียวเลยนะ</span>
            </div>
          </div>

          {/* โพลารอยด์ฝั่งขวาบนจอใหญ่ / ด้านล่างบนมือถือ-iPad */}
          <div className="xl:col-span-5 bg-white/75 backdrop-blur-xl rounded-[2rem] p-4 sm:p-5 shadow-[0_12px_30px_rgba(244,63,94,0.08)] border border-white">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>รูปโพลารอยด์ของ {CONFIG.partnerName}</span>
              </span>
              <span className="text-[11px] text-slate-400">แตะเพื่อดูรูปใหญ่</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {CONFIG.polaroids.map((photo, idx) => (
                <PolaroidCard
                  key={idx}
                  src={photo.src}
                  caption={photo.caption}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={photo.rotateClass}
                />
              ))}
            </div>
          </div>
        </div>

       
        {/* Popup ดูรูปโพลารอยด์ใหญ่ */}
        {activePhoto && activePhotoIndex !== null && (
          <div
            onClick={() => setActivePhotoIndex(null)}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-4 pb-6 rounded-2xl max-w-sm w-full shadow-2xl relative space-y-4 text-center"
            >
              <button
                type="button"
                onClick={() => setActivePhotoIndex(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="ปิดรูป"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-full aspect-square overflow-hidden rounded-xl bg-rose-50">
                <img src={activePhoto.src} alt={activePhoto.caption} className="w-full h-full object-cover" />
              </div>
              <p className="text-base font-bold text-slate-800">{activePhoto.caption}</p>
              <div className="flex items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + CONFIG.polaroids.length) % CONFIG.polaroids.length : 0))}
                  className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ก่อนหน้า</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % CONFIG.polaroids.length : 0))}
                  className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 🎉 หน้าจอที่ 2: Interactive Birthday Surprise
  // ==========================================
  return (
    <div style={pageBgStyle} className="px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start relative z-10">
        {/* ฝั่งซ้าย (8 คอลัมน์บนจอใหญ่): Header + 3 การ์ดหลัก + Heart Progress Bar ด้านล่าง */}
        <div className="xl:col-span-8 space-y-6">
          {/* Header Banner */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 sm:p-7 shadow-[0_12px_35px_rgba(244,63,94,0.1)] border border-white text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-rose-100/90 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-rose-600 text-xs font-bold tracking-wide">27 พฤศจิกายน 2569</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 pt-1">
              Happy Birthday, {CONFIG.partnerName}! 🎂
            </h1>
            <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              ทำภารกิจ STEP 1 และ STEP 2 ให้ครบ เพื่อปลดล็อกรางวัลพิเศษใน STEP 3 นะ ✨
            </p>
          </div>

          {/* 3 การ์ดหลัก */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {/* การ์ดที่ 1: เค้กวันเกิด & เป่าเทียน */}
            <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-5 shadow-[0_12px_30px_rgba(244,63,94,0.09)] border border-white text-center flex flex-col justify-between">
              <div>
                <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full mb-2 ${step1Done ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                  {step1Done ? 'STEP 1 • สำเร็จแล้ว ✓' : 'STEP 1 • WISH'}
                </span>
                <h2 className="text-base font-bold text-slate-800 mb-1">
                  อธิษฐานแล้วกดเป่าเทียน 🕯️
                </h2>
                <p className="text-xs text-slate-500 mb-3">
                  {candleLit ? 'หลับตาขอพร แล้วแตะที่เค้กเพื่อเป่าเทียน' : 'ขอให้คำอธิษฐานเป็นจริงทุกข้อเลยนะคะ 🎉'}
                </p>
              </div>

              <div
                onClick={handleBlowCandle}
                className={`relative mx-auto my-3 w-44 h-48 flex flex-col items-center justify-end cursor-pointer select-none transition-transform duration-300 ${candleLit ? 'hover:scale-105 active:scale-95' : ''}`}
              >
                {candleLit ? (
                  <div className="mb-1 flex flex-col items-center animate-bounce">
                    <div className="w-8 h-8 bg-amber-300/40 rounded-full blur-md absolute -top-1" />
                    <Flame className="w-9 h-9 text-amber-500 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                  </div>
                ) : (
                  <div className="mb-2 text-xs font-medium text-slate-400 animate-pulse">ฟู่~ 💨</div>
                )}

                <div className="w-3.5 h-11 bg-gradient-to-b from-amber-200 via-pink-300 to-rose-400 rounded-t-md shadow-sm" />

                <div className="w-28 h-12 bg-pink-200 rounded-t-2xl relative flex items-center justify-center border-b-2 border-pink-300">
                  <div className="absolute top-0 w-full h-3.5 bg-white rounded-t-2xl" />
                  <div className="flex gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                  </div>
                </div>

                <div className="w-40 h-16 bg-rose-300 rounded-t-2xl relative flex items-center justify-center shadow-inner">
                  <div className="absolute top-0 w-full h-4 bg-rose-50 rounded-t-2xl" />
                  <Heart className="w-6 h-6 text-white fill-white mt-2 drop-shadow-sm" />
                </div>

                <div className="w-44 h-3.5 bg-gradient-to-r from-amber-100 via-white to-amber-100 rounded-full shadow-md border border-amber-200/50" />
              </div>

              <div className="pt-2 min-h-[28px]">
                {!candleLit && (
                  <button
                    type="button"
                    onClick={() => setCandleLit(true)}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium underline py-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>จุดเทียนใหม่อีกครั้ง</span>
                  </button>
                )}
              </div>
            </div>

            {/* การ์ดที่ 2: จดหมายรัก */}
            <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-5 shadow-[0_12px_30px_rgba(244,63,94,0.09)] border border-white flex flex-col justify-between">
              <div className="text-center mb-3">
                <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full mb-2 ${step2Done ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                  {step2Done ? 'STEP 2 • สำเร็จแล้ว ✓' : 'STEP 2 • LETTER'}
                </span>
                <h2 className="text-base font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-rose-500" />
                  <span>จดหมายถึงที่รัก</span>
                </h2>
              </div>

              {!letterOpen ? (
                <button
                  type="button"
                  onClick={handleOpenLetter}
                  className="w-full flex-1 min-h-[210px] py-8 bg-gradient-to-br from-rose-50 to-pink-100/80 hover:from-rose-100 hover:to-pink-100 border-2 border-dashed border-rose-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-rose-600 active:scale-[0.98] transition-all group shadow-inner"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                  </div>
                  <span className="font-semibold text-sm">แตะเพื่อแกะซองจดหมาย 💌</span>
                </button>
              ) : (
                <div className="bg-gradient-to-b from-rose-50/90 to-white p-4 rounded-2xl border border-rose-200/80 space-y-2.5 text-slate-700 text-xs sm:text-sm leading-relaxed shadow-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-rose-600 text-sm sm:text-base border-b border-rose-100 pb-2">
                      {CONFIG.loveLetter.title}
                    </h3>
                    {CONFIG.loveLetter.paragraphs.map((text, index) => (
                      <p key={index} className="indent-3">{text}</p>
                    ))}
                  </div>
                  <p className="text-right font-bold text-rose-500 pt-2">
                    {CONFIG.loveLetter.signOff}
                  </p>
                </div>
              )}
            </div>

            {/* การ์ดที่ 3: เกียรติบัตรแฟนดีเด่น */}
            <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-5 shadow-[0_12px_30px_rgba(244,63,94,0.09)] border border-white text-center flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full mb-2 ${
                  step3Done
                    ? 'bg-emerald-100 text-emerald-700'
                    : canUnlockStep3
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {step3Done ? 'STEP 3 • สำเร็จแล้ว ✓' : canUnlockStep3 ? 'STEP 3 • ปลดล็อกแล้ว!' : 'STEP 3 • LOCKED 🔒'}
                </span>
                <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>เกียรติบัตรแฟนดีเด่น</span>
                </h2>
                <p className="text-xs text-slate-500 mb-3">
                  {certIssued
                    ? 'แตะเพื่อเปิดเกียรติบัตรฉบับเต็มและดาวน์โหลดได้เลย 💖'
                    : canUnlockStep3
                      ? 'ภารกิจครบแล้ว! กดรับเกียรติบัตรประจำปีได้เลย'
                      : 'ต้องเป่าเทียน (Step 1) และอ่านจดหมาย (Step 2) ก่อนนะ'}
                </p>
              </div>

              <div className="my-auto flex-1 flex flex-col justify-center">
                {!canUnlockStep3 ? (
                  <div className="py-8 px-3 bg-slate-50/90 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      ปลดล็อกเมื่อทำภารกิจครบ ({completedCount}/2)
                    </p>
                  </div>
                ) : !certIssued ? (
                  <button
                    type="button"
                    onClick={handleIssueCertificate}
                    className="w-full py-8 px-3 bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 hover:opacity-95 border-2 border-amber-300 rounded-2xl flex flex-col items-center justify-center gap-2.5 shadow-md transition-all active:scale-95 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-rose-400 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Award className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-rose-600">
                      แตะเพื่อรับเกียรติบัตรแฟนดีเด่น 🏆
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCertModal(true)}
                    className="w-full cursor-pointer group p-3.5 bg-[#fffdf9] border-4 border-amber-500 hover:border-amber-600 shadow-md hover:shadow-lg transition-all relative overflow-hidden text-center"
                  >
                    <div className="border border-amber-400 p-3 space-y-1.5">
                      <div className="flex items-center justify-center gap-1 text-amber-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-extrabold tracking-widest uppercase">
                          OFFICIAL CERTIFICATE
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-rose-600">
                        {CONFIG.certificate.title}
                      </h3>
                      <div className="py-0.5 border-b border-dashed border-rose-300">
                        <span className="text-base sm:text-lg font-extrabold text-slate-800">
                          คุณ {CONFIG.partnerName}
                        </span>
                      </div>
                      <div className="pt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 group-hover:text-rose-600 transition-colors">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>เปิดเกียรติบัตร & โหลดไฟล์</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={triggerConfetti}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200/80 active:scale-95 transition-all"
                >
                  🎉 กดจุดพลุฉลอง!
                </button>
              </div>
            </div>
          </div>

          {/* ❤️ Heart Progress Bar คงไว้ด้านล่างเหมือนเดิม */}
          <div className="bg-white/85 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-[0_12px_35px_rgba(244,63,94,0.1)] border border-white">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
                <span>ความคืบหน้าภารกิจวันเกิดของ {CONFIG.partnerName}</span>
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-rose-500">
                {completedCount} / 3 ({progressPercent}%)
              </span>
            </div>

            <div className="relative pt-1 pb-1">
              <div className="w-full h-4 bg-rose-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                {[
                  { label: '1. เป่าเทียนขอพร', done: step1Done },
                  { label: '2. อ่านจดหมายรัก', done: step2Done },
                  { label: '3. รับเกียรติบัตร', done: step3Done },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all duration-500 ${
                      item.done
                        ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                        : 'bg-slate-50/70 border-slate-100 text-slate-400'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 shrink-0 transition-transform duration-500 ${
                        item.done
                          ? 'text-rose-500 fill-rose-500 scale-110'
                          : 'text-slate-300 fill-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {completedCount === 3 && (
              <p className="text-center text-xs sm:text-sm font-bold text-rose-500 mt-4 animate-bounce">
                🎊 ภารกิจสำเร็จครบ 100% แล้ว! สุขสันต์วันเกิดนะคนเก่งของเค้า 💖
              </p>
            )}
          </div>
        </div>

        {/* ฝั่งขวา (4 คอลัมน์บนจอใหญ่ / ด้านล่างบนมือถือ-iPad): โซนรูปโพลารอยด์ */}
        <div className="xl:col-span-4 bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-[0_12px_30px_rgba(244,63,94,0.09)] border border-white">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-rose-500" />
              <span>อัลบั้มโพลารอยด์ของ {CONFIG.partnerName}</span>
            </span>
            <span className="text-[11px] text-slate-400">แตะดูรูปใหญ่</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            {CONFIG.polaroids.map((photo, idx) => (
              <PolaroidCard
                key={idx}
                src={photo.src}
                caption={photo.caption}
                onClick={() => setActivePhotoIndex(idx)}
                className={photo.rotateClass}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          🖼️ POPUP MODAL: ดูรูปโพลารอยด์ขนาดใหญ่
      ========================================== */}
      {activePhoto && activePhotoIndex !== null && (
        <div
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-4 pb-6 rounded-2xl max-w-sm w-full shadow-2xl relative space-y-4 text-center"
          >
            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="ปิดรูป"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-full aspect-square overflow-hidden rounded-xl bg-rose-50">
              <img src={activePhoto.src} alt={activePhoto.caption} className="w-full h-full object-cover" />
            </div>
            <p className="text-base font-bold text-slate-800">{activePhoto.caption}</p>
            <div className="flex items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + CONFIG.polaroids.length) % CONFIG.polaroids.length : 0))}
                className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ก่อนหน้า</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % CONFIG.polaroids.length : 0))}
                className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>ถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          🏆 POPUP MODAL: HTML5 CANVAS เกียรติบัตรแนวนอน A4
      ========================================== */}
      {showCertModal && (
        <div
          onClick={() => setShowCertModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl border border-rose-100 relative space-y-4 my-auto"
          >
            <button
              type="button"
              onClick={() => setShowCertModal(false)}
              className="absolute top-3.5 right-3.5 w-9 h-9 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pr-8 sm:pr-0">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3.5 py-1 rounded-full">
                🏆 เกียรติบัตรอย่างเป็นทางการสำหรับ {CONFIG.partnerName}
              </span>
            </div>

            <div className="w-full overflow-hidden shadow-xl border border-amber-200 bg-[#fffdf9]">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadCertificate}
                className="flex-1 py-3.5 px-5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดเกียรติบัตร (.PNG ความละเอียดสูง)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-2xl transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}