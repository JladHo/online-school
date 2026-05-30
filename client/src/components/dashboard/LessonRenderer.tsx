import React from 'react';
import { marked } from 'marked';

export default function LessonRenderer({ content }: { content: string }) {
  let blocks: any[] = [];
  let isBlocks = false;

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
      blocks = parsed;
      isBlocks = true;
    }
  } catch {
    isBlocks = false;
  }

  if (!isBlocks) {
    return <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none" />;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === 'text') {
          const htmlContent = marked.parse(block.value || '');
          return (
            <div 
              key={index} 
              className="prose max-w-none whitespace-pre-wrap leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{ __html: htmlContent as string }}
            />
          );
        }
        if (block.type === 'image') {
          // In case user pasted markdown ![alt](url) into the URL field
          let imageUrl = block.value || '';
          const markdownMatch = imageUrl.match(/!\[.*?\]\((.*?)\)/);
          if (markdownMatch && markdownMatch[1]) {
            imageUrl = markdownMatch[1];
          }
          
          return (
            <div key={index} className="my-6">
              <img src={imageUrl} alt="Lesson illustration" className="max-w-full rounded-2xl shadow-sm border border-gray-100" />
            </div>
          );
        }
        if (block.type === 'video') {
          // Attempt to convert youtube link to embed link
          let embedUrl = block.value;
          if (embedUrl.includes('youtube.com/watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/');
          } else if (embedUrl.includes('youtu.be/')) {
            embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
          }

          return (
            <div key={index} className="my-6 relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <iframe 
                src={embedUrl} 
                className="absolute top-0 left-0 w-full h-full" 
                allowFullScreen 
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}