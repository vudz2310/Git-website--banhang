import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { ProductService } from '../assets/api/productService';
import { BannerService } from '../assets/api/bannerService';
import type { Banner } from '../assets/api/bannerService';
import type { Product } from '../assets/api/types';
import { 
  FlameIcon, 
  NewIcon, 
  StarIcon, 
  PhoneDeviceIcon, 
  LaptopIcon, 
  TabletIcon, 
  HeadphoneIcon, 
  PlugIcon, 
  HomeIcon 
} from '../components/Icons';

const Home: React.FC = () => {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await BannerService.getActive();
        if (res.success && res.data.length > 0) {
          setBanners(res.data);
        }
      } catch (err) {
        console.error('Failed to load active banners:', err);
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    if (settings) {
      document.title = settings.general.seo_title || settings.general.site_name;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settings.general.seo_description);
    }
  }, [settings]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Load featured products (using getList for now)
        const featuredResponse = await ProductService.getList(1, 8);
        setFeaturedProducts(featuredResponse.data || []);

        // Load new products
        const newResponse = await ProductService.getList(1, 8);
        setNewProducts(newResponse.data || []);

        // Load top rated products
        const topRatedResponse = await ProductService.getList(1, 8);
        setTopRatedProducts(topRatedResponse.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, []);

  const categories = [
    { name: 'Hot Deals', icon: <FlameIcon className="w-5 h-5 text-orange-600" />, link: '/products?hot=true' },
    { name: 'Sản phẩm mới', icon: <NewIcon className="w-5 h-5 text-blue-600" />, link: '/products?new=true' },
    { name: 'Đánh giá cao', icon: <StarIcon className="w-5 h-5 text-yellow-600" />, link: '/products?rating=4' },
    { name: 'Điện thoại', icon: <PhoneDeviceIcon className="w-5 h-5" />, link: '/products?category=phone' },
    { name: 'Laptop', icon: <LaptopIcon className="w-5 h-5" />, link: '/products?category=laptop' },
    { name: 'Tablet', icon: <TabletIcon className="w-5 h-5" />, link: '/products?category=tablet' },
    { name: 'Tai nghe', icon: <HeadphoneIcon className="w-5 h-5" />, link: '/products?category=headphone' },
    { name: 'Phụ kiện', icon: <PlugIcon className="w-5 h-5" />, link: '/products?category=accessories' },
    { name: 'Tất cả', icon: <HomeIcon className="w-5 h-5" />, link: '/products' },
  ];

  const formatPrice = (amount: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getProductImage = (product: Product) => {
    // Ảnh đã được backend trả về full URL; nếu không có ảnh thì dùng logo mặc định
    // Lưu ý: '/vite.svg' luôn tồn tại trong thư mục public nên sẽ không bị lỗi 404
    return product.product_img || '/vite.svg';
  };

  const getProductPrice = (product: Product) => {
    if (product.price && product.price.min != null) {
      return Number(product.price.min);
    }
    return 0;
  };

  const getOriginalPrice = (product: Product) => {
    if (product.price?.compare_min != null) {
      return Number(product.price.compare_min);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Carousel or Hero Section Fallback */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden w-full h-[320px] md:h-[480px] bg-gray-900 group animate-fadeIn">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${banners.length * 100}%` }}
          >
            {banners.map((banner) => (
              <div key={banner._id} className="relative w-full h-full flex-shrink-0">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-16 text-white">
                  <h2 className="text-xl md:text-4xl font-extrabold mb-2 md:mb-4 tracking-tight drop-shadow-md">{banner.title}</h2>
                  {banner.redirectUrl && (
                    <Link 
                      to={banner.redirectUrl} 
                      className="inline-block self-start px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Khám phá ngay
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 font-bold text-lg"
              >
                &#10094;
              </button>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 font-bold text-lg"
              >
                &#10095;
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-blue-600 w-6' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Chào mừng đến với {settings.general.site_name}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-2">
              {settings.general.seo_description}
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Mua sắm ngay
            </Link>
          </div>
        </section>
      )}

      {/* Categories - ẩn trên màn hình điện thoại */}
      <section className="hidden md:block py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Sản phẩm nổi bật</h2>
              <Link to="/products?featured=true" className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
                Xem tất cả 
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.endsWith('/vite.svg')) return; // tránh loop vô hạn
                          img.src = '/vite.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(getProductPrice(product))}
                        </span>
                        {getOriginalPrice(product) && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(getOriginalPrice(product)!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Sản phẩm mới</h2>
              <Link to="/products?new=true" className="text-blue-600 hover:text-blue-800 font-medium">
                Xem tất cả 
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.endsWith('/vite.svg')) return;
                          img.src = '/vite.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(getProductPrice(product))}
                        </span>
                        {getOriginalPrice(product) && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(getOriginalPrice(product)!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Products */}
      {topRatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Sản phẩm đánh giá cao</h2>
              <Link to="/products?rating=4" className="text-blue-600 hover:text-blue-800 font-medium">
                Xem tất cả 
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRatedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.endsWith('/vite.svg')) return;
                          img.src = '/vite.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(getProductPrice(product))}
                        </span>
                        {getOriginalPrice(product) && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(getOriginalPrice(product)!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng mua sắm?</h2>
          <p className="text-xl mb-8">Khám phá hàng ngàn sản phẩm chất lượng cao với giá cả tốt nhất</p>
          <Link 
            to="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
