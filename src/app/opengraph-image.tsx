import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const dynamic = 'force-static'
 
export const alt = 'Quillaborn - Creative Hub for Artists & Writers'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #111827, #1f2937)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(to bottom right, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: 'white',
              marginRight: '20px',
            }}
          >
            Q
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Quillaborn
          </span>
        </div>
        
        {/* Main text */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            margin: '0 0 20px 0',
            lineHeight: '1.2',
          }}
        >
          IMAGINE A PLACE...
        </h1>
        
        <h2
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #10b981, #059669)',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            margin: '0 0 30px 0',
          }}
        >
          for creators
        </h2>
        
        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#9ca3af',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.5',
          }}
        >
          Collaborate. Create. Connect.
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
} 