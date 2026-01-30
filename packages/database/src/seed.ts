import { prisma } from './client.js'
import { ConversationStatus, MessageSender } from '@prisma/client'
import type { MessageContent } from '@repo/types'

async function main() {
  console.log('🌱 Starting database seed...')

  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  console.log('✅ Cleared existing data')

  const conversation1 = await prisma.conversation.create({
    data: {
      status: ConversationStatus.completed,
      workflowId: 'workflow-demo-comprehensive',
      messages: {
        create: [
          {
            sender: MessageSender.human,
            index: 0,
            content: [
              {
                type: 'text',
                text: 'What are the latest developments in quantum computing and how do they compare to classical computing?'
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 1,
            content: [
              {
                type: 'text',
                text: "I'll search for the latest developments in quantum computing and compare them with classical computing."
              },
              {
                type: 'tool_use',
                id: 'tool_001',
                name: 'web_search_with_relevancy',
                input: {
                  query: 'latest developments quantum computing 2026',
                  maxResults: 5
                }
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 2,
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'tool_001',
                name: 'web_search_with_relevancy',
                content: {
                  subQueries: [
                    'quantum computing breakthroughs 2026',
                    'quantum vs classical computing comparison',
                    'quantum computer applications 2026'
                  ],
                  results: [
                    {
                      url: 'https://example.com/quantum-breakthrough-2026',
                      title: 'Major Quantum Computing Breakthrough Announced',
                      snippet:
                        'Scientists achieve quantum advantage with 1000-qubit processor, demonstrating exponential speedup over classical computers.',
                      isRelevant: true,
                      reason:
                        'Directly discusses recent quantum computing developments'
                    },
                    {
                      url: 'https://example.com/quantum-vs-classical',
                      title:
                        'Quantum vs Classical Computing: A Comprehensive Comparison',
                      snippet:
                        'Detailed analysis of quantum computing advantages including superposition, entanglement, and quantum tunneling.',
                      isRelevant: true,
                      reason:
                        'Provides comparison between quantum and classical computing'
                    },
                    {
                      url: 'https://example.com/quantum-applications',
                      title: 'Real-World Quantum Computing Applications',
                      snippet:
                        'From drug discovery to cryptography, quantum computers are solving previously intractable problems.',
                      isRelevant: true,
                      reason:
                        'Shows practical applications of quantum computing'
                    },
                    {
                      url: 'https://example.com/quantum-history',
                      title: 'The History of Computing',
                      snippet:
                        'A timeline of computing from the abacus to modern computers.',
                      isRelevant: false,
                      reason:
                        'Too broad and historical, not focused on recent quantum developments'
                    }
                  ]
                },
                is_error: false
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 3,
            content: [
              {
                type: 'text',
                text: 'Let me fetch more detailed information from the breakthrough article.'
              },
              {
                type: 'tool_use',
                id: 'tool_002',
                name: 'fetch_web_page',
                input: {
                  url: 'https://example.com/quantum-breakthrough-2026'
                }
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 4,
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'tool_002',
                name: 'fetch_web_page',
                content: {
                  url: 'https://example.com/quantum-breakthrough-2026',
                  text: 'Major Quantum Computing Breakthrough Announced\n\nIn a groundbreaking development, researchers at QuantumTech Labs have successfully demonstrated quantum advantage using a 1000-qubit processor. This achievement marks a significant milestone in the field of quantum computing.\n\nKey Highlights:\n- 1000-qubit coherent quantum processor\n- Demonstrated exponential speedup over classical supercomputers\n- Achieved error rates below 0.1%\n- Practical applications in optimization and simulation\n\nComparison with Classical Computing:\nWhile classical computers process bits (0 or 1), quantum computers use qubits that can exist in superposition, representing both states simultaneously. This allows quantum computers to explore multiple solutions in parallel.\n\nThe new processor can solve certain optimization problems in minutes that would take classical supercomputers thousands of years.'
                },
                is_error: false
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 5,
            content: [
              {
                type: 'text',
                text: `Based on my research, here are the latest developments in quantum computing and how they compare to classical computing:

## Latest Developments (2026)

**Major Breakthrough**: Scientists at QuantumTech Labs have achieved a significant milestone with a 1000-qubit coherent quantum processor that demonstrates quantum advantage over classical supercomputers.

### Key Achievements:
- **1000-qubit processor** with error rates below 0.1%
- **Exponential speedup** for specific problem classes
- **Practical applications** in optimization and simulation
- Problems that would take classical supercomputers thousands of years can now be solved in minutes

## Quantum vs Classical Computing

### Classical Computing:
- Uses **bits** (0 or 1) as the fundamental unit
- Processes information sequentially or with limited parallelism
- Deterministic and predictable
- Excellent for general-purpose computing

### Quantum Computing:
- Uses **qubits** that exist in superposition (both 0 and 1 simultaneously)
- Leverages quantum phenomena:
  - **Superposition**: Process multiple states at once
  - **Entanglement**: Correlate qubits for complex computations
  - **Quantum tunneling**: Explore solution spaces efficiently
- Exponential speedup for specific problem types
- Particularly suited for:
  - Optimization problems
  - Drug discovery and molecular simulation
  - Cryptography
  - Complex system modeling

### Current State:
Quantum computers are not replacing classical computers but complementing them. They excel at specific tasks where their quantum properties provide advantages, while classical computers remain superior for general-purpose computing.

The recent breakthrough represents a significant step toward practical quantum computing applications that can solve real-world problems previously considered intractable.`
              }
            ] as MessageContent
          }
        ]
      }
    },
    include: {
      messages: true
    }
  })

  console.log(
    `✅ Created conversation 1: ${conversation1.id} (${conversation1.messages.length} messages)`
  )

  const conversation2 = await prisma.conversation.create({
    data: {
      status: ConversationStatus.processing,
      workflowId: 'workflow-demo-error-handling',
      messages: {
        create: [
          {
            sender: MessageSender.human,
            index: 0,
            content: [
              {
                type: 'text',
                text: 'Can you research the impact of AI on software development and find specific examples of AI coding assistants?'
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 1,
            content: [
              {
                type: 'text',
                text: "I'll search for information about AI's impact on software development."
              },
              {
                type: 'tool_use',
                id: 'tool_101',
                name: 'web_search_with_relevancy',
                input: {
                  query: 'AI impact on software development 2026',
                  maxResults: 5
                }
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 2,
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'tool_101',
                name: 'web_search_with_relevancy',
                content: {
                  subQueries: [
                    'AI coding assistants 2026',
                    'impact of AI on developers',
                    'AI pair programming tools'
                  ],
                  results: [
                    {
                      url: 'https://example.com/ai-coding-revolution',
                      title:
                        'The AI Coding Revolution: How AI is Transforming Software Development',
                      snippet:
                        'AI coding assistants have increased developer productivity by 40-60%, enabling faster prototyping and reducing bugs.',
                      isRelevant: true,
                      reason:
                        'Directly addresses AI impact on software development'
                    },
                    {
                      url: 'https://example.com/top-ai-assistants',
                      title: 'Top AI Coding Assistants in 2026',
                      snippet:
                        'Comprehensive review of GitHub Copilot, Cursor, Tabnine, and other AI-powered development tools.',
                      isRelevant: true,
                      reason: 'Lists specific AI coding assistant examples'
                    },
                    {
                      url: 'https://example.com/developer-survey',
                      title: 'Developer Survey: 78% Now Use AI Tools Daily',
                      snippet:
                        'Survey of 50,000 developers shows widespread adoption of AI coding assistants across all experience levels.',
                      isRelevant: true,
                      reason: 'Provides data on AI tool adoption'
                    }
                  ]
                },
                is_error: false
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 3,
            content: [
              {
                type: 'text',
                text: 'Let me get more details from the top AI assistants article.'
              },
              {
                type: 'tool_use',
                id: 'tool_102',
                name: 'fetch_web_page',
                input: {
                  url: 'https://example.com/top-ai-assistants'
                }
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 4,
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'tool_102',
                name: 'fetch_web_page',
                content: {
                  error: 'Failed to fetch page',
                  details:
                    'HTTP 403: Access forbidden. The website may be blocking automated requests.'
                },
                is_error: true
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 5,
            content: [
              {
                type: 'text',
                text: 'I encountered an access error with that page. Let me try fetching the developer survey instead.'
              },
              {
                type: 'tool_use',
                id: 'tool_103',
                name: 'fetch_web_page',
                input: {
                  url: 'https://example.com/developer-survey'
                }
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 6,
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'tool_103',
                name: 'fetch_web_page',
                content: {
                  url: 'https://example.com/developer-survey',
                  text: 'Developer Survey 2026: AI Tool Adoption\n\nKey Findings:\n- 78% of developers use AI coding assistants daily\n- 92% report increased productivity\n- Average time savings: 45 minutes per day\n- Top tools: GitHub Copilot (45%), Cursor (28%), Tabnine (15%)\n\nImpact Areas:\n1. Code completion and suggestions\n2. Bug detection and fixing\n3. Documentation generation\n4. Code refactoring\n5. Test case generation\n\nDevelopers report that AI assistants are particularly helpful for:\n- Boilerplate code generation\n- Learning new frameworks\n- Exploring unfamiliar codebases\n- Debugging complex issues'
                },
                is_error: false
              }
            ] as MessageContent
          },
          {
            sender: MessageSender.assistant,
            index: 7,
            content: [
              {
                type: 'text',
                text: `Based on my research, here's what I found about AI's impact on software development:

## AI's Impact on Software Development

### Adoption Statistics:
- **78% of developers** now use AI coding assistants daily
- **92% report increased productivity**
- Average time savings: **45 minutes per day**

### Top AI Coding Assistants (2026):
1. **GitHub Copilot** (45% market share) - AI pair programmer
2. **Cursor** (28% market share) - AI-first code editor
3. **Tabnine** (15% market share) - AI code completion

### Key Impact Areas:
- **Code completion and suggestions**: Real-time intelligent suggestions
- **Bug detection and fixing**: Automated error identification
- **Documentation generation**: Auto-generated code documentation
- **Code refactoring**: Intelligent code improvements
- **Test case generation**: Automated test creation

### Productivity Gains:
AI coding assistants have increased developer productivity by 40-60%, particularly in:
- Boilerplate code generation
- Learning new frameworks and libraries
- Exploring unfamiliar codebases
- Debugging complex issues

I'm continuing to gather more information...`
              }
            ] as MessageContent
          }
        ]
      }
    },
    include: {
      messages: true
    }
  })

  console.log(
    `✅ Created conversation 2: ${conversation2.id} (${conversation2.messages.length} messages)`
  )

  console.log('\n🎉 Seed completed successfully!')
  console.log('\nCreated conversations:')
  console.log(
    `1. ${conversation1.id} - Quantum Computing (completed, ${conversation1.messages.length} messages)`
  )
  console.log(
    `2. ${conversation2.id} - AI in Software Development (processing, ${conversation2.messages.length} messages)`
  )
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
