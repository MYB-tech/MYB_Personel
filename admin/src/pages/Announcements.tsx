import { useState, useEffect } from 'react';
import { announcementsService } from '../services/announcementsService';
import { messageTemplatesService } from '../services/messageTemplatesService';
import type { MessageTemplate } from '../services/messageTemplatesService';
import type { AnnouncementPreview } from '../services/announcementsService';
import { Button } from '../components/ui/button';
import { Upload, AlertTriangle, CheckCircle, Send, FileSpreadsheet, Save, Trash2 } from 'lucide-react';

interface ExcelRow {
    Ad: string;
    Soyad: string;
    Tel: string;
    Apartman: string;
    'Daire No': string;
    Bakiye: string | number;
}

export default function AnnouncementsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<AnnouncementPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');

    // Template states
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [templateName, setTemplateName] = useState('');
    const [isMeta, setIsMeta] = useState(false);
    const [metaTemplateName, setMetaTemplateName] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await messageTemplatesService.findAll();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const handleSelectTemplate = (id: string) => {
        setSelectedTemplateId(id);
        if (id === '') {
            setTemplateName('');
            setMessageTemplate('');
            setIsMeta(false);
            setMetaTemplateName('');
            return;
        }

        const template = templates.find(t => t.id.toString() === id);
        if (template) {
            setTemplateName(template.name);
            setMessageTemplate(template.content);
            setIsMeta(template.is_meta);
            setMetaTemplateName(template.meta_template_name || '');
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            alert('Lütfen şablon için bir isim girin.');
            return;
        }
        if (!messageTemplate.trim()) {
            alert('Şablon içeriği boş olamaz.');
            return;
        }

        setIsSavingTemplate(true);
        try {
            const payload = {
                name: templateName,
                content: messageTemplate,
                is_meta: isMeta,
                meta_template_name: isMeta ? metaTemplateName : null,
            };

            if (selectedTemplateId) {
                await messageTemplatesService.update(parseInt(selectedTemplateId), payload);
            } else {
                const newTemplate = await messageTemplatesService.create(payload);
                setSelectedTemplateId(newTemplate.id.toString());
            }
            await loadTemplates();
            alert('Şablon kaydedildi.');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Şablon kaydedilirken hata oluştu.');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async () => {
        if (!selectedTemplateId) return;
        if (!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;

        try {
            await messageTemplatesService.remove(parseInt(selectedTemplateId));
            handleSelectTemplate('');
            await loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Şablon silinirken hata oluştu.');
        }
    };

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
        if (!messageTemplate.trim()) {
            alert('Lütfen bir mesaj içeriği oluşturun.');
            return;
        }
        if (!window.confirm(`${preview.valid.length} kişiye mesaj gönderilsin mi?`)) return;

        setSending(true);
        try {
            await announcementsService.sendBulk(
                preview.valid,
                messageTemplate,
                isMeta,
                metaTemplateName
            );
            setSuccessMessage(`${preview.valid.length} mesaj başarıyla kuyruğa eklendi.`);
            setFile(null);
            setPreview(null);
            setMessageTemplate('');
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
                            Sütunlar: <code>Apartman, Daire No, Ad, Soyad, Tel No, Bakiye</code>
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
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold">Mesaj İçeriği ve Şablonlar</h3>
                        <div className="flex items-center gap-2">
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={selectedTemplateId}
                                onChange={(e) => handleSelectTemplate(e.target.value)}
                            >
                                <option value="">-- Şablon Seçin --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {selectedTemplateId && (
                                <Button variant="destructive" size="icon" onClick={handleDeleteTemplate}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Şablon Adı</label>
                                <input
                                    type="text"
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Örn: Aidat Hatırlatma"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="flex items-center gap-2 h-10">
                                    <input
                                        type="checkbox"
                                        id="isMeta"
                                        checked={isMeta}
                                        onChange={(e) => setIsMeta(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isMeta" className="text-sm font-medium cursor-pointer">
                                        Meta API Şablonu mu?
                                    </label>
                                </div>
                                {isMeta && (
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium">Meta Şablon Adı</label>
                                        <input
                                            type="text"
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Örn: aidat_bildirimi"
                                            value={metaTemplateName}
                                            onChange={(e) => setMetaTemplateName(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Aşağıdaki butonları kullanarak dinamik alanlar ekleyebilirsiniz.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Ad', value: '<ad>' },
                                    { label: 'Soyad', value: '<soyad>' },
                                    { label: 'Apartman', value: '<apartman>' },
                                    { label: 'Daire No', value: '<daire_no>' },
                                    { label: 'Telefon', value: '<tel_no>' },
                                    { label: 'Bakiye', value: '<bakiye>' },
                                ].map((tag) => (
                                    <button
                                        key={tag.value}
                                        onClick={() => setMessageTemplate(prev => prev + tag.value)}
                                        className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors"
                                    >
                                        {tag.label} ({tag.value})
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Mesajınızı buraya yazın..."
                                value={messageTemplate}
                                onChange={(e) => setMessageTemplate(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleSaveTemplate} isLoading={isSavingTemplate}>
                                <Save className="mr-2 h-4 w-4" />
                                {selectedTemplateId ? 'Şablonu Güncelle' : 'Şablon Olarak Kaydet'}
                            </Button>
                        </div>
                    </div>
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
                                        <th className="p-3 text-left">Apartman / Daire</th>
                                        <th className="p-3 text-left">Telefon</th>
                                        <th className="p-3 text-left">Bakiye</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.valid.map((row: ExcelRow, i) => (
                                        <tr key={i} className="border-b border-border last:border-0">
                                            <td className="p-3 font-medium">{row.Ad} {row.Soyad}</td>
                                            <td className="p-3">{row.Apartman} / {row['Daire No']}</td>
                                            <td className="p-3">{row.Tel}</td>
                                            <td className="p-3">{row.Bakiye} TL</td>
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
