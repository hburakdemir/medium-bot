import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-lg text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-500 flex items-center justify-center shadow-xl shadow-primary-500/30">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            AI ile Medium İçerik Üretin
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Google Gemini AI kullanarak saniyeler içinde benzersiz ve ilgi çekici Medium yazıları oluşturun.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Ücretsiz Başla
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Giriş Yap
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8">
          {[
            { title: 'Hızlı', desc: 'Dakikalar içinde içerik' },
            { title: 'Akıllı', desc: 'Gemini AI gücü' },
            { title: 'Kolay', desc: 'Sadece prompt yaz' },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="text-2xl font-bold text-primary-500">{feature.title}</div>
              <div className="text-sm text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
