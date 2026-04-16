import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { getErrorMessage, formatDate } from '../lib/utils';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await postAPI.getById(id);
        setPost(data.post);
      } catch (err) {
        showError(getErrorMessage(err));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    
    setDeleting(true);
    try {
      await postAPI.delete(id);
      showSuccess('Yazı silindi');
      navigate('/dashboard');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                post.status === 'published' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {post.status === 'published' ? 'Yayında' : 'Taslak'}
              </span>
              <span className="text-sm text-gray-400">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl font-bold">{post.title}</h1>
          </div>

          {post.excerpt && (
            <p className="text-lg text-gray-600 dark:text-gray-400 border-l-4 border-primary-500 pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {post.content}
            </div>
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Geri Dön
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              loading={deleting}
            >
              Sil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
