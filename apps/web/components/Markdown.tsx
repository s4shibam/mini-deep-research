import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

type MarkdownProps = {
  content: string
  className?: string
}

export default function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ className: linkClassName, ...props }) => (
            <a
              className={cn(
                'font-medium text-blue-600 underline-offset-4 hover:underline',
                linkClassName
              )}
              rel="noreferrer"
              target="_blank"
              {...props}
            />
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName
            return (
              <code
                className={cn(
                  isInline
                    ? 'rounded bg-gray-100 px-1.5 py-0.5 text-[0.9em] text-gray-900'
                    : 'text-sm text-gray-900',
                  codeClassName
                )}
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ className: preClassName, ...props }) => (
            <pre
              className={cn(
                'overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900',
                preClassName
              )}
              {...props}
            />
          ),
          blockquote: ({ className: blockClassName, ...props }) => (
            <blockquote
              className={cn(
                'border-l-2 border-gray-300 pl-4 text-gray-600',
                blockClassName
              )}
              {...props}
            />
          ),
          table: ({ className: tableClassName, ...props }) => (
            <div className="overflow-x-auto">
              <table
                className={cn('w-full border-collapse text-sm', tableClassName)}
                {...props}
              />
            </div>
          ),
          th: ({ className: thClassName, ...props }) => (
            <th
              className={cn(
                'border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-800',
                thClassName
              )}
              {...props}
            />
          ),
          td: ({ className: tdClassName, ...props }) => (
            <td
              className={cn(
                'border-b border-gray-100 px-3 py-2 align-top text-gray-700',
                tdClassName
              )}
              {...props}
            />
          ),
          ul: ({ className: ulClassName, ...props }) => (
            <ul className={cn('list-disc pl-5', ulClassName)} {...props} />
          ),
          ol: ({ className: olClassName, ...props }) => (
            <ol className={cn('list-decimal pl-5', olClassName)} {...props} />
          ),
          li: ({ className: liClassName, ...props }) => (
            <li className={cn('my-1', liClassName)} {...props} />
          ),
          h1: ({ className: hClassName, ...props }) => (
            <h1
              className={cn('text-2xl font-semibold text-gray-900', hClassName)}
              {...props}
            />
          ),
          h2: ({ className: hClassName, ...props }) => (
            <h2
              className={cn('text-xl font-semibold text-gray-900', hClassName)}
              {...props}
            />
          ),
          h3: ({ className: hClassName, ...props }) => (
            <h3
              className={cn('text-lg font-semibold text-gray-900', hClassName)}
              {...props}
            />
          ),
          h4: ({ className: hClassName, ...props }) => (
            <h4
              className={cn(
                'text-base font-semibold text-gray-900',
                hClassName
              )}
              {...props}
            />
          ),
          p: ({ className: pClassName, ...props }) => (
            <p className={cn('leading-relaxed', pClassName)} {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
