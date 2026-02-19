import { useState } from 'react';
import { announcementsService } from '../services/announcementsService';
import type { AnnouncementPreview } from '../services/announcementsService';
import { Button } from '../components/ui/button';
import { Upload, AlertTriangle, CheckCircle, Send, FileSpreadsheet } from 'lucide-react';

interface ExcelRow {
    Ad: string;
    Soyad: string;
    Tel: string;
    Apartman: string;
}

export default function AnnouncementsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<AnnouncementPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setPreview(null);
            setSuccessMessage('');
        }
    };

    const handlePreview = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const data = await announcementsService.preview(file);
            setPreview(data);
        } catch (error) {
            console.error('Error previewing file:', error);
            alert('Dosya yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!preview || preview.valid.length === 0) return;
        if (!window.confirm(`${preview.valid.length} kişiye mesaj gönderilsin mi?`)) return;

        setSending(true);
        try {
            const recipients = preview.valid.map((row: ExcelRow) => ({
                // Excel headers: Ad, Soyad, Tel
                name: `${row.Ad} ${row.Soyad}`,
                phone: row.Tel,
            }));

            // Default template for now (or let user select)
            const templateName = 'hello_world'; // Replace with actual template

            await announcementsService.sendBulk(recipients, templateName);
            setSuccessMessage(`${preview.valid.length} mesaj başarıyla kuyruğa eklendi.`);
            setFile(null);
            setPreview(null);
        } catch (error) {
            console.error('Error sending messages:', error);
            alert('Mesaj gönderilirken hata oluştu.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Duyurular</h2>
                <p className="text-muted-foreground">Excel listesi yükleyerek toplu WhatsApp mesajı gönderin.</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 text-center max-w-xl mx-auto">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-full text-primary">
                        <FileSpreadsheet className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Excel Dosyası Yükle</h3>
                        <p className="text-sm text-muted-foreground">
                            Sütunlar: <code>Ad, Soyad, Tel, Apartman</code>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <span className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
                                Dosya Seç
                            </span>
                        </label>
                        {file && <span className="text-sm font-medium">{file.name}</span>}
                    </div>

                    <Button
                        onClick={handlePreview}
                        disabled={!file || loading}
                        isLoading={loading}
                        className="w-full max-w-xs"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Önizle
                    </Button>
                </div>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-3 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    {successMessage}
                </div>
            )}

            {preview && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Valid Rows */}
                    <div className="border border-border rounded-md bg-card overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-semibold flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Gönderilecek Kişiler ({preview.valid_count})
                            </h3>
                        </div>
                        <div className="p-0 max-h-[400px] overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left">Ad Soyad</th>
                                        <th className="p-3 text-left">Telefon</th>
                                        <th className="p-3 text-left">Apartman</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.valid.map((row: ExcelRow, i) => (
                                        <tr key={i} className="border-b border-border last:border-0">
                                            <td className="p-3 font-medium">{row.Ad} {row.Soyad}</td>
                                            <td className="p-3">{row.Tel}</td>
                                            <td className="p-3">{row.Apartman}</td>
                                        </tr>
                                    ))}
                                    {preview.valid.length === 0 && (
                                        <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Geçerli kayıt yok.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {preview.valid.length > 0 && (
                            <div className="p-4 border-t border-border bg-muted/10">
                                <Button className="w-full" onClick={handleSend} isLoading={sending}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {preview.valid.length} Kişiye Gönder
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Invalid Rows */}
                    {preview.invalid_count > 0 && (
                        <div className="border border-border rounded-md bg-card overflow-hidden">
                            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                <h3 className="font-semibold flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    Hatalı Kayıtlar ({preview.invalid_count})
                                </h3>
                            </div>
                            <div className="p-0 max-h-[400px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-left">Satır</th>
                                            <th className="p-3 text-left">Veri</th>
                                            <th className="p-3 text-left">Hata</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.invalid.map((item, i) => (
                                            <tr key={i} className="border-b border-border last:border-0 bg-destructive/5">
                                                <td className="p-3 font-mono">{item.row}</td>
                                                <td className="p-3 text-xs font-mono">{JSON.stringify(item.data)}</td>
                                                <td className="p-3 text-destructive">{item.error}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
