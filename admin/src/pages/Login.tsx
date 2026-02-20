import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Lock, Phone } from 'lucide-react';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Giriş başarısız');
            }

            // Check if user is admin
            if (data.user.role !== 'admin') {
                throw new Error('Bu panele sadece yöneticiler giriş yapabilir.');
            }

            login(data.access_token, data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f1e2e] p-4 text-foreground">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-card border border-border p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">MYB Personel</h2>
                    <p className="mt-2 text-sm text-gray-400">Yönetim Paneline Giriş Yap</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <Input
                                type="tel"
                                placeholder="Telefon Numarası"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-10 bg-[#1e293b] border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <Input
                                type="password"
                                placeholder="Parola"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-[#1e293b] border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Giriş Yap
                    </Button>
                </form>
            </div>
        </div>
    );
}
