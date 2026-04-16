import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useScrollPagination } from '../hooks/useScrollPagination';
import { postAPI } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { PostCardSkeleton } from '../components/Skeleton';
import { Button } from '../components/Button';

export function DashboardPage() {
  const { user } = useAuth();
  const [showGenerator, setShowGenerator] = useState(false);

  const fetchPosts = useCallback(async (page) => {
    const { data } = await postAPI.getAll({ page, limit: 10 });
    return data;
  }, []);

  const { items: posts, loading, hasMore, reset } = useScrollPagination(fetchPosts);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Merhaba, {user?.name || 'Kullanıcı'}</h1>
            <p className="text-gray-500">AI ile içerik üretmeye hazır mısın?</p>
          </div>
          <Button onClick={() => setShowGenerator(!showGenerator)}>
            {showGenerator ? 'Yazılarımı Gör' : 'AI ile Yaz'}
          </Button>
        </div>

        {showGenerator ? (
          <GeneratorSection onGenerated={() => {
            reset();
            setShowGenerator(false);
          }} />
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Yazılarım</h2>
            
            {posts.length === 0 && !loading && (
              <div className="text-center py-12 space-y-4">
                <p className="text-gray-500">Henüz yazı oluşturmadın</p>
                <Button onClick={() => setShowGenerator(true)}>
                  İlk Yazını Oluştur
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {loading && (
              <div className="space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center text-gray-400 py-4">Tüm yazılarını görüntüledin</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GeneratorSection({ onGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await postAPI.create({
        title: title || 'AI Generated',
        content: prompt,
        status: 'draft',
      });
      setGeneratedContent(data.post);
      onGenerated?.();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-6">
      <h2 className="text-xl font-bold">AI İçerik Üretici</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Konu / Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örnek: Python programlama dilinde yeni başlayanlar için temel kavramlar..."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Başlık (opsiyonel)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yazı başlığı"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ton</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="professional">Profesyonel</option>
              <option value="casual">Günlük</option>
              <option value="technical">Teknik</option>
              <option value="creative">Yaratıcı</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Uzunluk</label>
          <div className="flex gap-2">
            {['short', 'medium', 'long'].map((len) => (
              <button
                key={len}
                onClick={() => setLength(len)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  length === len
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {len === 'short' ? 'Kısa' : len === 'medium' ? 'Orta' : 'Uzun'}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          loading={loading} 
          className="w-full"
          disabled={!prompt.trim()}
        >
          İçerik Oluştur
        </Button>
      </div>
    </div>
  );
}
