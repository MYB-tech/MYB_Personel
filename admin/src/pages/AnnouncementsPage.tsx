import { useState } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import {
    Send,
    FileUp,
    AlertCircle,
    CheckCircle2,
    Users,
    MessageSquare,
    Loader2
} from 'lucide-react';

interface PreviewData {
    total: number;
    valid_count: number;
    invalid_count: number;
    valid: Array<{ Ad: string; Tel: string; Apartman: string }>;
    invalid: Array<{ row: number; data: any; error: string }>;
}

export default function AnnouncementsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setPreview(null);
            setSuccessMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/announcements/preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreview(response.data);
        } catch (error) {
            alert('Dosya parse edilemedi. Lütfen geçerli bir Excel yükleyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!preview || !message || preview.valid_count === 0) return;
        setIsSending(true);

        try {
            await api.post('/announcements/send', {
                recipients: preview.valid.map(r => ({ phone: r.Tel, name: r.Ad })),
                template_name: 'generic_announcement', // Backend template parameter
                parameters: [
                    { type: 'text', text: message }
                ]
            });
            setSuccessMessage(`${preview.valid_count} kişiye mesaj kuyruğa eklendi.`);
            setPreview(null);
            setFile(null);
            setMessage('');
        } catch (error) {
            alert('Mesajlar gönderilemedi.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Toplu Duyuru (WhatsApp)</h2>
                <p className="text-muted-foreground">Sakinlere WhatsApp üzerinden toplu bildirim gönderin.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Dosya Yükleme Alanı */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-primary" />
                        1. Excel Dosyası Yükle
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Excel dosyası; <b>Ad</b>, <b>Tel</b>, <b>Apartman</b> sütunlarını içermelidir.
                    </p>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-4 text-center">
                        <input
                            type="file"
                            id="excel-upload"
                            hidden
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="excel-upload"
                            className="bg-primary/10 p-4 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                            <FileUp className="h-8 w-8 text-primary" />
                        </label>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{file ? file.name : 'Dosya seçilmedi'}</p>
                            <p className="text-[10px] text-muted-foreground">Max 5MB (.xlsx)</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="w-full"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Listeyi Analiz Et
                    </Button>
                </div>

                {/* Mesaj İçeriği Alanı */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        2. Duyuru Mesajı
                    </h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mesaj İçeriği</label>
                        <textarea
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Sakinlere gönderilecek mesaj..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Önizleme Paneli */}
            {preview && (
                <div className="bg-card border border-border rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Gönderim Önizlemesi</h3>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-500">{preview.valid_count}</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Geçerli</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-500">{preview.invalid_count}</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Hatalı</p>
                            </div>
                        </div>
                    </div>

                    {preview.invalid_count > 0 && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm font-bold text-red-500 flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4" />
                                Bazı satırlarda hata var (Gönderilmeyecek)
                            </p>
                            <ul className="text-xs text-red-400 space-y-1">
                                {preview.invalid.slice(0, 3).map((item, i) => (
                                    <li key={i}>Satır {item.row}: {item.error}</li>
                                ))}
                                {preview.invalid_count > 3 && <li>... ve {preview.invalid_count - 3} satır daha</li>}
                            </ul>
                        </div>
                    )}

                    <div className="max-h-[300px] overflow-y-auto mb-6 border border-border rounded-lg">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm shadow-sm border-b">
                                <tr>
                                    <th className="p-3 font-semibold">Ad</th>
                                    <th className="p-3 font-semibold">Telefon</th>
                                    <th className="p-3 font-semibold">Apartman</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {preview.valid.map((r, i) => (
                                    <tr key={i}>
                                        <td className="p-3">{r.Ad}</td>
                                        <td className="p-3 text-muted-foreground">{r.Tel}</td>
                                        <td className="p-3">{r.Apartman}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-2 text-primary">
                            <Users className="h-5 w-5" />
                            <span className="font-bold">{preview.valid_count} kişiye gönderime hazır.</span>
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={isSending || !message}
                            className="px-8"
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Şimdi Kuyruğa Ekle
                        </Button>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl flex items-center gap-4 animate-bounce">
                    <CheckCircle2 className="h-10 w-10" />
                    <div>
                        <p className="font-bold text-lg">Başarılı!</p>
                        <p className="text-sm">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
