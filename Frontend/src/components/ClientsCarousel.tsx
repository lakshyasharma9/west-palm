"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import OptimizedImage from '@/components/OptimizedImage';
import 'swiper/css';

const ClientsCarousel = () => {
  // First row logos (1-6)
  const topRowLogos = [
    '/Clients/1.jpg',
    '/Clients/2.jpg',
    '/Clients/3.jpg',
    '/Clients/4.jpg',
    '/Clients/5.jpg',
    '/Clients/6.jpg',
  ];

  // Second row logos (7-12)
  const bottomRowLogos = [
    '/Clients/7.jpg',
    '/Clients/8.jpg',
    '/Clients/9.jpg',
    '/Clients/10.jpg',
    '/Clients/11.jpg',
    '/Clients/12.jpg',
  ];

  return (
    <section style={{ backgroundColor: '#F8FAF8', paddingTop: '80px', paddingBottom: '40px', marginTop: '60px', marginBottom: '40px', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: 'clamp(20px, 5vw, 80px)', paddingRight: 'clamp(20px, 5vw, 80px)' }}>
        <div className="flex flex-col md:flex-row items-center md:items-start" style={{ gap: 'clamp(32px, 6vw, 80px)' }}>
          
          {/* Left Side - Title */}
          <div className="flex-shrink-0 w-full md:w-[350px] text-center md:text-left">
            <h2 
              style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(36px, 10vw, 70px)',
                fontWeight: 500,
                lineHeight: 0.9,
                color: '#0d1f0d',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              TRUSTED BY
            </h2>
            <p style={{ 
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              color: '#666666',
              textTransform: 'uppercase',
              lineHeight: 1.4
            }}>
              INDUSTRY LEADERS
            </p>
          </div>

          {/* Right Side - Carousel */}
          <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Top Row - Left to Right */}
              <div className="h-[80px] sm:h-[100px]">
                <Swiper
                  modules={[Autoplay]}
                  slidesPerView={3}
                  spaceBetween={12}
                  breakpoints={{
                    480: { slidesPerView: 3, spaceBetween: 16 },
                    768: { slidesPerView: 4, spaceBetween: 24 },
                  }}
                  loop={true}
                  autoplay={{
                    delay: 0,
                    disableOnInteraction: false,
                  }}
                  speed={3000}
                  style={{ height: '100%' }}
                >
                  {topRowLogos.map((logo, index) => (
                    <SwiperSlide key={index}>
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}>
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <OptimizedImage
                            src={logo}
                            alt={`Client ${index + 1}`}
                            fill
                            style={{ objectFit: 'contain', padding: '8px' }}
                            sizes="25vw"
                            loading={index < 4 ? 'eager' : 'lazy'}
                            priority={index < 4}
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Bottom Row - Right to Left */}
              <div className="h-[80px] sm:h-[100px]">
                <Swiper
                  modules={[Autoplay]}
                  slidesPerView={3}
                  spaceBetween={12}
                  breakpoints={{
                    480: { slidesPerView: 3, spaceBetween: 16 },
                    768: { slidesPerView: 4, spaceBetween: 24 },
                  }}
                  loop={true}
                  autoplay={{
                    delay: 0,
                    disableOnInteraction: false,
                    reverseDirection: true,
                  }}
                  speed={3000}
                  style={{ height: '100%' }}
                >
                  {bottomRowLogos.map((logo, index) => (
                    <SwiperSlide key={index}>
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}>
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <OptimizedImage
                            src={logo}
                            alt={`Client ${index + 7}`}
                            fill
                            style={{ objectFit: 'contain', padding: '8px' }}
                            sizes="25vw"
                            loading={index < 4 ? 'eager' : 'lazy'}
                            priority={index < 4}
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
