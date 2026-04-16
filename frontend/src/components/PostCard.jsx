import { Link } from 'react-router-dom';
import { Card, CardContent } from './Card';
import { formatDate, truncate } from '../lib/utils';

export function PostCard({ post }) {
  return (
    <Link to={`/posts/${post.id}`}>
      <Card hover>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${
                post.status === 'published' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {post.status === 'published' ? 'Yayında' : 'Taslak'}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h3 className="font-semibold text-lg leading-snug line-clamp-2">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {truncate(post.excerpt, 120)}
              </p>
            )}

            {post.mediumUrl && (
              <a 
                href={post.mediumUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Medium'da görüntüle
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
