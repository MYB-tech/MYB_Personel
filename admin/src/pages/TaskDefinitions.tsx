import React, { useState, useEffect } from 'react';
import { taskDefinitionService, type TaskDefinition } from '../services/taskDefinitionService';
import { messageTemplatesService, type MessageTemplate } from '../services/messageTemplatesService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { Plus, Edit2, Trash2, Search, Bell } from 'lucide-react';

export default function TaskDefinitionsPage() {
    const [definitions, setDefinitions] = useState<TaskDefinition[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDef, setSelectedDef] = useState<TaskDefinition | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        icon: 'task_alt',
        message_template_id: '' as string | number
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [defData, templateData] = await Promise.all([
                taskDefinitionService.getAll(),
                messageTemplatesService.findAll()
            ]);
            setDefinitions(defData);
            setTemplates(templateData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedDef(null);
        setFormData({ name: '', code: '', icon: 'task_alt', message_template_id: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (def: TaskDefinition) => {
        setSelectedDef(def);
        setFormData({
            name: def.name,
            code: def.code,
            icon: def.icon,
            message_template_id: def.message_template_id || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu görev tanımını silmek istediğinize emin misiniz?')) return;
        try {
            await taskDefinitionService.delete(id);
            setDefinitions(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting task definition:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                message_template_id: formData.message_template_id === '' ? undefined : Number(formData.message_template_id)
            };

            if (selectedDef) {
                const updated = await taskDefinitionService.update(selectedDef.id, payload);
                setDefinitions(prev => prev.map(d => d.id === updated.id ? updated : d));
            } else {
                const created = await taskDefinitionService.create(payload);
                setDefinitions(prev => [...prev, created]);
            }
            setIsModalOpen(false);
            fetchData(); // Refresh to get relations if needed
        } catch (error) {
            console.error('Error saving task definition:', error);
            alert('Kaydedilirken bir hata oluştu.');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredDefinitions = definitions.filter(def =>
        def.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        def.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Görev Tanımları</h2>
                    <p className="text-muted-foreground">Görev türlerini ve otomatik bildirim mesajlarını yönetin.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Tanım
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="İsim veya kod ile ara..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b border-border transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Görev Adı</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Kod</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">İkon</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Mesaj Şablonu</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center">Yükleniyor...</td>
                                </tr>
                            ) : filteredDefinitions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredDefinitions.map((def) => (
                                    <tr key={def.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{def.name}</td>
                                        <td className="p-4 align-middle"><code>{def.code}</code></td>
                                        <td className="p-4 align-middle">{def.icon}</td>
                                        <td className="p-4 align-middle">
                                            {def.message_template ? (
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Bell size={14} />
                                                    {def.message_template.name}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Bağlı değil</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(def)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(def.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDef ? "Tanımı Düzenle" : "Yeni Görev Tanımı"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Görev Adı</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Örn: Çöp Toplama"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Kod (Benzersiz)</label>
                        <Input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Örn: garbage"
                            required
                            disabled={!!selectedDef}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">İkon (Material/Lucide Adı)</label>
                        <Input
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="Örn: delete_outline"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">WhatsApp Mesaj Şablonu</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.message_template_id}
                            onChange={(e) => setFormData({ ...formData, message_template_id: e.target.value })}
                        >
                            <option value="">Şablon Seçilmedi (Bildirim gönderilmez)</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.is_meta ? 'Meta' : 'Serbest Metin'})</option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Görev başlatıldığında bu şablondaki mesaj apartman sakinlerine otomatik gönderilir.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit" isLoading={formLoading}>Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
