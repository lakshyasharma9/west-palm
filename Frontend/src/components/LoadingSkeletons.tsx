export function MarqueeSkeleton() {
  return (
    <div 
      className="overflow-hidden py-10 border-y border-[rgba(20,99,33,0.1)]"
      style={{ background: "#D4AF37", height: "100px" }}
    >
      <div className="flex items-center justify-center">
        <div className="animate-pulse text-white/50 text-sm font-semibold">
          Loading technologies...
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <section style={{ backgroundColor: '#F8FAF8', paddingTop: '80px', paddingBottom: '40px', marginTop: '60px', marginBottom: '40px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '80px', paddingRight: '80px' }}>
        <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 border-4 border-[#146321] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#146321] font-semibold text-sm">Loading clients...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
