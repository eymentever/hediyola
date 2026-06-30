'use client';

import { useState } from 'react';
import { QrCode, Download, Printer, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RegistryQrCodeProps {
  slug: string;
  title: string;
}

export function RegistryQrCode({ slug, title }: RegistryQrCodeProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Construct the absolute public URL of the registry
  const registryUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/list/${slug}`
    : `https://hediyolaproject.vercel.app/list/${slug}`;

  // API to generate high quality QR codes
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(registryUrl)}`;

  // Function to download the QR code image
  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(qrCodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hediyola-${slug}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR code download failed:', err);
    } finally {
      setLoading(false);
    }
  }

  // Function to print the table tent / card
  function handlePrint() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hediyola QR Kodu - ${title}</title>
          <style>
            body {
              font-family: 'Playfair Display', Georgia, serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #FAF9F6;
              color: #18181B;
              text-align: center;
            }
            .card {
              border: 1px solid rgba(24, 24, 27, 0.08);
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
              max-width: 400px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            p {
              font-family: 'Inter', sans-serif;
              font-size: 14px;
              color: #71717A;
              margin-bottom: 25px;
            }
            img {
              width: 250px;
              height: 250px;
              margin-bottom: 25px;
            }
            .footer {
              font-size: 12px;
              color: #C5A880;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            @media print {
              body { background: white; }
              .card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="footer">HEDİYOLA</div>
            <h1 style="margin-top: 15px;">Düğün Hediye Listemiz</h1>
            <p>${title}</p>
            <img src="${qrCodeImageUrl}" alt="QR Code" />
            <p style="font-size: 12px; margin-bottom: 0;">Telefonunuzun kamerasıyla okutarak listenize ulaşabilirsiniz.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline" 
        size="sm" 
        className="gap-2 border-gold-500/20 hover:bg-gold-500/10 text-gold-700"
      >
        <QrCode className="h-4 w-4 text-gold-500" /> Davetiye & Masa QR Kodu
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          
          {/* Custom Modal Panel */}
          <div className="animate-fade-in relative w-full max-w-md rounded-2xl bg-cream border border-ink/5 p-6 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-ink/5 pb-3">
              <div className="flex items-center gap-1.5 text-ink">
                <Sparkles className="h-4 w-4 text-gold-500" />
                <h3 className="font-serif text-lg font-bold">QR Kodunuz Hazır</h3>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-ink/5 hover:text-ink transition"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-xs text-ink-soft">
              Bu QR kodu davetiyelerinize ekleyebilir veya düğün günü masalara yerleştirebilirsiniz.
            </p>

            <div className="flex flex-col items-center py-6 bg-white rounded-xl border border-ink/5 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700/80 mb-2">HEDİYOLA</span>
              <h3 className="font-serif text-base font-bold text-ink mb-1">Düğün Hediye Listemiz</h3>
              <p className="text-xs text-ink-soft mb-6 px-4 text-center">{title}</p>
              
              <div className="relative p-4 border border-ink/5 rounded-xl bg-white shadow-soft">
                <img 
                  src={qrCodeImageUrl} 
                  alt="Hediye listesi QR Kodu" 
                  className="w-48 h-48"
                />
              </div>

              <p className="text-[10px] text-ink-soft mt-6 text-center max-w-xs leading-relaxed">
                Misafirleriniz telefonlarının kamerasıyla kodu okutarak listenize saniyeler içinde ulaşabilir.
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={handleDownload} 
                disabled={loading}
                className="bg-ink hover:bg-ink-soft text-white rounded-lg h-11 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 text-gold-500" />
                )}
                Görseli İndir
              </Button>

              <Button 
                onClick={handlePrint}
                variant="outline"
                className="border-ink/10 hover:bg-ink/5 text-ink rounded-lg h-11 font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4 text-ink-soft" />
                Yazdır (Masa Kartı)
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
