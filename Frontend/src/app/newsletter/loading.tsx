export default function NewsletterLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 48px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "32px",
          alignItems: "start"
        }}>
          {/* Main article skeleton */}
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            overflow: "hidden"
          }}>
            {/* Hero skeleton */}
            <div style={{
              height: "480px",
              background: "linear-gradient(135deg, #0d4016, #146321)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                animation: "shimmer 1.8s infinite"
              }} />
              <div style={{
                position: "absolute",
                bottom: "56px",
                left: "56px",
                right: "56px"
              }}>
                <div style={{ width: "140px", height: "24px", borderRadius: "9999px", background: "rgba(255,255,255,0.15)", marginBottom: "16px" }} />
                <div style={{ width: "80%", height: "40px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", marginBottom: "12px" }} />
                <div style={{ width: "60%", height: "40px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", marginBottom: "24px" }} />
                <div style={{ width: "50%", height: "18px", borderRadius: "4px", background: "rgba(255,255,255,0.1)" }} />
              </div>
            </div>

            {/* Body skeleton */}
            <div style={{ padding: "56px" }}>
              {[100, 90, 95, 85, 100, 75, 90, 80].map((w, i) => (
                <div key={i} style={{
                  height: "18px",
                  width: `${w}%`,
                  borderRadius: "4px",
                  background: "#f3f4f6",
                  marginBottom: "14px"
                }} />
              ))}
              <div style={{ height: "80px", borderRadius: "12px", background: "#f0faf1", margin: "32px 0", border: "1px solid #d1fae5" }} />
              {[100, 88, 92, 70].map((w, i) => (
                <div key={i} style={{
                  height: "18px",
                  width: `${w}%`,
                  borderRadius: "4px",
                  background: "#f3f4f6",
                  marginBottom: "14px"
                }} />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div>
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              overflow: "hidden"
            }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "140px", height: "20px", borderRadius: "4px", background: "#f3f4f6" }} />
                <div style={{ width: "60px", height: "16px", borderRadius: "4px", background: "#f3f4f6" }} />
              </div>
              <div style={{ padding: "10px 24px 12px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: "180px", height: "14px", borderRadius: "4px", background: "#f3f4f6" }} />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 24px" }}>
                  <div style={{ width: "48px", height: "52px", borderRadius: "8px", background: "#f3f4f6", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "14px", borderRadius: "4px", background: "#f3f4f6", marginBottom: "6px", width: "80%" }} />
                    <div style={{ height: "12px", borderRadius: "4px", background: "#f3f4f6", width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @media (max-width: 1024px) {
          .nl-loading-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
