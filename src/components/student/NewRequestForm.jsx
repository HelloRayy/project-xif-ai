import React, { useRef } from 'react';
import { 
  ArrowRight, 
  Calendar as CalendarIcon, 
  ChevronsUpDown, 
  Check, 
  Timer, 
  Upload, 
  ImageIcon, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { Calendar } from '../ui/calendar';
import { PERMIT_SERVICES, JP_SCHEDULE, isPeriodPassed } from './studentConstants';
import { formatIndoDate, formatDateToIso } from '../../lib/dateUtils';

export default function NewRequestForm({
  isLocked,
  setActiveTab,
  formSuccessMsg,
  openServiceCombobox,
  setOpenServiceCombobox,
  selectedServiceId,
  setSelectedServiceId,
  selectedDate,
  setSelectedDate,
  dateRange,
  setDateRange,
  openDatePopover,
  setOpenDatePopover,
  isMultiDay,
  setIsMultiDay,
  startPeriod,
  setStartPeriod,
  endPeriod,
  setEndPeriod,
  selectingStart,
  setSelectingStart,
  hoveredPeriod,
  setHoveredPeriod,
  purpose,
  setPurpose,
  attachments,
  setAttachments,
  isDraggingFile,
  setIsDraggingFile,
  onSubmit
}) {
  const fileInputRef = useRef(null);

  const allServices = PERMIT_SERVICES.flatMap(cat => cat.items);
  const activeService = allServices.find(s => s.id === selectedServiceId) || null;
  const ActiveServiceIcon = activeService ? activeService.icon : null;
  const isDispensation = activeService ? activeService.type === 'DISPENSASI' : false;

  const handleSetToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setDateRange({ from: now, to: now });
  };

  const handleSetTomorrow = () => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setSelectedDate(tmr);
    setDateRange({ from: tmr, to: tmr });
  };

  const handleJpNumberClick = (periodNum) => {
    const jp = JP_SCHEDULE.find(j => j.period === periodNum);
    if (isPeriodPassed(selectedDate, jp)) return;

    if (selectingStart === null) {
      setSelectingStart(periodNum);
    } else {
      const first = Math.min(selectingStart, periodNum);
      const last = Math.max(selectingStart, periodNum);
      setStartPeriod(first);
      setEndPeriod(last);
      setSelectingStart(null);
    }
  };

  const handleSetAllActiveJP = () => {
    const availableSlots = JP_SCHEDULE.filter(jp => !isPeriodPassed(selectedDate, jp));
    if (availableSlots.length === 0) return;
    setStartPeriod(availableSlots[0].period);
    setEndPeriod(availableSlots[availableSlots.length - 1].period);
    setSelectingStart(null);
  };

  let effectiveStart = startPeriod;
  let effectiveEnd = endPeriod;
  if (selectingStart !== null) {
    if (hoveredPeriod !== null) {
      effectiveStart = Math.min(selectingStart, hoveredPeriod);
      effectiveEnd = Math.max(selectingStart, hoveredPeriod);
    } else {
      effectiveStart = selectingStart;
      effectiveEnd = selectingStart;
    }
  }

  const activeStartJp = effectiveStart !== null ? (JP_SCHEDULE.find(j => j.period === effectiveStart) || null) : null;
  const activeEndJp = effectiveEnd !== null ? (JP_SCHEDULE.find(j => j.period === effectiveEnd) || null) : null;

  const processFiles = (fileList) => {
    const files = Array.from(fileList);
    files.forEach(f => {
      const isImg = f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png)$/i);
      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => [
            ...prev,
            {
              name: f.name,
              size: `${(f.size / 1024).toFixed(0)} KB`,
              type: f.type || 'image/jpeg',
              previewUrl: e.target.result,
              uploadedAt: new Date().toLocaleDateString('id-ID')
            }
          ]);
        };
        reader.readAsDataURL(f);
      } else {
        setAttachments(prev => [
          ...prev,
          {
            name: f.name,
            size: `${(f.size / 1024).toFixed(0)} KB`,
            type: f.type || 'application/pdf',
            previewUrl: null,
            uploadedAt: new Date().toLocaleDateString('id-ID')
          }
        ]);
      }
    });
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="border-b border-border pb-3.5">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Formulir Pengajuan Izin & Dispensasi
        </h1>
        <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
          Lengkapi jenis izin, tanggal, jam pelajaran, dan alasan permohonan dengan jelas.
        </p>
      </div>

      {isLocked ? (
        <div className="p-8 sm:p-12 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-card text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Layanan Pengajuan Ditutup Sementara
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pengajuan surat izin mandiri siswa dinonaktifkan pada jam sekolah aktif (07.30 - 15.30 WIB) atau saat dikunci oleh Guru BK. Layanan akan dibuka kembali di luar jam KBM sekolah.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={() => setActiveTab('OVERVIEW')} 
              variant="outline"
              className="rounded-xl text-xs gap-2"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Kembali ke Ringkasan Dashboard</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {formSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-sm font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{formSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* 1. Jenis Izin Combobox */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                Jenis Izin / Pengajuan <span className="text-rose-600 font-normal">*</span>
              </Label>

              <Popover open={openServiceCombobox} onOpenChange={setOpenServiceCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openServiceCombobox}
                    className={cn(
                      "w-full justify-between h-11 px-3.5 text-sm font-normal bg-background border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl transition-colors",
                      !activeService && "text-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {ActiveServiceIcon ? (
                        <ActiveServiceIcon className="w-4 h-4 shrink-0 text-blue-600" />
                      ) : (
                        <span className="text-slate-400 font-sans text-base">-</span>
                      )}
                      <span className={cn(
                        "truncate text-sm",
                        activeService ? "text-slate-800 dark:text-zinc-100 font-medium" : "text-slate-500 dark:text-zinc-400 font-normal"
                      )}>
                        {activeService ? activeService.label : "- Pilih Jenis Izin / Pengajuan -"}
                      </span>
                    </div>
                    <ChevronsUpDown className="opacity-60 ml-2 h-4 w-4 shrink-0 text-slate-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-1.5 border-border shadow-lg" align="start">
                  <Command>
                    <CommandList className="max-h-64">
                      {PERMIT_SERVICES.map((group, gIdx) => (
                        <React.Fragment key={group.category}>
                          {gIdx > 0 && <CommandSeparator className="my-1.5" />}
                          <CommandGroup heading={group.categoryLabel}>
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isSelected = selectedServiceId === item.id;
                              return (
                                <CommandItem
                                  key={item.id}
                                  value={item.label}
                                  onSelect={() => {
                                    setSelectedServiceId(item.id);
                                    setOpenServiceCombobox(false);
                                  }}
                                  className={cn(
                                    "text-sm cursor-pointer py-2.5 px-3 flex items-center justify-between rounded-lg font-normal",
                                    isSelected ? "bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 font-medium" : "hover:bg-muted text-slate-700 dark:text-zinc-200"
                                  )}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <ItemIcon className={cn(
                                      "w-4 h-4 shrink-0",
                                      isSelected ? "text-blue-600" : "text-slate-500"
                                    )} />
                                    <span>{item.label}</span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4 text-blue-600 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </React.Fragment>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {activeService ? (
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 pt-0.5">
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Persyaratan:</span> {activeService.helper}
                </p>
              ) : (
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 pt-0.5">
                  Pilih jenis izin di atas untuk melihat persyaratan dokumen pendukung.
                </p>
              )}
            </div>

            {/* 2. Tanggal Izin */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                  {isMultiDay ? 'Rentang Tanggal Izin' : 'Tanggal Izin / Kegiatan'} <span className="text-rose-600 font-normal">*</span>
                </Label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-md transition-colors",
                      formatDateToIso(selectedDate) === formatDateToIso(new Date()) && !isMultiDay
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={handleSetTomorrow}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                  >
                    Besok
                  </button>
                </div>
              </div>

              <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 px-3.5 text-sm bg-background border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl transition-colors",
                      !selectedDate && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2.5 h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate text-slate-800 dark:text-zinc-200 font-medium">
                      {isMultiDay ? (
                        dateRange?.from ? (
                          dateRange.to ? (
                            `${formatIndoDate(dateRange.from)} — ${formatIndoDate(dateRange.to)}`
                          ) : (
                            formatIndoDate(dateRange.from)
                          )
                        ) : (
                          "Pilih rentang tanggal izin"
                        )
                      ) : (
                        formatIndoDate(selectedDate)
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-auto p-0 shadow-xl border-border" align="start">
                  {isMultiDay ? (
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range?.from && range?.to) {
                          setSelectedDate(range.from);
                        }
                      }}
                      initialFocus
                    />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setDateRange({ from: date, to: date });
                          setOpenDatePopover(false);
                        }
                      }}
                      initialFocus
                    />
                  )}
                </PopoverContent>
              </Popover>

              {!isDispensation && (
                <div className="pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-normal text-slate-600 dark:text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={isMultiDay}
                      onChange={(e) => {
                        setIsMultiDay(e.target.checked);
                        if (!e.target.checked) {
                          setDateRange({ from: selectedDate, to: selectedDate });
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Izin lebih dari 1 hari (rentang tanggal)</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Jam Pelajaran */}
            {isDispensation && !isMultiDay && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-blue-600" />
                    Pilih Jam Pelajaran (1 JP = 45 menit) <span className="text-rose-600 font-normal">*</span>
                  </Label>

                  <div className="flex items-center gap-2">
                    {selectingStart !== null ? (
                      <span className="text-xs text-blue-800 dark:text-blue-200 font-medium bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-md">
                        Klik jam selesai...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSetAllActiveJP}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        Pilih Semua Jam Aktif (1-10)
                      </button>
                    )}
                  </div>
                </div>

                <div 
                  className="w-full p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-card space-y-3"
                  onMouseLeave={() => setHoveredPeriod(null)}
                >
                  <div className="sm:hidden flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                      <span>👉 Geser ke kanan untuk Jam 1 — 10</span>
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md font-sans">10 JP Aktif</span>
                  </div>
                  
                  <div className="w-full overflow-x-auto overflow-y-hidden pb-2 pt-1 touch-pan-x scroll-smooth overscroll-x-contain">
                    <div className="grid grid-cols-10 gap-x-0 min-w-[580px] sm:min-w-0 text-center select-none py-1">
                      {JP_SCHEDULE.map((jp) => {
                        const passed = isPeriodPassed(selectedDate, jp);
                        const isPicking = selectingStart !== null;
                        const hasSelection = startPeriod !== null && endPeriod !== null;
                        const isLockedStart = !isPicking && !passed && hasSelection && jp.period === startPeriod;
                        const isLockedEnd = !isPicking && !passed && hasSelection && jp.period === endPeriod;
                        const isLockedRange = !isPicking && !passed && hasSelection && jp.period >= startPeriod && jp.period <= endPeriod;
                        const isLockedSingle = hasSelection && startPeriod === endPeriod;

                        const isAnchor = isPicking && jp.period === selectingStart;
                        const isHoverTarget = isPicking && hoveredPeriod !== null && jp.period === hoveredPeriod && hoveredPeriod !== selectingStart;
                        const isPreviewRange = isPicking && !passed && effectiveStart !== null && effectiveEnd !== null && jp.period >= effectiveStart && jp.period <= effectiveEnd;
                        const isPreviewSingle = effectiveStart !== null && effectiveStart === effectiveEnd;

                        const showBand = isPicking ? (isPreviewRange && !isPreviewSingle) : (isLockedRange && !isLockedSingle);
                        const showStartCap = isPicking ? (jp.period === effectiveStart && !isPreviewSingle) : (isLockedStart && !isLockedSingle);
                        const showEndCap = isPicking ? (jp.period === effectiveEnd && !isPreviewSingle) : (isLockedEnd && !isLockedSingle);

                        return (
                          <div
                            key={`jp-slot-${jp.period}`}
                            className={cn(
                              "h-16 flex items-center justify-center relative transition-colors",
                              showBand && "bg-blue-100/80 dark:bg-blue-950/70",
                              showStartCap && "rounded-l-2xl",
                              showEndCap && "rounded-r-2xl"
                            )}
                          >
                            <button
                              type="button"
                              disabled={passed}
                              onClick={() => handleJpNumberClick(jp.period)}
                              onMouseEnter={() => !passed && setHoveredPeriod(jp.period)}
                              className={cn(
                                "w-full max-w-[54px] h-14 rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all duration-100 cursor-pointer",
                                ((isLockedStart || isLockedEnd) || isAnchor) && 
                                  "bg-blue-600 text-white font-semibold shadow-sm z-10",
                                isHoverTarget && 
                                  "border-2 border-dashed border-blue-600 bg-blue-200 dark:bg-blue-900/80 text-blue-950 dark:text-blue-100 font-semibold z-10",
                                (showBand && !isLockedStart && !isLockedEnd && !isAnchor && !isHoverTarget) && 
                                  "text-blue-950 dark:text-blue-100 font-medium",
                                (!showBand && !isLockedStart && !isLockedEnd && !isAnchor && !isHoverTarget && !passed) && 
                                  "text-slate-700 dark:text-zinc-200 bg-background hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 border border-slate-300 dark:border-zinc-700 font-medium",
                                passed && "opacity-35 cursor-not-allowed bg-slate-100 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-500 line-through border border-dashed border-slate-300 dark:border-zinc-800"
                              )}
                              title={`Jam ke-${jp.period}: ${jp.start} - ${jp.end}`}
                            >
                              <span className="text-sm font-semibold leading-none">{jp.period}</span>
                              <span className={cn(
                                "text-[10px] leading-none mt-1 font-normal",
                                ((isLockedStart || isLockedEnd) || isAnchor) ? "text-blue-100" : "text-slate-500 dark:text-zinc-400"
                              )}>
                                {jp.start}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {effectiveStart !== null && effectiveEnd !== null && activeStartJp && activeEndJp ? (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-sm text-blue-950 dark:text-blue-100 animate-in fade-in duration-100">
                      <div className="flex items-center gap-2 truncate font-normal">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="truncate">
                          Jam ke-<span className="font-medium">{effectiveStart}</span> s/d <span className="font-medium">{effectiveEnd}</span> ({activeStartJp.start} - {activeEndJp.end})
                        </span>
                      </div>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600 border-none text-xs font-medium px-2.5 py-1 shrink-0 ml-1">
                        {effectiveEnd - effectiveStart + 1} JP
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                      <span>Klik nomor jam pelajaran di atas untuk menentukan jam mulai dan selesai</span>
                      <span className="font-medium text-slate-400 dark:text-zinc-500">0 JP</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Alasan / Keperluan */}
            <div className="space-y-2 pt-1">
              <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                Alasan / Detail Keperluan <span className="text-rose-600 font-normal">*</span>
              </Label>
              <Textarea
                rows={5}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Tuliskan alasan perizinan atau rincian detail kegiatan sekolah secara lengkap..."
                className="min-h-[140px] text-sm font-normal leading-relaxed border-slate-300 dark:border-zinc-700 rounded-xl resize-y text-slate-800 dark:text-zinc-200"
              />
            </div>

            {/* 5. File Uploader */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                  Dokumen Pendukung <span className="text-slate-500 font-normal text-xs">(Surat Dokter, Undangan Lomba, dll.)</span>
                </Label>
                {attachments.length > 0 && (
                  <span className="text-xs font-medium text-blue-600">
                    {attachments.length} file terlampir
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input-student"
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5",
                  isDraggingFile 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60" 
                    : "border-slate-300 dark:border-zinc-700 hover:border-blue-500 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-blue-50/30"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                    <span className="text-blue-600 hover:underline">Klik untuk memilih file</span> atau seret dokumen ke sini
                  </p>
                  <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-0.5">
                    Format: PDF, PNG, JPG (Maksimal 5 MB)
                  </p>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {attachments.map((att, idx) => {
                    const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png)$/i);

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-card flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isImg && att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                              {isImg ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">{att.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-normal text-slate-500">{att.size}</span>
                              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Siap</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAttachment(idx);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg shrink-0 transition-colors"
                          title="Hapus lampiran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('OVERVIEW')}
                className="h-10 px-4 text-sm font-medium rounded-lg"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-10 px-5 gap-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                <span>Kirim Pengajuan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
