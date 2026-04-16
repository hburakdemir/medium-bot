import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../lib/utils';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      showSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setTimeout(() => navigate('/login'), 100);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-bold">Kayıt Ol</h1>
          <p className="text-gray-500">Hesap oluşturun ve AI ile içerik üretin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="İsim"
            placeholder="Adınız"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="E-posta"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Şifre"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Şifre Tekrar"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Kayıt Ol
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
