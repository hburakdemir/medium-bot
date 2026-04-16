import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../lib/utils';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password, rememberMe });
      showSuccess('Giriş başarılı!');
      navigate('/dashboard');
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
          <h1 className="text-2xl font-bold">MediumBot</h1>
          <p className="text-gray-500">AI ile içerik üretin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Beni hatırla</span>
            </label>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Giriş Yap
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
            Kayıt olun
          </Link>
        </p>
      </div>
    </div>
  );
}
